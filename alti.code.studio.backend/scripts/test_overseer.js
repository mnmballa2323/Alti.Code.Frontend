import { overseerAgent } from '../src/app/modules/agents/overseer.agent.js';
import { DebugAgentService } from '../src/app/modules/debugAgent/debugAgent.service.js';
import { logger } from '../src/shared/logger.js';

// MOCK DebugAgentService
DebugAgentService.analyzeError = async (errorLog, contextCode) => {
    logger.info(`  [Mock] DebugAgentService.analyzeError called for error: ${errorLog.split('\n')[0]}`);
    // Provide an intelligent patch fixing the assertion failure
    if (contextCode.includes('return a + b;')) {
        return {
            patchedCode: contextCode.replace('return a + b;', 'return a * b;'),
            bugSeverity: 'LOW'
        };
    }
    return {
        patchedCode: contextCode,
        bugSeverity: 'LOW'
    };
};

async function testOverseer() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 2 Self-Healing Code (The Overseer)");
    logger.info("===========================================");

    try {
        // Snippet intentionally fails test assertion (multiply by addition)
        const buggyCode = `
            const assert = require('assert');
            function multiply(a, b) { 
                return a + b; // Bug
            }
            assert.strictEqual(multiply(3, 4), 12, 'Multiplication failed');
            'Success';
        `;

        logger.info(`Sending buggy code snippet to The Overseer for Sandbox Execution...`);

        const result = await overseerAgent.executeInSandboxAndHeal(buggyCode);

        if (result.status === 'success' && result.healed) {
            logger.info("✅ Overseer Auto-Healing Test Passed!");
            logger.info(`Final Patched Code:\n${result.finalCode}`);
            process.exit(0);
        } else {
            logger.error("❌ Overseer Auto-Healing Test Failed", result);
            process.exit(1);
        }
    } catch (e) {
        logger.error("❌ Protocol Test Crashed", e);
        process.exit(1);
    }
}

testOverseer();
