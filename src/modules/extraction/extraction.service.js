const AppError = require('../../common/AppError');
const config = require('../../config');
const { sequelize, Invoice, ExtractedInvoiceData } = require('../../models');

/**
 * Normalize Python /api/extract body (supports optional `data` wrapper).
 */
function normalizePythonExtractionPayload(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      rawText: null,
      fields: {},
      confidence: {},
      errors: [],
    };
  }
  const inner = raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

  const fields =
    inner.fields != null && typeof inner.fields === 'object' && !Array.isArray(inner.fields)
      ? inner.fields
      : {};
  const confidence =
    inner.confidence != null && typeof inner.confidence === 'object' && !Array.isArray(inner.confidence)
      ? inner.confidence
      : {};

  return {
    rawText: inner.rawText != null ? String(inner.rawText) : null,
    fields,
    confidence,
    errors: Array.isArray(inner.errors) ? inner.errors : [],
  };
}

function firstNonEmptyString(obj, keys) {
  if (!obj || typeof obj !== 'object') {
    return null;
  }
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return null;
}

function parseAmount(obj, keys) {
  const s = firstNonEmptyString(obj, keys);
  if (s == null) {
    return null;
  }
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDateOnly(value) {
  if (value == null || value === '') {
    return null;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString().slice(0, 10);
}

function parseInvoiceDate(obj, keys) {
  const raw = firstNonEmptyString(obj, keys);
  if (raw == null) {
    return null;
  }
  return toDateOnly(raw);
}

/**
 * Map Python `fields` into fixed columns; keys cover common OCR naming variants.
 */
function mapFieldsToColumns(fields) {
  return {
    invoiceNumber: firstNonEmptyString(fields, [
      'invoice_number',
      'invoiceNumber',
      'invoice_no',
      'invoiceNo',
      'number',
      'invoice_id',
      'invoiceId',
    ]),
    vendorName: firstNonEmptyString(fields, ['vendor_name', 'vendorName', 'vendor', 'supplier', 'supplier_name']),
    invoiceDate: parseInvoiceDate(fields, ['invoice_date', 'invoiceDate', 'date', 'issue_date', 'issueDate']),
    totalAmount: parseAmount(fields, [
      'total_amount',
      'totalAmount',
      'total',
      'amount_due',
      'amountDue',
      'grand_total',
      'grandTotal',
    ]),
    currency: firstNonEmptyString(fields, ['currency', 'currency_code', 'currencyCode']),
  };
}

/**
 * Persist OCR output: update `invoices` and upsert `extracted_invoice_data` in one transaction.
 */
async function saveExtractionResult(invoiceId, extractionResponse) {
  const normalized = normalizePythonExtractionPayload(extractionResponse);
  const fixed = mapFieldsToColumns(normalized.fields);

  try {
    await sequelize.transaction(async (transaction) => {
      const [affectedRows] = await Invoice.update(
        {
          processingStatus: 'processed',
          processedAt: new Date(),
          rawText: normalized.rawText,
        },
        { where: { id: invoiceId }, transaction },
      );

      if (affectedRows === 0) {
        throw new AppError('Invoice not found', 404);
      }

      const extractedPayload = {
        invoiceId,
        invoiceNumber: fixed.invoiceNumber,
        vendorName: fixed.vendorName,
        invoiceDate: fixed.invoiceDate,
        totalAmount: fixed.totalAmount,
        currency: fixed.currency,
        extractedFieldsJson: normalized.fields,
        confidenceJson: normalized.confidence,
        reviewedFieldsJson: {},
        isReviewed: false,
        reviewedBy: null,
      };

      const existing = await ExtractedInvoiceData.findOne({
        where: { invoiceId },
        transaction,
      });

      if (existing) {
        await existing.update(extractedPayload, { transaction });
      } else {
        await ExtractedInvoiceData.create(extractedPayload, { transaction });
      }
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    if (!config.isProduction) {
      const sqlMsg = err.parent?.sqlMessage || err.message;
      console.error('[extraction] saveExtractionResult:', sqlMsg);
    }
    throw new AppError('Failed to process invoice', 500);
  }
}

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
  normalizePythonExtractionPayload,
  mapFieldsToColumns,
  saveExtractionResult,
  queueExtractionJob,
  getExtractionStatus,
  getModulePlaceholder,
};
