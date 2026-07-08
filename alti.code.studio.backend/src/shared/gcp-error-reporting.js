/**
 * GCP Error Reporting Integration
 *
 * Sends uncaught / reported errors to Google Cloud Error Reporting.
 * In test mode (`NODE_ENV === 'test'`) reporting is disabled by default.
 *
 * Exports:
 *   - `reportError(err)` — manually report an Error instance
 *   - `gcpErrorMiddleware`  — Express error-handling middleware
 */

import { ErrorReporting } from '@google-cloud/error-reporting';
import { logger } from './logger.js';

let errors = null;
let isAvailable = false;

/**
 * Lazily initialise the Error Reporting client.
 * Called once on first import; safe to call again (no-op after first run).
 */
function init() {
  try {
    // Skip entirely in test unless opted-in
    if (
      process.env.NODE_ENV === 'test' &&
      process.env.GCP_REAL_SERVICES !== 'true'
    ) {
      logger.info(
        '⏭️  GCP Error Reporting: Skipped initialisation (test environment).',
      );
      return;
    }

    // Require at least one credential indicator
    if (
      !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      !process.env.GCP_PROJECT_ID &&
      !process.env.GCLOUD_PROJECT
    ) {
      logger.warn(
        '⚠️  GCP Error Reporting: No GCP credentials detected — error reporting disabled. ' +
          'Set GOOGLE_APPLICATION_CREDENTIALS or GCP_PROJECT_ID to enable.',
      );
      return;
    }

    const reportMode =
      process.env.NODE_ENV === 'production' ? 'always' : 'never';

    errors = new ErrorReporting({
      reportMode,
      serviceContext: {
        service: 'alti-code-studio-backend',
        version: process.env.APP_VERSION || '1.0.0',
      },
    });

    isAvailable = true;
    logger.info(
      `✅ GCP Error Reporting: Initialised (reportMode: ${reportMode}).`,
    );
  } catch (err) {
    logger.warn(
      `⚠️  GCP Error Reporting: Initialisation failed — errors will only be logged locally: ${err.message}`,
    );
  }
}

// Auto-initialise on module load
init();

/**
 * Report an error to Google Cloud Error Reporting.
 *
 * Falls back to the local logger when the GCP client is unavailable.
 *
 * @param {Error|string} err - The error to report
 */
export function reportError(err) {
  if (isAvailable && errors) {
    try {
      errors.report(err);
      return;
    } catch (reportErr) {
      logger.error(
        `❌ GCP Error Reporting: Failed to report error: ${reportErr.message}`,
      );
    }
  }

  // Fallback: write to local logger
  const message = err instanceof Error ? err.stack || err.message : String(err);
  logger.error(`[GCP Error Reporting Fallback] ${message}`);
}

/**
 * Express error-handling middleware.
 *
 * Mount AFTER all routes:
 *
 *   import { gcpErrorMiddleware } from './shared/gcp-error-reporting.js';
 *   app.use(gcpErrorMiddleware);
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function gcpErrorMiddleware(err, req, res, next) {
  // Report to GCP (or fallback)
  reportError(err);

  // Let the next error handler (or Express default) deal with the response
  next(err);
}
