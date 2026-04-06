const { successResponse } = require('../../utils/response');
const auditService = require('./audit.service');

async function getModuleStatus(req, res) {
  const data = await auditService.getModulePlaceholder();
  return successResponse(res, data, 'Audit module (placeholder)');
}

module.exports = { getModuleStatus };
