const multer = require('multer');
const AppError = require('../../common/AppError');
const { failResponse } = require('../../utils/response');
const uploadService = require('./upload.service');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      uploadService.ensureUploadsDir();
      cb(null, uploadService.getUploadsAbsolutePath());
    } catch (err) {
      cb(err);
    }
  },
  filename(req, file, cb) {
    try {
      const name = uploadService.buildSafeFilename(file.originalname);
      cb(null, name);
    } catch (err) {
      cb(err);
    }
  },
});

function fileFilter(req, file, cb) {
  const { ok } = uploadService.isAllowedMimeAndExt(file);
  if (!ok) {
    return cb(
      new AppError('Invalid file type. Only PDF, JPG, JPEG, PNG are allowed', 400),
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadService.MAX_FILE_BYTES,
    files: 1,
  },
});

function uploadInvoiceSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

function requireInvoiceFile(req, res, next) {
  if (!req.file) {
    return failResponse(
      res,
      'No file uploaded. Please attach a file using the field name "file".',
      400,
      null,
    );
  }
  next();
}

module.exports = {
  uploadInvoiceSingle,
  requireInvoiceFile,
};
