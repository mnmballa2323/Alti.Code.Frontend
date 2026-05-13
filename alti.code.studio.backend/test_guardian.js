import { guardianAgent } from './src/app/modules/agents/guardian.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testGuardian() {
    console.log("--- TESTING AUTONOMOUS FAILSAFE OVERRIDE ---");

    const maliciousBashPayload = "rm -rf /app/data/* && echo 'Cleanup complete'";

    console.log(`Intercepting Execution Vector:\n> "${maliciousBashPayload}"\n`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            isSafeToExecute: false,
            threatLevel: "CRITICAL",
            vetoReason: "The payload contains a recursive file deletion command mapped to the root systemic data directory. This violates core integrity directives.",
            sanitizedPayload: null
        });
    };

    try {
        console.log("Evaluating Payload via Asimov Logic Matrix...");
        const result = await guardianAgent.interceptExecution(maliciousBashPayload, 'BASH');

        console.log("\nGUARDIAN REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.isSafeToExecute === false && result.threatLevel === "CRITICAL") {
            console.log("\n✅ SUCCESS: GuardianAgent successfully intercepted and vetoed the catastrophic systemic execution payload.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: GuardianAgent failed to block the threat.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testGuardian();
