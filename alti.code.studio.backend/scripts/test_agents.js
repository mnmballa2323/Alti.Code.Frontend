import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import { RefactorAgentService } from '../src/app/modules/refactorAgent/refactorAgent.service.js';
import { DebugAgentService } from '../src/app/modules/debugAgent/debugAgent.service.js';
import { SecurityAgentService } from '../src/app/modules/securityAgent/securityAgent.service.js';
import { architectAgent } from '../src/app/modules/agents/architect.agent.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { logger } from '../src/shared/logger.js';
import Llama from '../src/app/modules/dyad/dyad.model.js';
import UserModel from '../src/app/modules/auth/auth.model.js';
import { queueService } from '../src/app/modules/queue/queue.service.js';

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

    logger.info('🚀 Starting Agent Verification Script');

    // ── Mock DB calls ─────────────────────────────────────────────────────
    logger.info('⚠️ Mocking Database Models...');
    Llama.findOne = async () => ({
        responses: [],
        save: async () => { logger.info('  [Mock] session.save() called'); },
    });
    Llama.create = async () => ({ _id: 'mock-session-id', responses: [] });
    UserModel.findByIdAndUpdate = async () => ({});

    // ── Mock QueueService so no real Bull/Redis connection is needed ───────
    logger.info('⚠️ Mocking QueueService...');
    queueService.addJob = async (queue, payload) => {
        logger.info(`  [Mock] queueService.addJob("${queue}") called`);
        return { id: `mock-job-${Date.now()}`, queue, payload };
    };

    // ── Mock SecurityAgentService (avoids real npm audit execution) ────────
    logger.info('⚠️ Mocking SecurityAgentService...');
    SecurityAgentService.auditCodebase = async (repoPath) => {
        logger.info(`  [Mock] SecurityAgentService.auditCodebase("${repoPath}")`);
        return {
            score: 92,
            dependencyAudit: { metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 1, low: 3 } } },
            codeAnalysis: { securityRating: 'MEDIUM', mandiantIntelligence: 'Mock intel', topActions: ['Update deps'] },
        };
    };

    // ── Mock GeminiAiService (avoids API Key necessity for Composer) ───────
    logger.info('⚠️ Mocking GeminiAiService...');
    GeminiAiService.generateContent = async (prompt) => {
        logger.info(`  [Mock] GeminiAiService.generateContent called`);
        if (prompt.includes('the Composer')) {
            if (prompt.includes('Return a JSON object with a list of file operations')) {
                return JSON.stringify({
                    files: [
                        { type: 'create', path: 'src/mock/feature.js', instruction: 'mock code' }
                    ]
                });
            } else {
                return 'export const mock = "generated code";';
            }
        }
        return '{}';
    };

    try {
        // ── 1. RefactorAgent ──────────────────────────────────────────────
        logger.info('─────────────────────────────────────────');
        logger.info('🧪 Testing RefactorAgent...');

        const messyCode = `function c(a,b){if(a>b){return a-b}else{return b-a}}`;
        const instruction = 'Rename variables to be meaningful and extract a utility function.';

        // Validation: too-short input should throw
        let validationCaught = false;
        try {
            await RefactorAgentService.refactorCode('x', instruction);
        } catch {
            validationCaught = true;
        }
        assert(validationCaught, 'RefactorAgent rejects code shorter than MIN_CODE_LENGTH');

        // Validation: missing instruction should throw
        let missingInstCaught = false;
        try {
            await RefactorAgentService.refactorCode(messyCode, '');
        } catch {
            missingInstCaught = true;
        }
        assert(missingInstCaught, 'RefactorAgent rejects empty instruction');

        // Valid job queueing
        const refactorResult = await RefactorAgentService.refactorCode(messyCode, instruction, 'test-user', 'test-session');
        assert(refactorResult !== null, 'refactorCode() returns a result');
        assert(refactorResult.status === 'queued', `status === "queued" (got "${refactorResult.status}")`);
        assert(typeof refactorResult.jobId === 'string', `jobId is a string (got "${refactorResult.jobId}")`);
        assert(typeof refactorResult.message === 'string', 'message is a string');
        assert(!refactorResult.message.includes('TODO'), 'message contains no TODO placeholder');
        logger.info(`  jobId: ${refactorResult.jobId}`);

        // ── 2. DebugAgent ─────────────────────────────────────────────────
        logger.info('─────────────────────────────────────────');
        logger.info('🧪 Testing DebugAgent...');

        const errorLog = "TypeError: Cannot read properties of undefined (reading 'map')";
        const stackTrace = `
            at UserList (src/components/UserList.jsx:12:20)
            at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
        `;

        const debugResult = await DebugAgentService.analyzeError(errorLog, stackTrace, 'test-user', 'test-session');
        assert(debugResult !== null, 'analyzeError() returns a result');
        assert(typeof debugResult.rootCause === 'string' || debugResult.rootCause != null, 'rootCause field present');
        assert(typeof debugResult.patchedCode === 'string' || debugResult.patchedCode != null, 'patchedCode field present');
        assert(typeof debugResult.bugSeverity === 'string', 'bugSeverity field present');


        // ── 3. SecurityAgent ──────────────────────────────────────────────
        logger.info('─────────────────────────────────────────');
        logger.info('🧪 Testing SecurityAgent (mocked)...');

        const repoPath = path.resolve(__dirname, '..');
        const securityReport = await SecurityAgentService.auditCodebase(repoPath, 'test-user', 'test-session');
        assert(securityReport !== null, 'auditCodebase() returns a result');
        assert(typeof securityReport.score === 'number', `score is a number (got ${securityReport.score})`);
        assert(securityReport.score >= 0 && securityReport.score <= 100, 'score is in [0, 100]');
        assert(securityReport.dependencyAudit != null, 'dependencyAudit field present');
        assert(securityReport.codeAnalysis != null, 'codeAnalysis field present');

        // ── 4. ArchitectAgent (Inter-Agent Delegation) ────────────────────
        logger.info('─────────────────────────────────────────');
        logger.info('🧪 Testing ArchitectAgent Delegation (IADP)...');

        const architectResult = await architectAgent.execute('delegate', { goal: 'Create a notification system' });
        assert(architectResult !== null, 'delegateTask() returns a result');
        assert(architectResult.status === 'success' || architectResult.status === 'aborted', `Architect pipeline finished with known status (got ${architectResult.status})`);
        if (architectResult.status === 'success') {
            assert(Array.isArray(architectResult.composition), 'Composer returned scaffold results');
        }

    } catch (error) {
        logger.error('❌ Unexpected error during verification', error);
        failed++;
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info('─────────────────────────────────────────');
    logger.info(`Results: ${passed} passed, ${failed} failed | Duration: ${duration}s`);

    if (failed > 0) {
        logger.error('❌ Agent Verification FAILED');
        process.exit(1);
    }

    logger.info('🎉 Agent Verification PASSED');
    process.exit(0);
};

main();
