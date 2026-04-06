const { successResponse } = require('../../utils/response');
const uploadService = require('./upload.service');

async function getUploadInfo(req, res) {
  const data = await uploadService.describeUploadCapabilities();
  return successResponse(res, data, 'Upload module (placeholder)');
}

module.exports = { getUploadInfo };
