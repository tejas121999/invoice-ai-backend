/**
 * Placeholder — add multer / cloud storage integration here later.
 * Invoice upload entry point is POST /api/invoices/upload (uses this service optionally).
 */
async function describeUploadCapabilities() {
  return {
    multipart: false,
    note: 'MVP placeholder — multer not installed; use invoices upload for future file handling',
  };
}

module.exports = {
  describeUploadCapabilities,
};
