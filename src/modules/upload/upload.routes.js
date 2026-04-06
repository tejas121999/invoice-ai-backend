const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const { getUploadInfo } = require('./upload.controller');

const router = express.Router();

router.get('/info', asyncHandler(getUploadInfo));

module.exports = router;
