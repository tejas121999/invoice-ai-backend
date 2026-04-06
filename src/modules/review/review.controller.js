const { successResponse } = require('../../utils/response');
const reviewService = require('./review.service');

async function getModuleStatus(req, res) {
  const data = await reviewService.getModulePlaceholder();
  return successResponse(res, data, 'Review module (placeholder)');
}

module.exports = { getModuleStatus };
