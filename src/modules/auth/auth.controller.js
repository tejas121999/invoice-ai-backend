const { successResponse } = require('../../utils/response');
const authService = require('./auth.service');

async function login(req, res) {
  const data = await authService.login(req.body);
  return successResponse(res, data, 'Login accepted (placeholder — not authenticated)');
}

async function logout(req, res) {
  const data = await authService.logout(req.body);
  return successResponse(res, data, 'Logout acknowledged (placeholder)');
}

module.exports = { login, logout };
