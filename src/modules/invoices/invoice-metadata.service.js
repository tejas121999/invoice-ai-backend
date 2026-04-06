const fs = require('fs').promises;
const path = require('path');
const { Invoice } = require('../../models');
const config = require('../../config');
const AppError = require('../../common/AppError');

/**
 * Persist invoice row after multer has written the file to disk.
 * On failure, removes the uploaded file when possible.
 */
async function createInvoiceFromUploadedFile(file, { uploadedBy = null } = {}) {
  const relativePath = path.posix.join(config.uploadPath, file.filename);
  const absolutePath = path.join(config.uploadAbsolutePath, file.filename);
  const uploadedAt = new Date();

  try {
    const row = await Invoice.create({
      fileName: file.filename,
      filePath: relativePath,
      fileType: file.mimetype,
      uploadStatus: 'uploaded',
      processingStatus: 'uploaded',
      uploadedBy,
      uploadedAt,
    });

    return {
      invoiceId: row.id,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: relativePath,
      mimeType: file.mimetype,
      size: file.size,
      uploadStatus: row.uploadStatus,
      processingStatus: row.processingStatus,
      uploadedAt: row.uploadedAt.toISOString(),
    };
  } catch (err) {
    try {
      await fs.unlink(absolutePath);
    } catch {
      /* ignore unlink errors */
    }
    throw new AppError('Failed to save invoice metadata', 500);
  }
}

module.exports = { createInvoiceFromUploadedFile };
