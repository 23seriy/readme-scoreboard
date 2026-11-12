const axios = require("axios");

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [250, 1000];
const MAX_RETRY_AFTER_MS = 5000;

// The browser-like headers ESPN's site APIs expect. Seven adapters used to
// define their own identical copies, while the leagues that did not (notably
// every soccer league, via base-soccer.js) hit ESPN with axios's default
// User-Agent — a plausible contributor to the 403s the WNBA adapter sees.
// Applied only to ESPN hosts: the NHL and MLB endpoints served through this
// helper must not receive ESPN's Origin/Referer.
const ESPN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Accept": "application/json",
  "Origin": "https://www.espn.com",
  "Referer": "https://www.espn.com/",
};

const ESPN_HOSTS = new Set([
  "site.api.espn.com",
  "site.web.api.espn.com",
  "sports.core.api.espn.com",
  "www.espn.com",
]);

function isEspnUrl(url) {
  try {
    return ESPN_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

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
  const headers = isEspnUrl(url)
    ? { ...ESPN_HEADERS, ...(config.headers || {}) }
    : config.headers;
  const requestConfig = { ...config, timeout: config.timeout ?? DEFAULT_TIMEOUT_MS, ...(headers ? { headers } : {}) };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await axios.get(url, requestConfig);
    } catch (error) {
      if (error.response?.status === 403 && isEspnUrl(url)) {
        // A bare axios 403 reads "Request failed with status code 403" and
        // tells the user nothing; callers log error.message, so say what it
        // is. 403s are not retried (see isRetryableError), so this runs once.
        error.message = `ESPN returned 403 for ${url} — likely bot-gating, demo fallback in use`;
      }
      if (!isRetryableError(error) || attempt === MAX_ATTEMPTS - 1) throw error;
      await wait(retryAfterMilliseconds(error, RETRY_DELAYS_MS[attempt]));
    }
  }
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  ESPN_HEADERS,
  MAX_ATTEMPTS,
  get,
  isRetryableError,
  retryAfterMilliseconds,
};
