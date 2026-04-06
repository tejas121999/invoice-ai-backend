/**
 * Placeholder for human-in-the-loop review persistence (e.g. PostgreSQL later).
 */
async function applyReviewUpdate(invoiceId, body) {
  return {
    invoiceId,
    reviewedAt: new Date().toISOString(),
    corrections: body && typeof body === 'object' ? body : {},
    note: 'MVP placeholder — persist review in database later',
  };
}

async function getModulePlaceholder() {
  return {
    module: 'review',
    ready: false,
    note: 'Use PUT /api/invoices/:id/review for review flow',
  };
}

module.exports = {
  applyReviewUpdate,
  getModulePlaceholder,
};
