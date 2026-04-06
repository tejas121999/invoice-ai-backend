const AppError = require('../../common/AppError');
const { generateId } = require('../../utils/generateId');
const extractionService = require('../extraction/extraction.service');
const reviewService = require('../review/review.service');
const auditService = require('../audit/audit.service');

/** @type {Map<string, object>} */
const invoicesById = new Map();

function toPublicInvoice(record) {
  const { ...rest } = record;
  return rest;
}

async function registerUpload(payload) {
  const id = generateId('inv');
  const fileName =
    payload && typeof payload.fileName === 'string'
      ? payload.fileName
      : payload && typeof payload.name === 'string'
        ? payload.name
        : null;

  const record = {
    id,
    fileName,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
    extractionJob: null,
    extractionResult: null,
    review: null,
  };

  invoicesById.set(id, record);
  await auditService.appendEntry(id, 'invoice.uploaded', { fileName });

  return toPublicInvoice(record);
}

async function listInvoices() {
  const items = Array.from(invoicesById.values()).map(toPublicInvoice);
  return { items, count: items.length };
}

async function getInvoiceById(id) {
  const record = invoicesById.get(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }
  return toPublicInvoice(record);
}

async function processInvoice(id) {
  const record = invoicesById.get(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  record.status = 'processing';
  const job = await extractionService.queueExtractionJob(id);
  record.extractionJob = job;

  await auditService.appendEntry(id, 'invoice.process_started', { jobId: job.jobId });

  return {
    invoice: toPublicInvoice(record),
    job,
  };
}

async function getProcessResult(id) {
  const record = invoicesById.get(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const extraction = await extractionService.getExtractionStatus(id);

  return {
    invoiceId: id,
    invoiceStatus: record.status,
    extractionJob: record.extractionJob,
    extraction,
  };
}

async function submitReview(id, body) {
  const record = invoicesById.get(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const review = await reviewService.applyReviewUpdate(id, body);
  record.review = review;
  record.status = 'reviewed';

  await auditService.appendEntry(id, 'invoice.reviewed', { reviewId: review.reviewedAt });

  return {
    invoice: toPublicInvoice(record),
    review,
  };
}

async function getInvoiceAudit(id) {
  const record = invoicesById.get(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const trail = await auditService.listAuditForInvoice(id);
  return trail;
}

module.exports = {
  registerUpload,
  listInvoices,
  getInvoiceById,
  processInvoice,
  getProcessResult,
  submitReview,
  getInvoiceAudit,
};
