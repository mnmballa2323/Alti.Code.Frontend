
import path from 'path';
import { fileURLToPath } from 'url';
import { Orchestrator } from './src/app/modules/agents/orchestrator.agent.js';
import { logger } from './src/shared/logger.js';
import Llama from './src/app/modules/dyad/dyad.model.js';
import UserModel from './src/app/modules/auth/auth.model.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';
import { auditService } from './src/app/modules/audit/audit.service.js';
import { SecurityAgentService } from './src/app/modules/securityAgent/securityAgent.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
    const start = Date.now();
    let passed = 0;
    let failed = 0;

    function assert(condition, label) {
        if (condition) { logger.info(`  ✅ ${label}`); passed++; }
        else { logger.error(`  ❌ ${label}`); failed++; }
    }

    logger.info('🚀 Starting Orchestrator Verification Script (Root)');

    // --- Mock DB calls ---
    logger.info('⚠️ Mocking Database Models...');
    Llama.findOne = async () => null;
    Llama.create = async () => ({ _id: 'mock-session-id', responses: [] });
    UserModel.findByIdAndUpdate = async () => ({});

    // --- Mock services ---
    logger.info('⚠️ Mocking Audit and Security Services...');
    if (auditService) {
        auditService.logAction = async () => logger.info('  [Mock] auditService.logAction');
    }
    if (SecurityAgentService) {
        SecurityAgentService.auditCodebase = async () => ({ score: 100, report: 'Mock Report' });
    }

    // --- Mock Gemini — use generateContent (stateless path, matches what OrchestratorAgent uses) ---
    logger.info('⚠️ Mocking GeminiAiService.generateContent...');
    GeminiAiService.generateContent = async () => {
        logger.info('🤖 [Mock] generateContent called');
        return JSON.stringify({
            steps: [
                { id: 1, agent: 'security', action: 'audit', description: 'Audit the codebase', args: { repoPath: '.' } },
                { id: 2, agent: 'git', action: 'commit', description: 'Commit changes', args: { message: 'chore: updates' } },
            ],
        });
    };

    try {
        logger.info('------------------------------------------------');
        logger.info('🧠 Testing Orchestrator Planning and Execution...');

        const goal = 'Audit the system and commit changes';
        const result = await Orchestrator.execute(goal, 'test-user', 'test-session');

        logger.info('📋 Mission Result:', JSON.stringify(result, null, 2));

        assert(result != null, 'execute() returns a result');
        assert(result.status === 'success', `status === "success" (got "${result.status}")`);
        assert(typeof result.traceId === 'string', 'result has a traceId string');
        assert(result.sessionId === 'test-session', 'sessionId preserved');
        assert(Array.isArray(result.completed_steps), 'completed_steps is an array');

        const stored = Orchestrator.getMissionStatus(result.traceId);
        assert(stored !== null, 'getMissionStatus() returns stored mission');
        assert(stored.status === 'success', 'stored status === success');

    } catch (e) {
        logger.error('Orchestrator verification threw unexpectedly', e);
        failed++;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info('------------------------------------------------');
    logger.info(`Results: ${passed} passed, ${failed} failed | ${duration}s`);

    if (failed > 0) { logger.error('❌ FAILED'); process.exit(1); }
    logger.info('🎉 PASSED');
    process.exit(0);
};

main();
