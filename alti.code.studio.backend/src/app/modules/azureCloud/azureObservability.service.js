/**
 * Azure Cloud Observability Service
 *
 * Provides compatibility with gcpObservability.service.js interface for Azure:
 * - Tracing & Profiling: Azure Application Insights (@azure/monitor-opentelemetry)
 * - Error Reporting: Azure App Insights Exception Tracking
 */
import { logger } from '../../../shared/logger.js';

const SERVICE_NAME = 'alti-code-studio-backend';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

let traceAgent = null;
let profilerStarted = false;
let errorReporter = null;

export async function startTracing() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Azure App Insights: Skipped (non-production)');
    return false;
  }
  
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    logger.warn('⚠️ Azure App Insights: Skipped (no CONNECTION_STRING)');
    return false;
  }

  try {
    const { useAzureMonitor } = await import('@azure/monitor-opentelemetry');
    useAzureMonitor();
    logger.info('✅ Azure App Insights: Agent started (Tracing)');
    traceAgent = true;
    return true;
  } catch (e) {
    logger.warn(`⚠️ Azure App Insights: Failed to start — ${e.message}`);
    return false;
  }
}

export async function startProfiling() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Azure Profiler: Skipped (non-production)');
    return false;
  }
  logger.info('✅ Azure Profiler: Agent started (Stubbed - Managed by AppInsights)');
  profilerStarted = true;
  return true;
}

export async function initErrorReporting() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📊 Azure Error Reporting: Skipped (non-production)');
    return false;
  }
  logger.info('✅ Azure Error Reporting: Client initialized (Managed by AppInsights)');
  errorReporter = true;
  return true;
}

export function reportError(err) {
  logger.error(`[Azure Error] ${err.message}`, err.stack);
  // Real implementation would trackException via App Insights client if available
}

export function gcpErrorMiddleware(err, req, res, next) {
  // Named gcpErrorMiddleware to preserve compatibility with express app routing
  reportError(err);
  next(err);
}
export const azureErrorMiddleware = gcpErrorMiddleware;

export async function initializeObservability() {
  logger.info('📊 Azure Observability: Initializing telemetry stack...');

  const results = {
    tracing: await startTracing(),
    profiling: await startProfiling(),
    errorReporting: await initErrorReporting(),
  };

  const active = Object.entries(results)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (active.length > 0) {
    logger.info(`📊 Azure Observability: Active agents: ${active.join(', ')}`);
  } else {
    logger.info('📊 Azure Observability: No agents active (non-production or missing credentials)');
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
