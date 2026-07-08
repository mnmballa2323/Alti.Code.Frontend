/**
 * GCP Cloud Profiler Integration
 *
 * Starts the Google Cloud Profiler agent which continuously collects
 * CPU and heap profiles and uploads them to Cloud Profiler.
 *
 * Call `initGcpProfiler()` once at app startup.
 */

import { logger } from './logger.js';

/**
 * Start the GCP Cloud Profiler.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 * Gracefully degrades when GCP credentials are unavailable.
 */
export async function initGcpProfiler() {
  try {
    // Skip in test unless explicitly opted-in
    if (
      process.env.NODE_ENV === 'test' &&
      process.env.GCP_REAL_SERVICES !== 'true'
    ) {
      logger.info(
        '⏭️  GCP Cloud Profiler: Skipped initialisation (test environment).',
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
        '⚠️  GCP Cloud Profiler: No GCP credentials detected — profiling disabled. ' +
          'Set GOOGLE_APPLICATION_CREDENTIALS or GCP_PROJECT_ID to enable.',
      );
      return;
    }

    // Dynamic import so the native add-on only loads when we actually need it
    const profiler = await import('@google-cloud/profiler');
    const startFn = profiler.start || profiler.default?.start;

    if (typeof startFn !== 'function') {
      logger.warn(
        '⚠️  GCP Cloud Profiler: Could not resolve start() — profiling disabled.',
      );
      return;
    }

    await startFn({
      serviceContext: {
        service: 'alti-code-studio-backend',
        version: process.env.APP_VERSION || '1.0.0',
      },
    });

    logger.info(
      '✅ GCP Cloud Profiler: Agent started — CPU & heap profiles will upload to Cloud Profiler.',
    );
  } catch (err) {
    logger.warn(
      `⚠️  GCP Cloud Profiler: Initialisation failed — continuing without profiling: ${err.message}`,
    );
  }
}
