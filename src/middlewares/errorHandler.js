const multer = require('multer');
const config = require('../config');
const { failResponse } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return failResponse(res, 'File too large. Maximum size is 10 MB.', 413, null);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return failResponse(
        res,
        'Unexpected file field. Only one file is allowed using the field name "file".',
        400,
        null,
      );
    }
    return failResponse(res, err.message || 'Upload failed', 400, null);
  }

  const statusCode = err.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500;
  const message =
    statusCode === 500 && config.isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return failResponse(res, message, statusCode, null);
}

module.exports = errorHandler;
