import crypto from 'crypto';

const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(base32Str) {
  const cleanStr = base32Str.toUpperCase().replace(/=+$/, '');
  const len = cleanStr.length;
  const buffer = Buffer.alloc(Math.floor((len * 5) / 8));
  
  let bits = 0;
  let value = 0;
  let index = 0;
  
  for (let i = 0; i < len; i++) {
    const val = base32Chars.indexOf(cleanStr[i]);
    if (val === -1) throw new Error('Invalid Base32 character');
    
    value = (value << 5) | val;
    bits += 5;
    
    if (bits >= 8) {
      buffer[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buffer;
}

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += base32Chars[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += base32Chars[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Generates a random Base32 secret for TOTP enrollment
 * @returns {string} 32-character Base32 secret
 */
export function generateSecret() {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generates the 6-digit TOTP code for a secret and time-step index
 * @param {string} secret Base32 secret
 * @param {number} timeStepIndex 30-second time interval counter
 * @returns {string} 6-digit OTP code
 */
export function getTotpCode(secret, timeStepIndex) {
  const key = base32Decode(secret);
  
  // Counter is an 8-byte big-endian integer
  const buffer = Buffer.alloc(8);
  let tmp = timeStepIndex;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 255;
    tmp = tmp >>> 8;
  }
  
  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 15;
  const code =
    ((hmac[offset] & 127) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  
  const otp = code % 1000000;
  return String(otp).padStart(6, '0');
}

/**
 * Verifies a 6-digit TOTP token against a secret
 * @param {string} secret Base32 secret
 * @param {string} token 6-digit input token
 * @param {number} [window=1] Permitted clock drift steps (+/- 30s)
 * @returns {boolean} True if token is valid
 */
export function verifyTotp(secret, token, window = 1) {
  if (!token || token.length !== 6) return false;
  
  const currentTimeStep = Math.floor(Date.now() / 1000 / 30);
  
  for (let i = -window; i <= window; i++) {
    const expectedToken = getTotpCode(secret, currentTimeStep + i);
    if (expectedToken === token) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the standard otpauth URI string for generating QR codes
 * @param {string} secret Base32 secret
 * @param {string} email User email address
 * @param {string} [issuer='Inso Platform'] Issuer name
 * @returns {string} otpauth URI
 */
export function getOtpauthUri(secret, email, issuer = 'Inso Platform') {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
}

export const totp = {
  generateSecret,
  getTotpCode,
  verifyTotp,
  getOtpauthUri,
};
export default totp;
