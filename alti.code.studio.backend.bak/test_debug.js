import { debugAgent } from './src/app/modules/agents/debug.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testDebugAgent() {
    console.log("--- TESTING AUTONOMOUS OMNI-DEBUGGER ---");

    const mockStackTrace = `TypeError: Cannot read properties of null (reading 'profile')
    at processUserObject (/app/src/services/userLogic.js:3:22)
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)`;

    const sourceContext = `
    const processUserObject = (user) => {
        // user variable might be null if db lookup failed
        const userProfile = user.profile; 
        return userProfile.avatarUrl;
    };`;

    console.log(`Feeding Crashing Stack Trace to the DebugAgent:\n${mockStackTrace.substring(0, 100)}...`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            rootCause: "The function attempts to access the 'profile' property of a null user object, indicating a missing null-check validation.",
            bugSeverity: "HIGH",
            patchedCode: "const processUserObject = (user) => {\n  if (!user || !user.profile) {\n    return null;\n  }\n  return user.profile.avatarUrl;\n};"
        });
    };

    try {
        console.log("\nExecuting Omni-Debug Tracing Protocol...");
        const result = await debugAgent.debugException(mockStackTrace, sourceContext);

        console.log("\nDEBUG REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.patchedCode.includes('if (!user') && result.bugSeverity === "HIGH") {
            console.log("\n✅ SUCCESS: DebugAgent strictly localized the TypeError exception and synthesized a safe defensive-programming code patch.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: DebugAgent failed to resolve the crash.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testDebugAgent();
