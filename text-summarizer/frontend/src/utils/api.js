// src/utils/api.js
// Communicates with the Flask backend API (http://localhost:5000)

/**
 * Determine API base URL.
 * Defaults to http://localhost:5000 for direct CORS requests during development,
 * with automatic fallback to relative /api when proxied.
 */
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};

const BASE_URL = getBaseUrl();

/**
 * POST /api/summarize or /summarize
 * @param {string} text - The input text to summarize
 * @returns {Promise<{summary: string, stats: object}>}
 */
export async function summarizeText(text) {
  let response;
  const primaryUrl = `${BASE_URL}/api/summarize`;

  try {
    response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  } catch (networkError) {
    // If direct connection failed, attempt relative proxy fallback
    try {
      response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ text }),
      });
    } catch {
      throw new Error(
        'Unable to connect to the backend server. Please verify that the Python backend is running on http://localhost:5000 (`python api.py`).'
      );
    }
  }

  // Read response body as text first to avoid crashing if empty or non-JSON
  let responseText = '';
  try {
    responseText = await response.text();
  } catch (readError) {
    throw new Error(
      `Failed to read response from server (HTTP ${response.status} ${response.statusText}).`
    );
  }

  // Attempt to parse JSON safely
  let data = null;
  if (responseText && responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  // Handle non-OK HTTP status codes
  if (!response.ok) {
    if (data && data.error) {
      throw new Error(data.error);
    }

    if (response.status === 502 || response.status === 504) {
      throw new Error(
        `Backend server is unreachable (HTTP ${response.status} Bad Gateway). Please make sure the Python backend is running on port 5000 with \`python api.py\`.`
      );
    }

    if (response.status === 503) {
      throw new Error(
        (data && data.error) ||
          'Service temporarily unavailable. Please verify that GEMINI_API_KEY is configured in your .env file.'
      );
    }

    if (response.status === 404) {
      throw new Error('API route was not found (HTTP 404). Please ensure the backend is running `api.py`.');
    }

    const cleanPreview = responseText
      ? responseText.slice(0, 150).replace(/<[^>]*>/g, '').trim()
      : '';

    throw new Error(
      cleanPreview ||
        `Server error (HTTP ${response.status}: ${response.statusText || 'Unknown error'}).`
    );
  }

  if (!data) {
    throw new Error('Server returned an empty response. Please try again.');
  }

  if (!data.summary) {
    throw new Error('Server response did not include a summary. Please try again.');
  }

  return data;
}

/**
 * GET /health or /api/health
 * Checks server availability across direct and proxied endpoints.
 */
export async function checkHealth() {
  const candidates = [
    `${BASE_URL}/health`,
    `${BASE_URL}/api/health`,
    '/health',
    '/api/health',
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          const data = JSON.parse(text);
          if (data && data.status === 'ok') {
            return true;
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return false;
}
