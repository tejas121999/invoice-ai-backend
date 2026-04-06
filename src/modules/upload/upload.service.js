const fs = require('fs');
const path = require('path');

const UPLOADS_RELATIVE = 'uploads';

const UPLOADS_ABSOLUTE = path.join(__dirname, '..', '..', '..', UPLOADS_RELATIVE);

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_ABSOLUTE)) {
    fs.mkdirSync(UPLOADS_ABSOLUTE, { recursive: true });
  }
}

function getUploadsAbsolutePath() {
  return UPLOADS_ABSOLUTE;
}

function getUploadsRelativeUrlPath() {
  return UPLOADS_RELATIVE;
}

function sanitizeBaseName(name) {
  const trimmed = String(name || '').trim();
  const withoutPath = path.basename(trimmed);
  return withoutPath.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
}

function buildSafeFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const base = sanitizeBaseName(path.basename(originalname, ext));
  return `${Date.now()}_${base}${ext}`;
}

function isAllowedMimeAndExt(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false };
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return { ok: false };
  }
  return { ok: true };
}

async function describeUploadCapabilities() {
  return {
    endpoint: 'POST /api/invoices/upload',
    fieldName: 'file',
    multipart: true,
    maxBytes: MAX_FILE_BYTES,
    allowedExtensions: Array.from(ALLOWED_EXTENSIONS),
    allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    storage: 'local',
    relativeFolder: UPLOADS_RELATIVE,
  };
}

module.exports = {
  UPLOADS_RELATIVE,
  MAX_FILE_BYTES,
  ensureUploadsDir,
  getUploadsAbsolutePath,
  getUploadsRelativeUrlPath,
  buildSafeFilename,
  isAllowedMimeAndExt,
  describeUploadCapabilities,
};
