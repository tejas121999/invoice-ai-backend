/**
 * Placeholder for future Python OCR / AI extraction integration.
 * Called from invoices when processing an invoice.
 */
async function queueExtractionJob(invoiceId) {
  const jobId = `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    invoiceId,
    jobId,
    status: 'queued',
    message: 'Extraction job queued (MVP placeholder — connect OCR worker here)',
  };
}

async function getExtractionStatus(invoiceId) {
  return {
    invoiceId,
    status: 'pending',
    rawText: null,
    structuredFields: null,
    note: 'MVP placeholder until OCR pipeline is wired',
  };
}

async function getModulePlaceholder() {
  return {
    module: 'extraction',
    ready: false,
    note: 'HTTP surface reserved; invoice processing uses extraction.service internally',
  };
}

module.exports = {
  queueExtractionJob,
  getExtractionStatus,
  getModulePlaceholder,
};
