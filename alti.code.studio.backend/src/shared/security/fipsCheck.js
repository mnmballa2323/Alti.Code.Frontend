/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import crypto from 'crypto';
import { logger } from '../logger.js';

/**
 * Audits the Node.js runtime for OpenSSL FIPS mode compliance.
 * Logs the audit results for security compliance tracking.
 * @returns {boolean} True if FIPS compliance is active.
 */
export function auditFipsCompliance() {
  try {
    // Node.js crypto.getFips() returns 1 if enabled, 0 if disabled, or throws if not supported/available
    const isFipsActive =
      typeof crypto.getFips === 'function' ? crypto.getFips() === 1 : false;

    if (isFipsActive) {
      logger.info(
        '🔒 [SECURITY AUDIT] Cryptographic FIPS 140 compliance mode is ACTIVE.',
      );
      return true;
    } else {
      logger.warn(
        '⚠️ [SECURITY AUDIT] Cryptographic FIPS 140 compliance mode is INACTIVE.',
      );
      return false;
    }
  } catch (error) {
    logger.error(
      '❌ [SECURITY AUDIT] FIPS compliance check failed or unsupported:',
      {
        message: error.message,
      },
    );
    return false;
  }
}
