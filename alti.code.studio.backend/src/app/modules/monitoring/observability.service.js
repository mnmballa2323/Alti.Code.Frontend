/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Langfuse } from 'langfuse';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import os from 'os';
import { Logging } from '@google-cloud/logging';
import otelNode from '@opentelemetry/sdk-trace-node';
const { NodeTracerProvider } = otelNode;
import otelBase from '@opentelemetry/sdk-trace-base';
const { SimpleSpanProcessor } = otelBase;
import otelExporter from '@opentelemetry/exporter-trace-otlp-http';
const { OTLPTraceExporter } = otelExporter;
import otelResources from '@opentelemetry/resources';
const { Resource } = otelResources;
import otelSemantic from '@opentelemetry/semantic-conventions';
const { SemanticResourceAttributes } = otelSemantic;
import pkgApi from '@opentelemetry/api';
const { trace, context, SpanStatusCode } = pkgApi;
import EventEmitter from 'events';

class ObservabilityService extends EventEmitter {
    constructor() {
        super();
        this.langfuse = null;
        this.localTraces = []; // Buffer for "Glass Cockpit"
        this.maxTraces = 50;
        this.gcpLogging = null;
        this.logName = 'alti-agent-trace-log';
        this.gcpLog = null;
        this.init();
    }

    init() {
        // Initialize Langfuse only if keys are present
        if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
            this.langfuse = new Langfuse({
                publicKey: process.env.LANGFUSE_PUBLIC_KEY,
                secretKey: process.env.LANGFUSE_SECRET_KEY,
                baseUrl: process.env.LANGFUSE_HOST || "https://cloud.langfuse.com"
            });
            logger.info('🔭 Observability: Langfuse initialized.');
        } else {
            logger.warn('🔭 Observability: Langfuse keys missing. Tracing disabled. (GCP Logging client initialized for deployment)');
        }

        // Initialize GCP Logging client in production environments
        if (process.env.NODE_ENV === 'production' && process.env.PRIVATE_CLOUD_MODE !== 'true') {
            this.gcpLogging = new Logging();
            this.gcpLog = this.gcpLogging.log(this.logName);
            logger.info('🔭 Observability: GCP Logging client initialized.');
        } else {
            logger.info('🔭 Observability: GCP Logging client not initialized (private cloud or local dev).');
        }

        // Initialize OpenTelemetry
        try {
            const provider = new NodeTracerProvider({
                resource: new Resource({
                    [SemanticResourceAttributes.SERVICE_NAME]: 'alti-code-studio-backend',
                    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
                }),
            });
            const exporter = new OTLPTraceExporter();
            provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
            provider.register();

            this.tracer = trace.getTracer('alti-agent-swarm');
            this.telemetryEnabled = true;
            logger.info('🔭 Observability: OpenTelemetry Tracing initialized for Mission Control.');
        } catch (error) {
            this.telemetryEnabled = false;
            logger.warn('🔭 Observability: OpenTelemetry initialization failed or not configured.');
        }
    }

    /**
     * Create a new trace for a mission or task
     * Emits a standard observability trace for any Agent execution to both Local UI & Google Cloud
     */
    async emitTrace(agentName, action, metadata = {}) {
        const traceId = `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const localTrace = {
            id: traceId,
            agent: agentName,
            action: action,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            metadata: metadata // Ensure metadata is captured locally
        };
        this.localTraces.unshift(localTrace);
        if (this.localTraces.length > this.maxTraces) this.localTraces.pop();

        // Broadcast to Google Cloud Logging if enabled
        if (this.gcpLog) {
            try {
                const entry = this.gcpLog.entry({ resource: { type: 'global' } }, localTrace);
                await this.gcpLog.write(entry);
            } catch (e) {
                // Fail gracefully
            }
        }

        if (!this.langfuse) return localTrace;

        try {
            const lfTrace = this.langfuse.trace({
                id: traceId,
                name: action,
                sessionId: metadata.sessionId || 'anonymous-session',
                userId: metadata.userId || 'system',
                metadata: {
                    agent: agentName,
                    ...metadata
                }
            });
            return lfTrace;
        } catch (error) {
            logger.error(`🔭 Observability Error: Failed to emit trace for ${agentName}`, error);
            return localTrace;
        }
    }

    /**
     * Update the status of a local trace (e.g. to 'COMPLETED' or 'FAILED').
     * @param {string} traceId - The UUID returned by emitTrace()
     * @param {'COMPLETED'|'FAILED'|string} status
     * @param {object} [metadata]
     */
    updateTraceStatus(traceId, status, metadata = {}) {
        const t = this.localTraces.find(r => r.id === traceId); // Changed from recentTraces to localTraces
        if (t) {
            t.status = status;
            t.completedAt = new Date().toISOString();
            Object.assign(t, metadata);
        }
    }

    /**
     * Create a generation span for an AI call
     * @param {object} trace 
     * @param {string} name 
     * @param {object} params - model, prompt, etc.
     */
    generation(trace, name, params) {
        if (!trace) return null;

        // When Langfuse is disabled, `trace` is a plain local object — not a Langfuse trace.
        // Calling trace.generation() on a plain object throws "is not a function".
        const langfuseTrace = trace._langfuseRef ?? null;
        if (!langfuseTrace || typeof langfuseTrace.generation !== 'function') {
            logger.debug(`🔭 Observability: generation() skipped — Langfuse trace not available for "${name}"`);
            return null;
        }

        return langfuseTrace.generation({
            name,
            model: params.model,
            modelParameters: params.config,
            input: params.prompt,
        });
    }

    async flush() {
        if (this.langfuse) {
            await this.langfuse.flush();
        }
    }

    /**
     * Get recent traces for the Agent Dashboard
     */
    getRecentTraces() {
        return this.localTraces;
    }

    /**
     * Parse and format incoming webhooks from GCP Cloud Logging
     * @param {object} payload - The raw Google Cloud Logging JSON payload
     */
    ingestCloudAlert(payload) {
        logger.info('🔭 Observability: Ingesting Cloud Logging Alert...');

        // Handle standard GCP Log sink shape or fallback
        const incidentId = payload?.incident?.incident_id
            || `gcp-alert-${crypto.randomUUID().slice(0, 8)}`;

        const summary = payload?.incident?.summary || 'Unknown Production Alert';

        let errorLog = summary;
        let stackTrace = "No stack trace provided in alert payload.";

        // Attempt to extract textPayload or jsonPayload from incidents if available
        if (payload?.incident?.condition?.conditionThreshold?.filter) {
            errorLog = `Filter Matched: ${payload.incident.condition.conditionThreshold.filter}\nSummary: ${summary}`;
        }

        // Add to recent traces for visibility
        this.emitTrace(`GCP Alert: ${incidentId}`, 'system', { incidentId });

        return {
            incidentId,
            errorLog,
            stackTrace,
            rawPayload: payload
        };
    }

    /**
     * Start a new distributed trace span for an AI action (OpenTelemetry & WebSocket).
     */
    startAgentSpan(spanName, attributes = {}) {
        if (!this.telemetryEnabled || !this.tracer) return { end: () => { }, setStatus: () => { }, recordException: () => { }, setAttribute: () => { } };

        const span = this.tracer.startSpan(spanName);
        span.setAttributes(attributes);

        // Emit event for real-time WebSocket Mission Control
        this.emit('span_started', {
            traceId: span.spanContext().traceId,
            spanId: span.spanContext().spanId,
            name: spanName,
            attributes,
            timestamp: Date.now()
        });

        return {
            setAttribute: (key, value) => span.setAttribute(key, value),
            setStatus: (code, message) => span.setStatus({ code, message }),
            recordException: (err) => span.recordException(err),
            end: (success = true) => {
                if (!success) {
                    span.setStatus({ code: SpanStatusCode.ERROR });
                } else {
                    span.setStatus({ code: SpanStatusCode.OK });
                }
                span.end();

                // Emit end event for real-time tracking
                this.emit('span_ended', {
                    traceId: span.spanContext().traceId,
                    spanId: span.spanContext().spanId,
                    name: spanName,
                    success,
                    timestamp: Date.now()
                });
            }
        };
    }

    /**
     * Express middleware to wrap incoming HTTP requests in a root trace span.
     */
    requestTracer() {
        return (req, res, next) => {
            if (!this.telemetryEnabled || !this.tracer) return next();

            const span = this.tracer.startSpan(`${req.method} ${req.path}`);
            span.setAttributes({
                'http.method': req.method,
                'http.url': req.originalUrl,
                'http.client_ip': req.ip,
            });

            req.traceSpan = span;

            res.on('finish', () => {
                span.setAttribute('http.status_code', res.statusCode);
                if (res.statusCode >= 400) {
                    span.setStatus({ code: SpanStatusCode.ERROR });
                } else {
                    span.setStatus({ code: SpanStatusCode.OK });
                }
                span.end();
            });

            next();
        };
    }
}

export const observabilityService = new ObservabilityService();
