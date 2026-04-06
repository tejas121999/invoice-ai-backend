const { successResponse } = require('../../utils/response');
const extractionService = require('./extraction.service');

async function getModuleStatus(req, res) {
  const data = await extractionService.getModulePlaceholder();
  return successResponse(res, data, 'Extraction module (placeholder)');
}

module.exports = { getModuleStatus };
