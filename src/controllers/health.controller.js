const { successResponse } = require('../utils/response');

async function getHealth(req, res) {
  return successResponse(
    res,
    {
      status: 'ok',
      service: 'invoice-ai-backend',
      uptimeSeconds: Math.round(process.uptime()),
    },
    'Backend is running',
  );
}

module.exports = { getHealth };
