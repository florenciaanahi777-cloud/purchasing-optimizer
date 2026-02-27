import { getSuppliers } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { SupplierList } from '@/components/suppliers/supplier-list'

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Your organization's reusable supplier directory."
      />
      <SupplierList suppliers={suppliers} />
    </div>
  )
}
