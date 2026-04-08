const AppError = require('../../common/AppError');
const { Invoice } = require('../../models');
const extractionService = require('../extraction/extraction.service');
const pythonClientService = require('../../services/python-client.service');
const reviewService = require('../review/review.service');
const auditService = require('../audit/audit.service');
const invoiceMetadataService = require('./invoice-metadata.service');

/** @type {Map<string, object>} legacy in-memory invoices (pre–DB upload) */
const invoicesById = new Map();

/** @type {Map<number, { extractionJob: object | null; extractionResult: object | null; review: object | null }>} */
const placeholderByInvoiceId = new Map();

function getPlaceholder(numericId) {
  if (!placeholderByInvoiceId.has(numericId)) {
    placeholderByInvoiceId.set(numericId, {
      extractionJob: null,
      extractionResult: null,
      review: null,
    });
  }
  return placeholderByInvoiceId.get(numericId);
}

function rowToBaseRecord(row) {
  const ph = getPlaceholder(row.id);
  const processingStatus = row.processingStatus || row.uploadStatus || 'uploaded';
  return {
    id: row.id,
    fileName: row.fileName,
    originalName: row.fileName,
    filePath: row.filePath,
    mimeType: row.fileType,
    size: null,
    status: processingStatus,
    uploadStatus: row.uploadStatus,
    processingStatus: row.processingStatus,
    uploadedAt: row.uploadedAt,
    createdAt: row.createdAt,
    extractionJob: ph.extractionJob,
    extractionResult: ph.extractionResult,
    review: ph.review,
  };
}

function parseNumericInvoiceId(idParam) {
  const s = String(idParam);
  if (!/^\d+$/.test(s)) {
    return null;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function loadInvoiceRecord(idParam) {
  const numericId = parseNumericInvoiceId(idParam);
  if (numericId != null) {
    const row = await Invoice.findByPk(numericId);
    if (row) {
      return rowToBaseRecord(row);
    }
    return null;
  }
  return invoicesById.get(String(idParam)) || null;
}

function toPublicInvoice(record) {
  const { ...rest } = record;
  if (rest.uploadedAt instanceof Date) {
    rest.uploadedAt = rest.uploadedAt.toISOString();
  }
  if (rest.createdAt instanceof Date) {
    rest.createdAt = rest.createdAt.toISOString();
  }
  return rest;
}

async function registerUploadFromFile(file, options = {}) {
  const data = await invoiceMetadataService.createInvoiceFromUploadedFile(file, {
    uploadedBy: options.uploadedBy ?? null,
  });

  await auditService.appendEntry(data.invoiceId, 'invoice.uploaded', {
    fileName: data.fileName,
    originalName: data.originalName,
    filePath: data.filePath,
    mimeType: data.mimeType,
    size: data.size,
  });

  return data;
}

function formatIsoOrNull(value) {
  if (value == null) {
    return null;
  }
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Plain list row for GET /api/invoices (no placeholder / legacy merge). */
function mapInvoiceRowToListItem(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  return {
    id: plain.id,
    fileName: plain.fileName,
    filePath: plain.filePath,
    fileType: plain.fileType,
    uploadStatus: plain.uploadStatus,
    processingStatus: plain.processingStatus,
    uploadedAt: formatIsoOrNull(plain.uploadedAt),
    processedAt: formatIsoOrNull(plain.processedAt),
    reviewedAt: formatIsoOrNull(plain.reviewedAt),
    createdAt: formatIsoOrNull(plain.createdAt),
    updatedAt: formatIsoOrNull(plain.updatedAt),
    uploadedBy: plain.uploadedBy ?? null,
  };
}

function parseListQuery(query = {}) {
  const pageRaw = query.page;
  const limitRaw = query.limit;
  const hasPage = pageRaw !== undefined && pageRaw !== '';
  const hasLimit = limitRaw !== undefined && limitRaw !== '';

  const page = hasPage ? Math.max(1, parseInt(String(pageRaw), 10) || 1) : 1;
  let limit;
  if (hasLimit) {
    const n = parseInt(String(limitRaw), 10);
    limit = Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 50;
  } else if (hasPage) {
    limit = 50;
  }

  const usePagination = hasPage || hasLimit;
  return { page, limit, usePagination };
}

/**
 * Fetch invoices from MySQL for GET /api/invoices (newest upload first).
 * Optional query: page, limit (max 100; default limit 50 when page is set).
 */
async function listInvoices(query = {}) {
  const { page, limit, usePagination } = parseListQuery(query);

  const findOptions = {
    attributes: { exclude: ['rawText'] },
    order: [
      ['uploadedAt', 'DESC'],
      ['id', 'DESC'],
    ],
  };

  if (usePagination) {
    findOptions.limit = limit;
    findOptions.offset = (page - 1) * limit;
  }

  try {
    const rows = await Invoice.findAll(findOptions);
    return rows.map(mapInvoiceRowToListItem);
  } catch {
    throw new AppError('Failed to fetch invoices', 500);
  }
}

async function getInvoiceById(id) {
  const record = await loadInvoiceRecord(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }
  return toPublicInvoice(record);
}

async function processInvoice(id) {
  const numericId = parseNumericInvoiceId(id);
  if (numericId == null) {
    throw new AppError('Invoice not found', 404);
  }

  const row = await Invoice.findByPk(numericId);
  if (!row) {
    throw new AppError('Invoice not found', 404);
  }

  const record = rowToBaseRecord(row);
  const payload = {
    invoiceId: record.id,
    filePath: record.filePath,
  };

  try {
    const extraction = await pythonClientService.extractInvoice(payload);

    await auditService.appendEntry(record.id, 'invoice.process_started', {
      provider: 'python-fastapi',
      request: payload,
    });

    return {
      invoiceId: record.id,
      extraction,
    };
  } catch (error) {
    await auditService.appendEntry(record.id, 'invoice.process_failed', {
      provider: 'python-fastapi',
      reason: error.message,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to process invoice', 500);
  }
}

async function getProcessResult(id) {
  const record = await loadInvoiceRecord(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const extraction = await extractionService.getExtractionStatus(record.id);

  return {
    invoiceId: record.id,
    invoiceStatus: record.status,
    extractionJob: record.extractionJob,
    extraction,
  };
}

async function submitReview(id, body) {
  const record = await loadInvoiceRecord(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const review = await reviewService.applyReviewUpdate(record.id, body);
  record.review = review;
  record.status = 'reviewed';

  if (typeof record.id === 'number') {
    getPlaceholder(record.id).review = review;
  }

  await auditService.appendEntry(record.id, 'invoice.reviewed', { reviewId: review.reviewedAt });

  return {
    invoice: toPublicInvoice(record),
    review,
  };
}

async function getInvoiceAudit(id) {
  const record = await loadInvoiceRecord(id);
  if (!record) {
    throw new AppError('Invoice not found', 404);
  }

  const trail = await auditService.listAuditForInvoice(record.id);
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
