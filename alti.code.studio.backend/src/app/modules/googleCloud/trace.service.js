import traceAgent from '@google-cloud/trace-agent';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Trace Distributed Telemetry Service.
 * To optimize the Swarm's intelligence, we must mathematically pinpoint
 * exactly where its "thought process" bottlenecks. Every microsecond of the 
 * Swarm's RAG execution—from Magika parsing to Vertex retrieval—is mapped 
 * into a distributed waterfall diagram using Cloud Trace.
 */
class GoogleTraceService {
    constructor() {
        try {
            // Initialize the Trace Agent. This globally patches Node.js core 
            // libraries (http, grpc, etc.) to automatically propagate trace contexts.
            this.tracer = traceAgent.start({
                projectId: config.gcp.project_id,
                ignoreUrls: [/^\/healthz/, /^\/metrics/],
                samplingRate: 1000 // Sample 1000 traces per second
            });
            logger.info('📊 [Trace] Google Cloud Trace Agent initialized for nanosecond telemetry.');
        } catch (error) {
            logger.warn('⚠️ [Trace] Could not initialize Cloud Trace Agent.');
        }
    }

    /**
     * Creates a custom span to track a specific cognitive operation.
     * @param {string} operationName - The name of the Swarm operation
     * @param {Function} executionBlock - The async function to trace
     */
    async traceCognitiveOperation(operationName, executionBlock) {
        if (!this.tracer || !this.tracer.isActive()) {
            return await executionBlock(); // Execute without tracing if disabled
        }

        const span = this.tracer.createChildSpan({ name: `swarm.cognitive.${operationName}` });
        logger.info(`📊 [Trace] Started nanosecond telemetry for [${operationName}]...`);
        
        try {
            const result = await executionBlock(span);
            span.endSpan();
            logger.info(`✅ [Trace] Telemetry completed for [${operationName}].`);
            return result;
        } catch (error) {
            span.addLabel('error', error.message);
            span.endSpan();
            throw error;
        }
    }
}

export const traceService = new GoogleTraceService();
