import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RFQStatus } from '@/types'

const steps = [
  'Create request',
  'Send to suppliers',
  'Compare & decide',
]

const statusToStep: Record<RFQStatus, number> = {
  draft:     1,
  open:      2,
  comparing: 3,
  decided:   4,
}

export function RFQWorkflowStepper({ status }: { status: RFQStatus }) {
  const active = statusToStep[status]

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const step = i + 1
        const completed = step < active
        const current   = step === active

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            {/* Step */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium border',
                  completed && 'bg-primary border-primary text-primary-foreground',
                  current   && 'border-primary text-primary bg-background',
                  !completed && !current && 'border-border text-muted-foreground bg-background'
                )}
              >
                {completed ? <Check className="h-3 w-3" /> : step}
              </span>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  current   && 'text-foreground font-medium',
                  completed && 'text-muted-foreground',
                  !completed && !current && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector — not after last step */}
            {step < steps.length && (
              <div
                className={cn(
                  'flex-1 h-px mx-3',
                  completed ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
