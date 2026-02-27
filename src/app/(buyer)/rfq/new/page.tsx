import { getSuppliers } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { RFQForm } from '@/components/rfq/rfq-form'

export default async function NewRFQPage() {
  // Suppliers fetched server-side so the form can show the directory immediately
  const suppliers = await getSuppliers()

  return (
    <div>
      <PageHeader
        title="New RFQ"
        description="Fill in the details, add line items, and select suppliers."
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <RFQForm initialSuppliers={suppliers} />
    </div>
  )
}
