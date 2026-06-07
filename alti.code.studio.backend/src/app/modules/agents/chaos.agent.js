/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { observabilityService } from '../monitoring/observability.service.js';

export class ChaosAgent {
    constructor() {
        this.name = 'chaos';
        this.description = 'Autonomous Platform Resiliency Tester (Chaos Monkey)';
        this.capabilities = [
            'Inject randomized faults into telemetry buffers',
            'Simulate network partitions and split-brain scenarios',
            'Validate the responsiveness of the SRE monitoring suite'
        ];
    }

    /**
     * Injects a specified failure scenario directly into the observability pipeline.
     * @param {string} scenario The type of chaos to inject ('db_timeout', '500_storm', 'memory_leak')
     */
    async injectFault(scenario = 'db_timeout') {
        logger.warn(`🔥 Chaos Agent: Authorized for active fault injection. Commencing scenario: [${scenario.toUpperCase()}]`);

        try {
            switch (scenario) {
                case 'db_timeout':
                    this._simulateLogSpike('ERROR', 'Timeout acquiring connection from database pool (pg-cluster-main)', 5);
                    break;
                case '500_storm':
                    this._simulateLogSpike('CRITICAL', '500 Internal Server Error: Gateway timeout from downstream auth service', 10);
                    break;
                case 'memory_leak':
                    this._simulateLogSpike('WARN', 'V8 Heap Memory exceeded 90% threshold. GC thrashing detected.', 3);
                    break;
                default:
                    logger.warn(`🔥 Chaos Agent: Unknown scenario '${scenario}'. Defaulting to slight latency fuzzing.`);
                    this._simulateLogSpike('WARN', 'API response time degraded > 2500ms', 2);
            }

            logger.info(`🔥 Chaos Agent: Fault successfully injected into global telemetry buffer.`);
            return { status: 'INJECTED', scenario };

        } catch (error) {
            logger.error(`❌ Chaos Agent Fault Injection Failed: ${error.message}`);
            throw error;
        }
    }

    _simulateLogSpike(level, message, count) {
        if (!global.observabilityService) {
            logger.warn('🔥 Chaos Agent: Global observability service not mounted. Mocking locally.');
        }

        for (let i = 0; i < count; i++) {
            const fakeTrace = {
                id: `chaos-${Date.now()}-${i}`,
                name: 'ChaosSimulation',
                status: level,
                error: message,
                timestamp: new Date().toISOString()
            };

            if (global.observabilityService) {
                global.observabilityService.recentTraces.unshift(fakeTrace);
            } else {
                // Push directly to the imported instance for tests
                observabilityService.recentTraces.unshift(fakeTrace);
            }
        }
    }

    async process(state) {
        const scenario = state.data?.scenario || 'db_timeout';

        await this.injectFault(scenario);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Chaos Scenario Injected: ${scenario}`]
        };
    }
}

export const chaosAgent = new ChaosAgent();
