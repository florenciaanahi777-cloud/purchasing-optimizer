import type en from './en'

const es: { [K in keyof typeof en]: string } = {
  // Navigation
  nav_dashboard: 'Inicio',
  nav_suppliers: 'Proveedores',
  nav_history: 'Historial',
  toggle_menu: 'Abrir menú',

  // User menu
  language: 'Idioma',
  sign_out: 'Cerrar sesión',

  // Common
  optional: 'opcional',
  cancel: 'Cancelar',
  saving: 'Guardando…',
  confirm: 'Confirmar',
  delete_q: '¿Eliminar?',
  email: 'Email',
  notes: 'Notas',
  company_name: 'Nombre de empresa',
  contact_name: 'Nombre de contacto',
  save_changes: 'Guardar cambios',
  description: 'Descripción',

  // Supplier list
  suppliers_empty_title: 'No hay proveedores guardados.',
  suppliers_empty_desc: 'Agregá tu primer proveedor para reutilizarlo en solicitudes.',
  add_supplier: 'Agregar proveedor',
  search_suppliers: 'Buscar proveedores…',
  suppliers_no_results: 'Ningún proveedor coincide con',
  col_company: 'Empresa',
  col_email: 'Email',
  col_contact: 'Contacto',
  supplier_deleted: 'Proveedor eliminado.',
  supplier_updated: 'Proveedor actualizado.',
  supplier_added_suffix: 'fue agregado al directorio de proveedores.',

  // RFQ form
  rfq_title_label: 'Título',
  rfq_deadline: 'Fecha límite de respuesta',
  rfq_notes: 'Notas',
  line_items: 'Ítems',
  line_items_desc: 'Listá cada producto o SKU que necesitás cotizar.',
  sku: 'SKU',
  unit: 'Unidad',
  qty: 'Cant.',
  add_item: 'Agregar ítem',
  rfq_suppliers_label: 'Proveedores',
  rfq_suppliers_desc: 'Seleccioná quiénes recibirán esta solicitud. Requerido para enviar, opcional para borradores.',
  save_as_draft: 'Guardar borrador',
  send_to_suppliers: 'Solicitar cotizaciones',
  sending: 'Enviando…',
  rfq_draft_saved: 'Solicitud guardada como borrador.',
  rfq_sent_to: 'Solicitud enviada a',
  rfq_sent_supplier: 'proveedor',
  rfq_sent_suppliers: 'proveedores',

  // AI card
  ai_title: 'Recomendación IA',
  ai_desc: 'Claude analizará todas las cotizaciones y sugerirá la mejor opción con una explicación clara.',
  ai_get: 'Obtener recomendación',
  ai_analyzing: 'Analizando cotizaciones…',
  ai_retry: 'Intentar de nuevo',
  ai_disclaimer: 'Esta es una sugerencia basada en las cotizaciones. La decisión final es tuya.',

  // Decision form
  select_supplier_label: 'Seleccionar proveedor ganador',
  select_supplier_desc: 'Solo se pueden seleccionar proveedores que enviaron una cotización.',
  no_quotes_yet: 'Aún no hay cotizaciones enviadas.',
  decision_reason_label: 'Motivo de la decisión',
  decision_reason_desc: 'Se guardará con el registro. Sé específico para justificar la elección más adelante.',
  confirm_decision: 'Confirmar decisión',
  decision_recorded: 'Decisión registrada.',

  // Compare / decide layout
  received_quotes: 'Cotizaciones recibidas',
  decision_recorded_title: 'Decisión registrada',
  no_quotes_submitted: 'Aún no hay cotizaciones.',
  selected_supplier: 'Proveedor seleccionado',
  total_label: 'Total:',
  no_quote_submitted: 'Sin cotización enviada',
  avg_delivery: 'Entrega prom.:',
  ai_advisory: 'Sugerencia de IA — podés editarla o ignorarla.',
  record_decision: 'Registrar decisión',
  select_to_continue: 'Seleccioná un proveedor para continuar.',
  add_reason: 'Agregá un motivo para esta decisión.',
  decision: 'Decisión',
  winner: 'Ganador:',
  none_selected: 'Ninguno seleccionado',

  // Branding / renamed
  ai_recommendation: 'PDO Insight',
  compare_and_decide: 'Comparar y elegir',
  create_request: 'Nueva solicitud de compra',
  analyzing: 'Analizando cotizaciones…',
  no_quotes: 'Aún no hay cotizaciones recibidas',
}

export default es
