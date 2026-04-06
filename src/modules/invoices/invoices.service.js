const path = require('path');
const AppError = require('../../common/AppError');
const config = require('../../config');
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

async function registerUploadFromFile(file) {
  const id = generateId('inv');
  const relativePath = path.posix.join(config.uploadPath, file.filename);

  const record = {
    id,
    fileName: file.filename,
    originalName: file.originalname,
    filePath: relativePath,
    mimeType: file.mimetype,
    size: file.size,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
    extractionJob: null,
    extractionResult: null,
    review: null,
  };

  invoicesById.set(id, record);
  await auditService.appendEntry(id, 'invoice.uploaded', {
    fileName: file.filename,
    originalName: file.originalname,
    filePath: relativePath,
    mimeType: file.mimetype,
    size: file.size,
  });

  return {
    fileName: file.filename,
    originalName: file.originalname,
    filePath: relativePath,
    mimeType: file.mimetype,
    size: file.size,
  };
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
  registerUploadFromFile,
  listInvoices,
  getInvoiceById,
  processInvoice,
  getProcessResult,
  submitReview,
  getInvoiceAudit,
};
