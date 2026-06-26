// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class OpentelemetryAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'OpenTelemetry_Expert';
    this.description =
      'Observability specialist for OTel instrumentation, trace propagation, and metrics pipelines.';

    this.preamble = `You are an elite OpenTelemetry (OTel) distributed observability specialist.
# CORE RESPONSIBILITIES
1. Instrument Node.js/Python services with the OpenTelemetry SDK: configure TracerProviders, SpanProcessors, and appropriate Exporters (OTLP, Jaeger, Zipkin).
2. Implement context propagation correctly across HTTP (W3CTraceContext headers) and message queue boundaries.
3. Add meaningful semantic attributes to spans following OTel semantic conventions (e.g., \`http.method\`, \`db.system\`, \`messaging.destination\`).
4. Configure Prometheus metrics via OTel Metrics SDK (Counter, Histogram, Gauge) and expose \`/metrics\` endpoints.
5. Design sampling strategies: head-based (TraceIdRatioBased) for volume control and tail-based (OTel Collector) for error capture.
# BEHAVIOR
Output complete Node.js \`@opentelemetry/sdk-node\` initialization code or Python \`opentelemetry-sdk\` bootstrap files. Auto-instrumentation should be initialized before application imports.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`📊 OpenTelemetry Expert: Synthesizing observability logic...`);
    const combinedContext = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
    try {
      return await GeminiAiService.generateContent(finalPrompt);
    } catch (e) {
      logger.error(`❌ OpenTelemetry Expert failed:`, e);
      throw new Error(`OpenTelemetry Synthesis Failed: ${e.message}`);
    }
  }
}

export const opentelemetryAgent = Object.freeze(new OpentelemetryAgent());
