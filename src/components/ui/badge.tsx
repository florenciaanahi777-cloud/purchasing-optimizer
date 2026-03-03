import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:     "bg-[--pdo-insight-bg] text-[--pdo-insight] border border-[--pdo-insight]/30 font-medium",
        secondary:   "bg-secondary text-secondary-foreground border border-border font-medium",
        destructive: "bg-[oklch(0.22_0.06_27)] text-[oklch(0.75_0.18_27)] border border-[oklch(0.75_0.18_27)]/30 font-medium",
        outline:     "bg-transparent border border-border text-foreground font-medium",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link:  "text-primary underline-offset-4 [a&]:hover:underline",
        // Status variants
        open:      "bg-[oklch(0.20_0.05_240)] text-[oklch(0.75_0.15_240)] border border-[oklch(0.75_0.15_240)]/30 font-medium",
        decided:   "bg-[--success-bg] text-[--success] border border-[--success]/30 font-medium",
        pending:   "bg-[--warning-bg] text-[--warning] border border-[--warning]/30 font-medium",
        draft:     "bg-secondary text-muted-foreground border border-border font-medium",
        cancelled: "bg-[oklch(0.18_0_0)] text-muted-foreground border border-border font-medium line-through",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
