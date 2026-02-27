import { notFound } from 'next/navigation'
import { getSupplier } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { SupplierEditForm } from '@/components/suppliers/supplier-edit-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailPage({ params }: Props) {
  const { id } = await params
  const supplier = await getSupplier(id)

  if (!supplier) notFound()

  return (
    <div>
      <PageHeader
        title={supplier.name}
        description="Edit supplier details."
        backHref="/suppliers"
        backLabel="Suppliers"
      />
      <SupplierEditForm supplier={supplier} />
    </div>
  )
}
