const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const {
  uploadInvoiceSingle,
  requireInvoiceFile,
} = require('../upload/upload.middleware');
const {
  uploadInvoice,
  listInvoices,
  getInvoice,
  processInvoice,
  getResult,
  reviewInvoice,
  getAudit,
} = require('./invoices.controller');

const router = express.Router();

router.post(
  '/upload',
  uploadInvoiceSingle,
  requireInvoiceFile,
  asyncHandler(uploadInvoice),
);
router.get('/', asyncHandler(listInvoices));
router.get('/:id/audit', asyncHandler(getAudit));
router.get('/:id/result', asyncHandler(getResult));
router.post('/:id/process', asyncHandler(processInvoice));
router.put('/:id/review', asyncHandler(reviewInvoice));
router.get('/:id', asyncHandler(getInvoice));

module.exports = router;
