import { createClient } from '@/lib/supabase/server'
import { RFQWorkflowStepper } from '@/components/rfq/rfq-workflow-stepper'
import type { RFQStatus } from '@/types'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function RFQLayout({ children, params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()
    : { data: null }

  const { data: rfq } = profile
    ? await supabase
        .from('rfqs')
        .select('status')
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single()
    : { data: null }

  return (
    <div>
      {rfq && (
        <RFQWorkflowStepper status={rfq.status as RFQStatus} />
      )}
      {children}
    </div>
  )
}
