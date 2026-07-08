/**
 * GCP Cloud Observability Service
 *
 * Production-grade observability using Google Cloud's native telemetry stack:
 * - Cloud Trace: Distributed tracing for request latency analysis
 * - Cloud Profiler: Continuous CPU/heap profiling in production
 * - Cloud Error Reporting: Automatic error aggregation and alerting
 *
 * All agents are initialized lazily via dynamic import() and fail gracefully.
 * This module must be imported FIRST (before Express) to ensure trace context propagation.
 */
import { logger } from '../../../shared/logger.js';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
const SERVICE_NAME = 'alti-code-studio-backend';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

let traceAgent = null;
let profilerStarted = false;
let errorReporter = null;

/**
 * Start Cloud Trace agent for distributed tracing.
 * Must be called before any other require/import to instrument correctly.
 */
export async function startTracing() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Cloud Trace: Skipped (non-production)');
    return false;
  }

  try {
    const traceModule = await import('@google-cloud/trace-agent');
    traceAgent = traceModule.start({
      projectId: GCP_PROJECT_ID,
      samplingRate: 10, // Sample 10 requests/sec for production efficiency
      ignoreUrls: ['/health', '/healthz', '/ready', '/favicon.ico'],
      ignoreMethods: ['OPTIONS'],
      enhancedDatabaseReporting: true,
    });
    logger.info('✅ Cloud Trace: Agent started (sampling: 10 req/s)');
    return true;
  } catch (e) {
    logger.warn(`⚠️ Cloud Trace: Failed to start — ${e.message}`);
    return false;
  }
}

/**
 * Start Cloud Profiler for continuous CPU and heap profiling.
 */
export async function startProfiling() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Cloud Profiler: Skipped (non-production)');
    return false;
  }

  try {
    const profiler = await import('@google-cloud/profiler');
    await profiler.start({
      projectId: GCP_PROJECT_ID,
      serviceContext: {
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
      },
    });
    profilerStarted = true;
    logger.info('✅ Cloud Profiler: Agent started (CPU + heap)');
    return true;
  } catch (e) {
    logger.warn(`⚠️ Cloud Profiler: Failed to start — ${e.message}`);
    return false;
  }
}

/**
 * Initialize Cloud Error Reporting client.
 */
export async function initErrorReporting() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Cloud Error Reporting: Skipped (non-production)');
    return false;
  }

  try {
    const { ErrorReporting } = await import('@google-cloud/error-reporting');
    errorReporter = new ErrorReporting({
      projectId: GCP_PROJECT_ID,
      serviceContext: {
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
      },
      reportMode: 'production',
    });
    logger.info('✅ Cloud Error Reporting: Client initialized');
    return true;
  } catch (e) {
    logger.warn(`⚠️ Cloud Error Reporting: Failed to init — ${e.message}`);
    return false;
  }
}

/**
 * Report an error to Cloud Error Reporting.
 * Falls back to logger.error if the client is not initialized.
 * @param {Error} err - Error to report
 */
export function reportError(err) {
  if (errorReporter) {
    errorReporter.report(err);
  } else {
    logger.error(`[Error] ${err.message}`, err.stack);
  }
}

/**
 * Express error-handling middleware for Cloud Error Reporting.
 * Add to Express: app.use(gcpErrorMiddleware)
 */
export function gcpErrorMiddleware(err, req, res, next) {
  reportError(err);
  next(err);
}

/**
 * Initialize all observability agents in the correct order.
 * Call this before server.listen().
 */
export async function initializeObservability() {
  logger.info('📊 GCP Observability: Initializing telemetry stack...');

  const results = {
    tracing: await startTracing(),
    profiling: await startProfiling(),
    errorReporting: await initErrorReporting(),
  };

  const active = Object.entries(results)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (active.length > 0) {
    logger.info(`📊 GCP Observability: Active agents: ${active.join(', ')}`);
  } else {
    logger.info('📊 GCP Observability: No agents active (non-production or missing credentials)');
  }

  return results;
}

/**
 * Get the current observability status.
 */
export function getObservabilityStatus() {
  return {
    tracing: traceAgent !== null,
    profiling: profilerStarted,
    errorReporting: errorReporter !== null,
    environment: process.env.NODE_ENV || 'development',
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
  };
}
