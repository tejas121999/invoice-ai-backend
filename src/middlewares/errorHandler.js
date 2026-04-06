const { failResponse } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return failResponse(res, message, statusCode, null);
}

module.exports = errorHandler;
