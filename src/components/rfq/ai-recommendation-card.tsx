'use client'

import { useState, useTransition } from 'react'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAIRecommendation } from '@/actions/ai'

interface AIRecommendationCardProps {
  rfqId: string
  onRecommendation?: (text: string) => void  // pass up to decision form
}

type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; text: string }
  | { type: 'error'; message: string }

export function AIRecommendationCard({ rfqId, onRecommendation }: AIRecommendationCardProps) {
  const [state, setState] = useState<State>({ type: 'idle' })
  const [isPending, startTransition] = useTransition()

  function handleRequest() {
    setState({ type: 'loading' })
    startTransition(async () => {
      const result = await getAIRecommendation(rfqId)
      if (result.error) {
        setState({ type: 'error', message: result.error })
      } else {
        setState({ type: 'success', text: result.recommendation! })
        onRecommendation?.(result.recommendation!)
      }
    })
  }

  // ── Idle: prompt ─────────────────────────────────────────────────────────
  if (state.type === 'idle') {
    return (
      <div className="border border-border rounded-md px-4 py-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Recommendation
          </p>
          <p className="text-xs text-muted-foreground">
            Claude will analyze all quotes and suggest the best option with a plain-language explanation.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRequest} disabled={isPending}>
          Get recommendation
        </Button>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (state.type === 'loading') {
    return (
      <div className="border border-border rounded-md px-4 py-4 flex items-center gap-3">
        <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Analyzing quotes…</p>
      </div>
    )
  }

  // ── Error / fallback ──────────────────────────────────────────────────────
  if (state.type === 'error') {
    return (
      <div className="border border-border rounded-md px-4 py-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Recommendation
        </p>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-7"
          onClick={handleRequest}
          disabled={isPending}
        >
          Try again
        </Button>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className="border border-primary/20 bg-primary/5 rounded-md px-4 py-4 space-y-3">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        AI Recommendation
      </p>
      <p className="text-sm leading-relaxed">{state.text}</p>
      <p className="text-xs text-muted-foreground">
        This is a suggestion based on the quotes above. The final decision is yours.
      </p>
    </div>
  )
}
