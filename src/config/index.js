const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

function normalizeUploadPath(raw) {
  const s = String(raw || 'uploads').trim();
  if (!s) {
    return 'uploads';
  }
  const posix = s.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!posix || posix.includes('..')) {
    throw new Error('Config validation failed: UPLOAD_PATH must be a safe relative path without ".."');
  }
  return posix;
}

const portRaw = parseInt(process.env.PORT, 10);
const nodeEnv = (process.env.NODE_ENV || 'development').trim();

const uploadPath = normalizeUploadPath(process.env.UPLOAD_PATH);

const config = {
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number.isFinite(portRaw) && portRaw > 0 ? portRaw : 3000,
  uploadPath,
  projectRoot: PROJECT_ROOT,
  get uploadAbsolutePath() {
    return path.join(PROJECT_ROOT, ...this.uploadPath.split('/').filter(Boolean));
  },
};

function validate() {
  const errors = [];
  if (!config.env) {
    errors.push('NODE_ENV must not be empty when set');
  }
  if (!Number.isFinite(config.port) || config.port <= 0) {
    errors.push('PORT must be a positive integer');
  }
  if (!config.uploadPath) {
    errors.push('UPLOAD_PATH must not be empty');
  }
  if (errors.length) {
    throw new Error(`Config validation failed:\n${errors.join('\n')}`);
  }
}

validate();

module.exports = config;
