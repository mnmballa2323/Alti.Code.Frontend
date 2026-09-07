/**
 * sanitize-filename replacement (MIT License)
 * 
 * Copyright (c) 2026 Alti Code Studio
 * Licensed under the MIT License
 * 
 * Replaces the WTFPL-licensed `sanitize-filename` and `truncate-utf8-bytes` packages.
 */

const ILLEGAL_RE = /[\/\?<>\\:\*\|"]/g;
const CONTROL_RE = /[\x00-\x1f\x80-\x9f]/g;
const RESERVED_RE = /^\.+$/;
const WINDOWS_RESERVED_RE = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const WINDOWS_TRAILING_RE = /[\. ]+$/;

/**
 * Truncate a string to a maximum byte length in UTF-8.
 * @param {string} str - The string to truncate
 * @param {number} maxBytes - Maximum byte length
 * @returns {string} Truncated string
 */
function truncateUtf8Bytes(str, maxBytes) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  if (encoded.length <= maxBytes) return str;
  
  // Binary search for the right codepoint boundary
  let low = 0;
  let high = str.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (encoder.encode(str.slice(0, mid)).length <= maxBytes) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return str.slice(0, low);
}

/**
 * Sanitize a filename by removing illegal characters and reserved names.
 * @param {string} input - The filename to sanitize
 * @param {object} [options] - Options
 * @param {string} [options.replacement=''] - Replacement character for illegal chars
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(input, options = {}) {
  const replacement = options.replacement || '';
  
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  let sanitized = input
    .replace(ILLEGAL_RE, replacement)
    .replace(CONTROL_RE, replacement)
    .replace(RESERVED_RE, replacement)
    .replace(WINDOWS_RESERVED_RE, replacement)
    .replace(WINDOWS_TRAILING_RE, replacement);
  
  // Truncate to 255 bytes (common filesystem limit)
  sanitized = truncateUtf8Bytes(sanitized, 255);
  
  return sanitized;
}

export { truncateUtf8Bytes };
export default sanitizeFilename;
