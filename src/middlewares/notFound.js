const { failResponse } = require('../utils/response');

function notFound(req, res) {
  return failResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, null);
}

module.exports = notFound;
