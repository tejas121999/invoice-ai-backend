const express = require('express');
const asyncHandler = require('../../middlewares/asyncHandler');
const { login, logout } = require('./auth.controller');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));

module.exports = router;
