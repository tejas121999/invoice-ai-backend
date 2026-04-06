const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const { getModuleStatus } = require('./review.controller');

const router = express.Router();

router.get('/status', asyncHandler(getModuleStatus));

module.exports = router;
