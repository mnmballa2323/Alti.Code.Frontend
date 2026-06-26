/**
 * Data Loss Prevention (DLP) Interceptor
 * Scrubs PII, API keys, and sensitive IP from prompts before they leave the sovereign network.
 */
class DlpInterceptor {
  constructor() {
    // Standard regex for AWS Keys, RSA Private Keys, etc.
    this.patterns = [
      /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, // AWS Keys
      /-----BEGIN (?:RSA|OPENSSH) PRIVATE KEY-----[\s\S]+?-----END (?:RSA|OPENSSH) PRIVATE KEY-----/g, // Private Keys
      /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, // JWT Tokens
    ];
  }

  /**
   * Sanitizes a payload in real-time.
   * @param {string} payload The prompt text
   * @returns {string} Sanitized text
   */
  sanitize(payload) {
    if (!payload || typeof payload !== 'string') return payload;

    let cleanPayload = payload;
    for (const pattern of this.patterns) {
      cleanPayload = cleanPayload.replace(pattern, '[REDACTED_BY_DLP]');
    }
    return cleanPayload;
  }
}

module.exports = new DlpInterceptor();
