const { testConnection } = require('../../config/database');

async function getDbHealth(req, res) {
  const ok = await testConnection();
  if (ok) {
    return res.status(200).json({
      success: true,
      message: 'Database connected successfully',
    });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection failed',
  });
}

module.exports = { getDbHealth };
