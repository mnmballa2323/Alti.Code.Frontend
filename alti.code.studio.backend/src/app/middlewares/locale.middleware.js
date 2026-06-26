/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../shared/logger.js';

/**
 * Middleware to detect user locale from Accept-Language header or query param
 */
export const localeMiddleware = (req, res, next) => {
  try {
    // Priority: 1. Query Param (?lang=es) 2. Header (Accept-Language) 3. Default (en)
    let locale = req.query.lang;

    if (!locale && req.headers['accept-language']) {
      // "en-US,en;q=0.9,es;q=0.8" -> "en-US"
      const languages = req.headers['accept-language'].split(',');
      if (languages.length > 0) {
        locale = languages[0].split(';')[0].trim();
      }
    }

    // Simplify to primary language code (e.g., 'en-US' -> 'en', 'es-ES' -> 'es')
    // This is a design choice for broader support vs specific regional dialects
    if (locale && locale.includes('-')) {
      locale = locale.split('-')[0];
    }

    req.locale = locale || 'en';

    // Log if non-default
    if (req.locale !== 'en') {
      logger.debug(`🌍 Request Locale detected: ${req.locale}`);
    }

    next();
  } catch (error) {
    logger.warn('Locale detection failed, defaulting to en');
    req.locale = 'en';
    next();
  }
};
