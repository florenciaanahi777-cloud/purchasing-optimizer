const en = {
  // Navigation
  nav_dashboard: 'Dashboard',
  nav_suppliers: 'Suppliers',
  nav_history: 'History',
  toggle_menu: 'Toggle menu',

  // User menu
  language: 'Language',
  sign_out: 'Sign out',

  // Common
  optional: 'optional',
  cancel: 'Cancel',
  saving: 'Saving…',
  confirm: 'Confirm',
  delete_q: 'Delete?',
  email: 'Email',
  notes: 'Notes',
  company_name: 'Company name',
  contact_name: 'Contact name',
  save_changes: 'Save changes',
  description: 'Description',

  // Supplier list
  suppliers_empty_title: 'No suppliers saved yet.',
  suppliers_empty_desc: 'Add your first supplier to reuse them across RFQs.',
  add_supplier: 'Add supplier',
  search_suppliers: 'Search suppliers…',
  suppliers_no_results: 'No suppliers match',
  col_company: 'Company',
  col_email: 'Email',
  col_contact: 'Contact',
  supplier_deleted: 'Supplier deleted.',
  supplier_updated: 'Supplier updated.',
  supplier_added_suffix: 'added to your supplier directory.',

  // RFQ form
  rfq_title_label: 'Title',
  rfq_deadline: 'Response deadline',
  rfq_notes: 'Notes',
  line_items: 'Line items',
  line_items_desc: 'List every product or SKU you need suppliers to quote on.',
  sku: 'SKU',
  unit: 'Unit',
  qty: 'Qty',
  add_item: 'Add item',
  rfq_suppliers_label: 'Suppliers',
  rfq_suppliers_desc: 'Select who should receive this RFQ. Required to send, optional for drafts.',
  save_as_draft: 'Save as draft',
  send_to_suppliers: 'Request Quotes',
  sending: 'Sending…',
  rfq_draft_saved: 'RFQ saved as draft.',
  rfq_sent_to: 'RFQ sent to',
  rfq_sent_supplier: 'supplier',
  rfq_sent_suppliers: 'suppliers',

  // AI card
  ai_title: 'AI Recommendation',
  ai_desc: 'Claude will analyze all quotes and suggest the best option with a plain-language explanation.',
  ai_get: 'Get recommendation',
  ai_analyzing: 'Analyzing quotes…',
  ai_retry: 'Try again',
  ai_disclaimer: 'This is a suggestion based on the quotes above. The final decision is yours.',

  // Decision form
  select_supplier_label: 'Select winning supplier',
  select_supplier_desc: 'Only suppliers who have submitted a quote can be selected.',
  no_quotes_yet: 'No quotes have been submitted yet.',
  decision_reason_label: 'Decision reason',
  decision_reason_desc: 'This will be saved with the decision record. Be specific enough to justify the choice later.',
  confirm_decision: 'Confirm Decision',
  decision_recorded: 'Decision recorded.',

  // Compare / decide layout
  received_quotes: 'Received quotes',
  decision_recorded_title: 'Decision recorded',
  no_quotes_submitted: 'No quotes submitted yet.',
  selected_supplier: 'Selected supplier',
  total_label: 'Total:',
  no_quote_submitted: 'No quote submitted',
  avg_delivery: 'Avg delivery:',
  ai_advisory: 'AI suggestion — you may edit or ignore it.',
  record_decision: 'Record decision',
  select_to_continue: 'Select a supplier to continue.',
  add_reason: 'Add a reason for this decision.',
  decision: 'Decision',
  winner: 'Winner:',
  none_selected: 'None selected',

  // Branding / renamed
  ai_recommendation: 'PDO Insight',
  compare_and_decide: 'Compare & Choose',
  create_request: 'New Purchase Request',
  analyzing: 'Analyzing quotes…',
  no_quotes: 'No quotes received yet',
} as const

export default en
