/**
 * Google Cloud DLP (Data Loss Prevention) Service
 * Production-grade PII/PHI detection and de-identification using the Cloud DLP API.
 * Falls back to local regex patterns when GCP credentials are not available.
 */
import { logger } from '../../../shared/logger.js';

// Default info types to scan for
const DEFAULT_INFO_TYPES = [
  'PERSON_NAME',
  'EMAIL_ADDRESS',
  'PHONE_NUMBER',
  'CREDIT_CARD_NUMBER',
  'US_SOCIAL_SECURITY_NUMBER',
  'DATE_OF_BIRTH',
  'IP_ADDRESS',
  'STREET_ADDRESS',
  'PASSPORT',
  'US_DRIVERS_LICENSE_NUMBER',
  'MEDICAL_RECORD_NUMBER',
];

// Local regex fallback patterns for offline/air-gapped mode
const LOCAL_PATTERNS = [
  { name: 'EMAIL_ADDRESS', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'PHONE_NUMBER', regex: /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
  { name: 'CREDIT_CARD_NUMBER', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g },
  { name: 'US_SOCIAL_SECURITY_NUMBER', regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g },
  { name: 'IP_ADDRESS', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g },
  { name: 'CLOUD_ACCESS_KEY', regex: /\b(AKIA[0-9A-Z]{16}|GOOG[\w]{10,30})\b/g },
  { name: 'CLOUD_SECRET_KEY', regex: /\b[A-Za-z0-9/+=]{40}\b/g },
];

class GcpDlpService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' &&
        (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID)
      ) {
        const { DlpServiceClient } = await import('@google-cloud/dlp');
        this.client = new DlpServiceClient();
        this.projectId = this.projectId || await this.client.getProjectId();
        this.isInitialized = true;
        logger.info('🛡️ Google Cloud DLP: Initialized successfully');
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud DLP initialization failed, falling back to local regex: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Inspect content for sensitive data (PII/PHI).
   * @param {string} content - The text content to inspect
   * @param {Object} options - Options for inspection
   * @param {string[]} options.infoTypes - Info types to scan for (defaults to DEFAULT_INFO_TYPES)
   * @param {string} options.minLikelihood - Minimum likelihood threshold
   * @returns {Object} Inspection results with findings array
   */
  async inspectContent(content, options = {}) {
    if (!content || typeof content !== 'string') {
      return { findings: [], findingCount: 0, provider: 'none' };
    }

    if (this.isInitialized && this.client) {
      try {
        const infoTypes = (options.infoTypes || DEFAULT_INFO_TYPES).map(
          (name) => ({ name }),
        );

        const [response] = await this.client.inspectContent({
          parent: `projects/${this.projectId}/locations/global`,
          inspectConfig: {
            infoTypes,
            minLikelihood: options.minLikelihood || 'LIKELY',
            includeQuote: true,
            limits: {
              maxFindingsPerRequest: options.maxFindings || 100,
            },
          },
          item: {
            value: content,
          },
        });

        const findings = (response.result?.findings || []).map((f) => ({
          infoType: f.infoType?.name,
          likelihood: f.likelihood,
          quote: f.quote,
          location: {
            start: f.location?.byteRange?.start,
            end: f.location?.byteRange?.end,
          },
        }));

        logger.info(
          `🛡️ Google Cloud DLP: Inspected content — ${findings.length} finding(s) detected`,
        );

        return {
          findings,
          findingCount: findings.length,
          provider: 'gcp-cloud-dlp',
        };
      } catch (apiErr) {
        logger.error(
          `❌ Google Cloud DLP inspectContent failed: ${apiErr.message}. Falling back to local regex.`,
        );
      }
    }

    // Fallback: local regex pattern matching
    return this._localInspect(content);
  }

  /**
   * De-identify content by redacting or masking sensitive data.
   * @param {string} content - The text content to de-identify
   * @param {Object} options - Options for de-identification
   * @param {string} options.maskingCharacter - Character for masking (default: '*')
   * @param {number} options.numberToMask - Number of characters to mask (0 = all)
   * @returns {Object} De-identified content
   */
  async deidentifyContent(content, options = {}) {
    if (!content || typeof content !== 'string') {
      return { text: content, itemsTransformed: 0, provider: 'none' };
    }

    if (this.isInitialized && this.client) {
      try {
        const infoTypes = (options.infoTypes || DEFAULT_INFO_TYPES).map(
          (name) => ({ name }),
        );

        const [response] = await this.client.deidentifyContent({
          parent: `projects/${this.projectId}/locations/global`,
          inspectConfig: {
            infoTypes,
            minLikelihood: options.minLikelihood || 'LIKELY',
          },
          deidentifyConfig: {
            infoTypeTransformations: {
              transformations: [
                {
                  primitiveTransformation: {
                    characterMaskConfig: {
                      maskingCharacter: options.maskingCharacter || '*',
                      numberToMask: options.numberToMask || 0,
                    },
                  },
                },
              ],
            },
          },
          item: {
            value: content,
          },
        });

        const transformedText = response.item?.value || content;
        const itemsTransformed =
          response.overview?.transformationSummaries?.reduce(
            (sum, s) => sum + (s.results?.[0]?.count || 0),
            0,
          ) || 0;

        logger.info(
          `🛡️ Google Cloud DLP: De-identified content — ${itemsTransformed} item(s) masked`,
        );

        return {
          text: transformedText,
          itemsTransformed,
          provider: 'gcp-cloud-dlp',
        };
      } catch (apiErr) {
        logger.error(
          `❌ Google Cloud DLP deidentifyContent failed: ${apiErr.message}. Falling back to local regex.`,
        );
      }
    }

    return this._localDeidentify(content, options);
  }

  /** @private */
  _localInspect(content) {
    const findings = [];

    for (const pattern of LOCAL_PATTERNS) {
      const matches = content.matchAll(pattern.regex);
      for (const match of matches) {
        findings.push({
          infoType: pattern.name,
          likelihood: 'LIKELY',
          quote: match[0],
          location: {
            start: match.index,
            end: match.index + match[0].length,
          },
        });
      }
    }

    logger.info(
      `🛡️ Cloud DLP (local fallback): Inspected content — ${findings.length} finding(s) detected`,
    );

    return {
      findings,
      findingCount: findings.length,
      provider: 'local-regex',
    };
  }

  /** @private */
  _localDeidentify(content, options = {}) {
    const maskChar = options.maskingCharacter || '*';
    let transformed = content;
    let itemsTransformed = 0;

    for (const pattern of LOCAL_PATTERNS) {
      transformed = transformed.replace(pattern.regex, (match) => {
        itemsTransformed++;
        return maskChar.repeat(match.length);
      });
    }

    logger.info(
      `🛡️ Cloud DLP (local fallback): De-identified content — ${itemsTransformed} item(s) masked`,
    );

    return {
      text: transformed,
      itemsTransformed,
      provider: 'local-regex',
    };
  }
}

export const gcpDlpService = new GcpDlpService();
