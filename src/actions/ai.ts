'use server'

import { getComparisonData } from './rfqs'
import type { ComparisonData } from '@/types'

// ─── Build prompt from comparison data ───────────────────────────────────────

function buildPrompt(data: ComparisonData): string {
  const submittedColumns = data.columns.filter(c => c.quote !== null)

  if (submittedColumns.length === 0) {
    return ''
  }

  const itemLines = data.items
    .map(item => `- ${item.description} (${item.quantity} ${item.unit})`)
    .join('\n')

  const quoteLines = submittedColumns
    .map(col => {
      const q = col.quote!
      const itemDetails = data.items
        .map(item => {
          const price = q.itemPrices[item.id]
          if (!price) return `  · ${item.description}: not quoted`
          const delivery = price.deliveryDays != null ? `, ${price.deliveryDays} days delivery` : ''
          return `  · ${item.description}: $${price.unitPrice.toFixed(2)}/unit, total $${price.totalPrice.toFixed(2)}${delivery}`
        })
        .join('\n')

      return `${col.supplierName} (total: $${q.totalValue.toFixed(2)})\n${itemDetails}${q.notes ? `\n  Note: ${q.notes}` : ''}`
    })
    .join('\n\n')

  return `You are helping a hospital procurement buyer compare supplier quotes.

RFQ: "${data.rfq.title}"
Deadline: ${data.rfq.deadline}

Items requested:
${itemLines}

Supplier quotes received:
${quoteLines}

Please provide a concise recommendation (3–5 sentences max):
1. Name the best overall supplier and why
2. Mention any relevant trade-offs (price vs. delivery time, item-level differences)
3. If suppliers are close, say so

Start directly with the recommendation. No preamble. Use plain language — this is for a busy procurement professional.`
}

// ─── Call Claude API ──────────────────────────────────────────────────────────

export async function getAIRecommendation(
  rfqId: string
): Promise<{ recommendation?: string; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('your-')) {
    return { error: 'AI recommendations are not configured.' }
  }

  try {
    const data = await getComparisonData(rfqId)
    if (!data) return { error: 'RFQ not found.' }

    const submittedCount = data.columns.filter(c => c.quote !== null).length
    if (submittedCount === 0) return { error: 'No quotes submitted yet.' }

    const prompt = buildPrompt(data)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('[AI] API error:', response.status, await response.text())
      return { error: 'AI service unavailable. You can still decide manually.' }
    }

    const json = await response.json()
    const recommendation = json?.content?.[0]?.text as string | undefined

    if (!recommendation) {
      return { error: 'No recommendation returned. You can still decide manually.' }
    }

    return { recommendation }
  } catch (e) {
    console.error('[AI] Error:', e)
    return { error: 'AI service unavailable. You can still decide manually.' }
  }
}
