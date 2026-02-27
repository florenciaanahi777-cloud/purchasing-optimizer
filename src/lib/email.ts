import { Resend } from 'resend'
import { format } from 'date-fns'

interface QuoteInvitationParams {
  to: string
  supplierName: string
  rfqTitle: string
  deadline: string       // ISO date string
  quoteUrl: string
  buyerName: string
  organizationName: string
}

export async function sendQuoteInvitation(
  params: QuoteInvitationParams
): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  // Gracefully skip if Resend is not configured
  if (!apiKey || apiKey === 'your-resend-key') {
    console.warn('[email] RESEND_API_KEY not configured — skipping email to', params.to)
    return { error: 'email_not_configured' }
  }

  const deadlineFormatted = format(new Date(params.deadline), 'MMMM d, yyyy')

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 540px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 14px; color: #555;">Quote request from <strong>${params.organizationName}</strong></p>
      <h2 style="font-size: 20px; font-weight: 600; margin: 8px 0 4px;">${params.rfqTitle}</h2>
      <p style="font-size: 14px; color: #555; margin: 0 0 24px;">
        Deadline: <strong>${deadlineFormatted}</strong>
      </p>
      <p style="font-size: 14px; margin: 0 0 24px;">
        Hi ${params.supplierName},<br/><br/>
        ${params.buyerName} has requested a quote from you. Please click the button below to
        view the item list and submit your prices.
      </p>
      <a href="${params.quoteUrl}"
         style="display: inline-block; background: #3d5a8a; color: #fff; text-decoration: none;
                padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        Submit your quote
      </a>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">
        Or copy this link: ${params.quoteUrl}
      </p>
    </div>
  `

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Quote request: ${params.rfqTitle}`,
      html,
    })

    if (error) return { error: error.message }
    return {}
  } catch (e) {
    console.error('[email] Failed to send:', e)
    return { error: 'send_failed' }
  }
}
