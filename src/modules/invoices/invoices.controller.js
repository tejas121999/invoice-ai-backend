const { successResponse } = require('../../utils/response');
const invoicesService = require('./invoices.service');

async function uploadInvoice(req, res) {
  const uploadedBy = req.user?.id ?? null;
  const data = await invoicesService.registerUploadFromFile(req.file, { uploadedBy });
  return successResponse(res, data, 'Invoice uploaded successfully', 201);
}

async function listInvoices(req, res) {
  const data = await invoicesService.listInvoices(req.query);
  const message =
    data.length === 0 ? 'No invoices found' : 'Invoices fetched successfully';
  return successResponse(res, data, message);
}

async function getInvoice(req, res) {
  const data = await invoicesService.getInvoiceById(req.params.id);
  return successResponse(res, data, 'Invoice retrieved');
}

async function processInvoice(req, res) {
  const data = await invoicesService.processInvoice(req.params.id);
  return successResponse(res, data, 'Invoice processing triggered successfully');
}

async function getResult(req, res) {
  const data = await invoicesService.getProcessResult(req.params.id);
  return successResponse(res, data, 'Extraction result (placeholder)');
}

async function reviewInvoice(req, res) {
  const data = await invoicesService.submitReview(req.params.id, req.body || {});
  return successResponse(res, data, 'Review saved (placeholder persistence)');
}

async function getAudit(req, res) {
  const data = await invoicesService.getInvoiceAudit(req.params.id);
  return successResponse(res, data, 'Audit trail retrieved');
}

module.exports = {
  uploadInvoice,
  listInvoices,
  getInvoice,
  processInvoice,
  getResult,
  reviewInvoice,
  getAudit,
};
