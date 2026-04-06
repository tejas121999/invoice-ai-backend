const fs = require('fs');
const path = require('path');
const config = require('../../config');

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

function ensureUploadsDir() {
  if (!fs.existsSync(config.uploadAbsolutePath)) {
    fs.mkdirSync(config.uploadAbsolutePath, { recursive: true });
  }
}

function getUploadsAbsolutePath() {
  return config.uploadAbsolutePath;
}

function getUploadsRelativeUrlPath() {
  return config.uploadPath;
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
    relativeFolder: config.uploadPath,
    uploadAbsolutePath: config.uploadAbsolutePath,
  };
}

module.exports = {
  get UPLOADS_RELATIVE() {
    return config.uploadPath;
  },
  MAX_FILE_BYTES,
  ensureUploadsDir,
  getUploadsAbsolutePath,
  getUploadsRelativeUrlPath,
  buildSafeFilename,
  isAllowedMimeAndExt,
  describeUploadCapabilities,
};
