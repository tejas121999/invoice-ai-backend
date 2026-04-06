const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const { listUsers } = require('./users.controller');

const router = express.Router();

router.get('/', asyncHandler(listUsers));

module.exports = router;
