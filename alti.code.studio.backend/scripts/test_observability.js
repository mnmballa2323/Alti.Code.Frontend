import { observabilityService } from '../src/app/modules/monitoring/observability.service.js';
import { logger } from '../src/shared/logger.js';

async function generateTraces() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 4 The Glass Cockpit (Mock Traces)");
    logger.info("===========================================");

    logger.info("Generating Mock Traces...");

    // Create random traces
    const trace1 = observabilityService.trace('Code Synthesis (Composer)', 'sys_builder', 'session-alpha');
    observabilityService.updateTraceStatus(trace1.id, 'RUNNING');

    // Simulate slight delay
    await new Promise(r => setTimeout(r, 100));

    const trace2 = observabilityService.trace('Security Audit (Sentinel)', 'sys_sec', 'session-alpha');
    observabilityService.updateTraceStatus(trace2.id, 'FAILED', { reason: 'Critical vulnerabilities found' });

    await new Promise(r => setTimeout(r, 100));

    const trace3 = observabilityService.trace('Vector Retrieval (Historian)', 'sys_mem', 'session-beta');
    observabilityService.updateTraceStatus(trace3.id, 'COMPLETED');

    logger.info("✅ Inject complete. The frontend 'Agent View' terminal should now display these traces automatically.");

    // Do not exit, keep process alive so frontend can poll them if we want to test locally by making a request
    // Alternatively, we just exit, because the process memory won't persist to the actual running backend
}

generateTraces();
