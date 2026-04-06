const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const { getModuleStatus } = require('./extraction.controller');

const router = express.Router();

router.get('/status', asyncHandler(getModuleStatus));

module.exports = router;
