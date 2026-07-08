/**
 * GCP Cloud Trace Integration
 *
 * Wires OpenTelemetry traces into Google Cloud Trace via the
 * @google-cloud/opentelemetry-cloud-trace-exporter SDK.
 *
 * Call `initGcpTrace()` at app startup (before any HTTP handlers).
 * Use `getTracer(name)` to obtain a scoped tracer for manual spans.
 *
 * If GCP credentials are not available the module silently degrades —
 * no spans are exported but the tracer API remains functional (noop).
 */

import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import * as api from '@opentelemetry/api';
import { logger } from './logger.js';

let provider = null;
let initialized = false;

/**
 * Initialise the GCP Cloud Trace pipeline.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initGcpTrace() {
  if (initialized) {
    return;
  }

  try {
    // Skip in test unless explicitly opted-in
    if (
      process.env.NODE_ENV === 'test' &&
      process.env.GCP_REAL_SERVICES !== 'true'
    ) {
      logger.info(
        '⏭️  GCP Cloud Trace: Skipped initialisation (test environment).',
      );
      initialized = true;
      return;
    }

    // Require at least one credential indicator
    if (
      !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      !process.env.GCP_PROJECT_ID &&
      !process.env.GCLOUD_PROJECT
    ) {
      logger.warn(
        '⚠️  GCP Cloud Trace: No GCP credentials detected — trace export disabled. ' +
          'Set GOOGLE_APPLICATION_CREDENTIALS or GCP_PROJECT_ID to enable.',
      );
      initialized = true;
      return;
    }

    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: 'alti-code-studio-backend',
      [SEMRESATTRS_SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    });

    provider = new NodeTracerProvider({ resource });

    const exporter = new TraceExporter();
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register(); // registers globally with @opentelemetry/api

    logger.info(
      '✅ GCP Cloud Trace: Provider registered — spans will export to Cloud Trace.',
    );
    initialized = true;
  } catch (err) {
    logger.warn(
      `⚠️  GCP Cloud Trace: Initialisation failed, continuing without trace export: ${err.message}`,
    );
    initialized = true; // prevent retry loops
  }
}

/**
 * Return a named tracer.
 *
 * If the provider was never initialised the OpenTelemetry API hands back
 * a noop tracer so callers can always use `tracer.startSpan()` safely.
 *
 * @param {string} name - Instrumentation scope name (e.g. 'http-handler')
 * @returns {import('@opentelemetry/api').Tracer}
 */
export function getTracer(name) {
  return api.trace.getTracer(name);
}

/**
 * Gracefully shut down the provider (flushes pending spans).
 */
export async function shutdownGcpTrace() {
  if (provider) {
    try {
      await provider.shutdown();
      logger.info('🛑 GCP Cloud Trace: Provider shut down.');
    } catch (err) {
      logger.error(
        `❌ GCP Cloud Trace: Error during shutdown: ${err.message}`,
      );
    }
  }
}
