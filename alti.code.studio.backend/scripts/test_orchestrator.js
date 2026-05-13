
import path from 'path';
import { fileURLToPath } from 'url';
import { Orchestrator } from '../src/app/modules/agents/orchestrator.agent.js';
import { logger } from '../src/shared/logger.js';
import Llama from '../src/app/modules/dyad/dyad.model.js';
import UserModel from '../src/app/modules/auth/auth.model.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { auditService } from '../src/app/modules/audit/audit.service.js';
import { SecurityAgentService } from '../src/app/modules/securityAgent/securityAgent.service.js';
import { redisClient } from '../src/shared/redis.client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
    const start = Date.now();
    let passed = 0;
    let failed = 0;

    function assert(condition, label) {
        if (condition) {
            logger.info(`  ✅ ${label}`);
            passed++;
        } else {
            logger.error(`  ❌ ${label}`);
            failed++;
        }
    }

    logger.info('🚀 Starting Orchestrator Verification Script');

    // --- Mock DB calls to avoid requiring a live database ---
    logger.info('⚠️ Mocking Database Models...');
    Llama.findOne = async () => null;
    Llama.create = async () => ({ _id: 'mock-session-id', responses: [] });
    UserModel.findByIdAndUpdate = async () => ({});

    // --- Mock external services ---
    logger.info('⚠️ Mocking Audit and Security Agent Services...');
    if (auditService) {
        auditService.logAction = async () => logger.info('  [Mock] Audit logAction called');
    }
    if (SecurityAgentService) {
        SecurityAgentService.auditCodebase = async () => {
            logger.info('  [Mock] Security Audit called');
            return { score: 100, report: 'Mock Report' };
        };
    }

    // --- Mock Gemini to return a deterministic plan without API cost ---
    // The OrchestratorAgent uses GeminiAiService.generateContent (the circuit-breaker path)
    logger.info('⚠️ Mocking GeminiAiService.generateContent...');
    GeminiAiService.generateContent = async () => {
        logger.info('🤖 [Mock] generateContent called for plan generation');
        return JSON.stringify({
            steps: [
                { id: 1, agent: 'security', action: 'audit', description: 'Audit the codebase', args: { repoPath: '.' } },
                { id: 2, agent: 'git', action: 'commit', description: 'Commit changes', args: { message: 'chore: updates' } },
            ],
        });
    };

    // --- Mock Redis ---
    logger.info('⚠️ Mocking Redis Client...');
    const mockRedisStore = new Map();
    redisClient.hsetobj = async (key, obj) => {
        mockRedisStore.set(key, { ...mockRedisStore.get(key), ...obj });
    };
    redisClient.hgetall = async (key) => mockRedisStore.get(key) || null;
    redisClient.keys = async (pattern) => {
        const prefix = pattern.replace('*', '');
        return [...mockRedisStore.keys()].filter(k => k.startsWith(prefix));
    };

    try {
        logger.info('------------------------------------------------');
        logger.info('🧠 Testing Orchestrator Planning and Execution...');

        const goal = 'Audit the system and commit changes';
        const result = await Orchestrator.execute(goal, 'test-user', 'test-session');

        logger.info('📋 Mission Result:', JSON.stringify(result, null, 2));

        // Assertions
        assert(result !== null && result !== undefined, 'execute() returns a result');
        assert(result.status === 'success', `status === 'success' (got "${result.status}")`);
        assert(typeof result.traceId === 'string', 'result has a traceId string');
        assert(result.sessionId === 'test-session', 'sessionId is preserved');
        assert(Array.isArray(result.completed_steps), 'completed_steps is an array');

        // Mission status store
        const stored = await Orchestrator.getMissionStatus(result.traceId);
        assert(stored !== null, 'getMissionStatus() returns the stored mission');
        assert(stored.status === 'success', 'stored mission status === success');

        // Mission list
        const missions = await Orchestrator.listMissions();
        assert(Array.isArray(missions) && missions.length > 0, 'listMissions() returns a non-empty array');

    } catch (e) {
        logger.error('Orchestrator verification threw unexpectedly', e);
        failed++;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info('------------------------------------------------');
    logger.info(`Results: ${passed} passed, ${failed} failed | Duration: ${duration}s`);

    if (failed > 0) {
        logger.error('❌ Orchestrator Verification FAILED');
        process.exit(1);
    }

    logger.info('🎉 Orchestrator Verification PASSED');
    process.exit(0);
};

main();
