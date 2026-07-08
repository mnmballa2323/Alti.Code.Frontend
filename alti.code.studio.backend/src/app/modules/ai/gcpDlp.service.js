import { logger } from '../../../shared/logger.js';

// Luhn validation helper for credit card numbers
function luhnCheck(cardNumber) {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;
  
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const PATTERNS = {
  EMAIL: {
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    infoType: 'EMAIL_ADDRESS',
    label: '[REDACTED_EMAIL_ADDRESS]',
  },
  CREDIT_CARD: {
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g,
    infoType: 'CREDIT_CARD',
    label: '[REDACTED_CREDIT_CARD]',
    validate: luhnCheck,
  },
  US_SSN: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    infoType: 'US_SOCIAL_SECURITY_NUMBER',
    label: '[REDACTED_US_SOCIAL_SECURITY_NUMBER]',
  },
  PRIVATE_KEY: {
    regex: /-----BEGIN[ A-Z0-9_-]+PRIVATE KEY-----[\s\S]+?-----END[ A-Z0-9_-]+PRIVATE KEY-----/g,
    infoType: 'PRIVATE_KEY',
    label: '[REDACTED_PRIVATE_KEY]',
  },
  API_KEY: {
    regex: /\b(?:sk_live_|sk_test_|ghp_|gho_|ghu_|ghs_|gha_|AIzaSy)[a-zA-Z0-9_]{16,64}\b/g,
    infoType: 'AUTH_TOKEN',
    label: '[REDACTED_API_KEY]',
  },
  AWS_ACCESS_KEY: {
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    infoType: 'AWS_ACCESS_KEY_ID',
    label: '[REDACTED_AWS_ACCESS_KEY_ID]',
  },
};

export const GoogleDlpService = {
  inspectText: async text => {
    logger.info(
      '🛡️ Google Cloud DLP: Inspecting content for sensitive information (Local Scrubber)...',
    );
    if (!text || typeof text !== 'string') return [];

    const findings = [];

    for (const key in PATTERNS) {
      const pattern = PATTERNS[key];
      pattern.regex.lastIndex = 0; // Reset regex matching position
      let match;

      while ((match = pattern.regex.exec(text)) !== null) {
        const value = match[0];
        // If validation function is specified (like Luhn check for Credit Cards), verify it
        if (pattern.validate && !pattern.validate(value)) {
          continue;
        }

        findings.push({
          infoType: { name: pattern.infoType },
          likelihood: 'VERY_LIKELY',
          location: {
            codepointRange: {
              start: match.index,
              end: match.index + value.length,
            },
          },
        });
      }
    }

    return findings;
  },

  redactText: async text => {
    logger.info(
      '🛡️ Google Cloud DLP: Redacting sensitive information (Local Scrubber)...',
    );
    if (!text || typeof text !== 'string') return text;

    let redactedText = text;

    // Run inspection first to find valid target segments to redact
    const findings = await GoogleDlpService.inspectText(text);

    // Sort findings in descending order of their start positions to redact backwards
    // (This avoids offset shifts as the string length changes during replacements)
    findings.sort((a, b) => b.location.codepointRange.start - a.location.codepointRange.start);

    for (const finding of findings) {
      const { start, end } = finding.location.codepointRange;
      const typeName = finding.infoType.name;
      
      // Map back to the corresponding pattern label
      let label = '[REDACTED_PII]';
      for (const key in PATTERNS) {
        if (PATTERNS[key].infoType === typeName) {
          label = PATTERNS[key].label;
          break;
        }
      }

      redactedText = redactedText.substring(0, start) + label + redactedText.substring(end);
    }

    return redactedText;
  },

  scanForSecrets: async text => {
    logger.info(
      '🛡️ Google Cloud DLP: Scanning codebase content for plain-text keys/secrets (Local Scrubber)...',
    );
    const findings = await GoogleDlpService.inspectText(text);
    // Filter findings to only return critical secrets
    return findings.filter(f => 
      ['AUTH_TOKEN', 'PRIVATE_KEY', 'AWS_ACCESS_KEY_ID'].includes(f.infoType.name)
    );
  },
};

export const gcpDlpService = GoogleDlpService;
export const dlpService = GoogleDlpService;
export const GCPDlpService = GoogleDlpService; // Compatibility mapping
