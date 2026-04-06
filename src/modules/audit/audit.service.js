/**
 * Placeholder for audit trail storage (e.g. PostgreSQL later).
 */

const auditLogByInvoiceId = new Map();

function appendEntry(invoiceId, action, meta = {}) {
  if (!auditLogByInvoiceId.has(invoiceId)) {
    auditLogByInvoiceId.set(invoiceId, []);
  }
  const entry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    invoiceId,
    action,
    meta,
    at: new Date().toISOString(),
  };
  auditLogByInvoiceId.get(invoiceId).push(entry);
  return entry;
}

async function listAuditForInvoice(invoiceId) {
  const entries = auditLogByInvoiceId.get(invoiceId) || [];
  return { invoiceId, entries };
}

async function getModulePlaceholder() {
  return {
    module: 'audit',
    ready: false,
    note: 'Use GET /api/invoices/:id/audit for per-invoice audit trail',
  };
}

module.exports = {
  appendEntry,
  listAuditForInvoice,
  getModulePlaceholder,
};
