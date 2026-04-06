const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const uploadRoutes = require('../modules/upload/upload.routes');
const invoicesRoutes = require('../modules/invoices/invoices.routes');
const extractionRoutes = require('../modules/extraction/extraction.routes');
const reviewRoutes = require('../modules/review/review.routes');
const auditRoutes = require('../modules/audit/audit.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/upload', uploadRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/extraction', extractionRoutes);
router.use('/review', reviewRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
