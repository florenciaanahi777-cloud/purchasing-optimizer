// ─── Database entity types ────────────────────────────────────────────────────

export type RFQStatus = 'draft' | 'open' | 'comparing' | 'decided'
export type RFQSupplierStatus = 'invited' | 'submitted'

export interface Supplier {
  id: string
  organization_id: string
  name: string
  email: string
  contact_name: string | null
  notes: string | null
  created_at: string
}

export interface RFQ {
  id: string
  organization_id: string
  created_by: string
  title: string
  description: string | null
  deadline: string
  status: RFQStatus
  created_at: string
  updated_at: string
}

export interface RFQItem {
  id: string
  rfq_id: string
  sku: string | null
  description: string
  unit: string
  quantity: number
  sort_order: number
}

export interface QuoteItem {
  id: string
  quote_id: string
  rfq_item_id: string
  unit_price: number
  total_price: number
  delivery_days: number | null
  notes: string | null
}

// ─── Composite view types ─────────────────────────────────────────────────────

export interface SupplierColumn {
  rfqSupplierId: string
  supplierId: string
  supplierName: string
  publicToken: string
  submissionStatus: RFQSupplierStatus
  quote: {
    id: string
    totalValue: number
    notes: string | null
    submittedAt: string
    itemPrices: Record<string, {
      unitPrice: number
      totalPrice: number
      deliveryDays: number | null
      notes: string | null
    }>
  } | null
}

export interface ComparisonData {
  rfq: RFQ
  items: RFQItem[]
  columns: SupplierColumn[]
}

export interface RFQDetail extends RFQ {
  rfq_items: RFQItem[]
  rfq_suppliers: Array<{
    id: string
    supplier_id: string
    public_token: string
    status: RFQSupplierStatus
    supplier: { id: string; name: string; email: string }
  }>
  submitted_count: number
  decision: {
    id: string
    winning_supplier_id: string
    reason: string
    ai_recommendation: string | null
    decided_at: string
    winning_supplier: { id: string; name: string; email: string }
  } | null
}

export interface RFQSummary extends RFQ {
  total_suppliers: number
  submitted_count: number
  winning_supplier_name: string | null
}

export interface DecidedRFQ {
  id: string
  title: string
  decided_at: string
  decided_by_name: string | null
  winning_supplier_name: string
  rfq_title: string
}
