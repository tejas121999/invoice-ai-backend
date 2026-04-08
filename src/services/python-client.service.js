const axios = require('axios');
const AppError = require('../common/AppError');

const PYTHON_OCR_BASE_URL = (process.env.PYTHON_OCR_BASE_URL || 'http://localhost:8000').trim();
const PYTHON_OCR_TIMEOUT_MS = Number.parseInt(process.env.PYTHON_OCR_TIMEOUT_MS, 10) || 15000;

const httpClient = axios.create({
  baseURL: PYTHON_OCR_BASE_URL,
  timeout: PYTHON_OCR_TIMEOUT_MS,
});

function isValidExtractionResponse(payload) {
  return payload != null && typeof payload === 'object' && !Array.isArray(payload);
}

async function extractInvoice(data) {
  try {
    const response = await httpClient.post('/api/extract', data);
    const extraction = response?.data;

    if (!isValidExtractionResponse(extraction)) {
      throw new AppError('Invalid response from Python OCR service', 502);
    }

    return extraction;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === 'ECONNABORTED') {
      throw new AppError('Python OCR service timed out', 504);
    }

    if (error.response) {
      throw new AppError('Python OCR service returned an error', 502);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      throw new AppError('Python OCR service unavailable', 503);
    }

    throw new AppError('Failed to connect to Python OCR service', 503);
  }
}

module.exports = {
  extractInvoice,
};
