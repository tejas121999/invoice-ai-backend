const { successResponse } = require('../../utils/response');
const usersService = require('./users.service');

async function listUsers(req, res) {
  const data = await usersService.listUsersPlaceholder();
  return successResponse(res, data, 'Users module (placeholder)');
}

module.exports = { listUsers };
