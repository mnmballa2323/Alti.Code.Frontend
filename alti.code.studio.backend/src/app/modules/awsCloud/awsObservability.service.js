/**
 * AWS Cloud Observability Service (Stub Interface)
 *
 * Provides compatibility with gcpObservability.service.js interface for AWS:
 * - Tracing: AWS X-Ray (Stubbed here for parity)
 * - Profiling: CodeGuru Profiler (Stubbed here for parity)
 * - Error Reporting: CloudWatch (Stubbed here for parity)
 */
import { logger } from '../../../shared/logger.js';

let traceAgent = null;
let profilerStarted = false;
let errorReporter = null;

const SERVICE_NAME = 'alti-code-studio-backend';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

export async function startTracing() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 AWS X-Ray: Skipped (non-production)');
    return false;
  }
  logger.info('✅ AWS X-Ray: Agent started (Stubbed)');
  traceAgent = true;
  return true;
}

export async function startProfiling() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 AWS CodeGuru Profiler: Skipped (non-production)');
    return false;
  }
  logger.info('✅ AWS CodeGuru Profiler: Agent started (Stubbed)');
  profilerStarted = true;
  return true;
}

export async function initErrorReporting() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 AWS CloudWatch Error Reporting: Skipped (non-production)');
    return false;
  }
  logger.info('✅ AWS CloudWatch Error Reporting: Client initialized (Stubbed)');
  errorReporter = true;
  return true;
}

export function reportError(err) {
  logger.error(`[AWS Error Reporting] ${err.message}`, err.stack);
}

export function gcpErrorMiddleware(err, req, res, next) {
  // Named gcpErrorMiddleware to preserve compatibility with express app routing
  reportError(err);
  next(err);
}
export const awsErrorMiddleware = gcpErrorMiddleware;

export async function initializeObservability() {
  logger.info('📊 AWS Observability: Initializing telemetry stack...');

  const results = {
    tracing: await startTracing(),
    profiling: await startProfiling(),
    errorReporting: await initErrorReporting(),
  };

  const active = Object.entries(results)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (active.length > 0) {
    logger.info(`📊 AWS Observability: Active agents: ${active.join(', ')}`);
  } else {
    logger.info('📊 AWS Observability: No agents active (non-production)');
  }

  return results;
}

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
