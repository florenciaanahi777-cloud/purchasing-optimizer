import { CheckCircle2 } from 'lucide-react'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ title?: string }>
}

export default async function QuoteSubmittedPage({ searchParams }: Props) {
  const { title } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center space-y-4">
        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />

        <div className="space-y-1">
          <h1 className="text-base font-semibold">Quote submitted</h1>
          {title && (
            <p className="text-sm text-muted-foreground">{title}</p>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          The buyer will review all quotes and may contact you if they have questions.
        </p>
      </div>
    </div>
  )
}
