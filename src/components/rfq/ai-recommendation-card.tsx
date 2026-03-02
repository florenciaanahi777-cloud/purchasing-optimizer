'use client'

import { useState, useTransition } from 'react'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAIRecommendation } from '@/actions/ai'
import { useT } from '@/lib/locale-context'

interface AIRecommendationCardProps {
  rfqId: string
  onRecommendation?: (text: string) => void
}

type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; text: string }
  | { type: 'error'; message: string }

export function AIRecommendationCard({ rfqId, onRecommendation }: AIRecommendationCardProps) {
  const t = useT()
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

  if (state.type === 'idle') {
    return (
      <div className="border border-border rounded-md px-4 py-4 space-y-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t.ai_title}
          </p>
          <p className="text-xs text-muted-foreground">{t.ai_desc}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRequest} disabled={isPending} className="w-full">
          {t.ai_get}
        </Button>
      </div>
    )
  }

  if (state.type === 'loading') {
    return (
      <div className="border border-border rounded-md px-4 py-4 flex items-center gap-3">
        <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">{t.ai_analyzing}</p>
      </div>
    )
  }

  if (state.type === 'error') {
    return (
      <div className="border border-border rounded-md px-4 py-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t.ai_title}
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
          {t.ai_retry}
        </Button>
      </div>
    )
  }

  return (
    <div className="border border-primary/20 bg-primary/5 rounded-md px-4 py-4 space-y-3">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        {t.ai_title}
      </p>
      <p className="text-sm leading-relaxed">{state.text}</p>
      <p className="text-xs text-muted-foreground">{t.ai_disclaimer}</p>
    </div>
  )
}
