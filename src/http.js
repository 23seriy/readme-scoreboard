const axios = require("axios");

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [250, 1000];
const MAX_RETRY_AFTER_MS = 5000;

function isRetryableError(error) {
  const status = error.response?.status;
  return status === 408 || status === 429 || status >= 500 || ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET"].includes(error.code);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryAfterMilliseconds(error, fallbackMilliseconds) {
  const value = error.response?.headers?.["retry-after"];
  if (value == null) return fallbackMilliseconds;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  }

  const date = Date.parse(value);
  if (Number.isFinite(date)) {
    return Math.min(Math.max(0, date - Date.now()), MAX_RETRY_AFTER_MS);
  }

  return fallbackMilliseconds;
}

async function get(url, config = {}) {
  const requestConfig = { ...config, timeout: config.timeout ?? DEFAULT_TIMEOUT_MS };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await axios.get(url, requestConfig);
    } catch (error) {
      if (!isRetryableError(error) || attempt === MAX_ATTEMPTS - 1) throw error;
      await wait(retryAfterMilliseconds(error, RETRY_DELAYS_MS[attempt]));
    }
  }
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  MAX_ATTEMPTS,
  get,
  isRetryableError,
  retryAfterMilliseconds,
};
