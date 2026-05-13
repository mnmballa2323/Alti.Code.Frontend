
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestratorAgent } from '../src/app/modules/agents/orchestrator.agent.js';
import { logger } from '../src/shared/logger.js';
import Llama from '../src/app/modules/dyad/dyad.model.js';
import UserModel from '../src/app/modules/auth/auth.model.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
// Import services to mock
import { auditService } from '../src/app/modules/audit/audit.service.js';
import { SecurityAgentService } from '../src/app/modules/securityAgent/securityAgent.service.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
    logger.info('🚀 Starting Orchestrator Verification Script');

    // MOCK DB CALLS
    logger.info('⚠️ Mocking Database Models to avoid connection...');
    Llama.findOne = async () => null;
    Llama.create = async () => ({ _id: 'mock-session-id', responses: [] });
    UserModel.findByIdAndUpdate = async () => ({});

    // MOCK Services
    logger.info('⚠️ Mocking Audit and Agent Services...');
    if (auditService) {
        auditService.logAction = async () => { logger.info('  [Mock] Audit logAction called'); };
    }

    if (SecurityAgentService) {
        SecurityAgentService.auditCodebase = async () => {
            logger.info('  [Mock] Security Audit called');
            return { score: 100, report: 'Mock Report' };
        };
    }

    // MOCK Gemini Service to avoid real API calls and cost during verified script
    // We mock the `geminiService` method on the exported object if possible, 
    // or we interpret the agent's behavior. 
    // Since we want to test the PLANNING logic, we should probably mock the `generateContent` or similar?
    // The Orchestrator uses `GeminiAiService.geminiService`.

    // Let's mock the actual Gemini call to return a deterministic plan.
    GeminiAiService.geminiService = async () => {
        logger.info('🤖 Mock Gemini called for plan generation');
        return {
            reply: `\`\`\`json
            {
                "steps": [
                    { "id": 1, "agent": "security", "action": "audit", "description": "Audit the codebase", "args": { "repoPath": "." } },
                    { "id": 2, "agent": "git", "action": "commit", "description": "Commit changes", "args": { "message": "chore: updates" } }
                ]
            }
            \`\`\``
        };
    };

    try {
        logger.info('------------------------------------------------');
        logger.info('🧠 Testing Orchestrator Planning...');

        const goal = "Audit the system and commit changes";
        const result = await orchestratorAgent.execute(goal, 'test-user', 'test-session');

        logger.info('✅ Mission Result:', JSON.stringify(result, null, 2));

        if (result.status === 'success' && result.completed_steps.length === 2) {
            logger.info('🎉 Orchestrator Verification PASSED');
        } else {
            logger.error('❌ Orchestrator Verification FAILED');
            process.exit(1);
        }

    } catch (e) {
        logger.error('Orchestrator verification failed', e);
        process.exit(1);
    }
};

main();
