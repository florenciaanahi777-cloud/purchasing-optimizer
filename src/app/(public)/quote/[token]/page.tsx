import { getRFQByToken } from '@/actions/quotes'
import { QuoteForm } from '@/components/quotes/quote-form'
import { AlertCircle } from 'lucide-react'

interface Props {
  params: Promise<{ token: string }>
}

export default async function QuoteFormPage({ params }: Props) {
  const { token } = await params
  const data = await getRFQByToken(token)

  // Invalid or expired token
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <h1 className="text-base font-semibold">Link not found</h1>
          <p className="text-sm text-muted-foreground">
            This quote link is invalid or has expired.
            Contact the buyer to request a new one.
          </p>
        </div>
      </div>
    )
  }

  return <QuoteForm token={token} data={data} />
}
