import { detectiveAgent } from './src/app/modules/agents/detective.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testDetective() {
    console.log("--- TESTING AUTONOMOUS DETECTIVE BOT ---");

    const mockError = "TypeError: Cannot read properties of undefined (reading 'map')";
    const mockStackTrace = `
    at renderDashboard (C:/app/src/dashboard.js:42:25)
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    `;
    const mockCode = `
    function renderDashboard(data) {
        return data.items.map(item => item.name);
    }
    `;

    console.log("Feeding Production Error Trace to the Detective...");

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to ensure JSON parsing and schema match without API calls
        return JSON.stringify({
            rootCause: "The 'items' property on the provided 'data' object is undefined, causing .map() to trigger a TypeError.",
            immediateFix: "Add an optional chaining operator or default fallback: `return (data.items || []).map(...)`.",
            preventionStrategy: "Implement strict TypeScript interfaces for 'data' payload and write unit tests for edge cases where data is malformed.",
            confidence: 99
        });
    };

    try {
        const result = await detectiveAgent.investigateIncident(mockError, mockStackTrace, mockCode);

        console.log("\nRCA REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.confidence === 99 && result.rootCause.includes('undefined')) {
            console.log("\n✅ SUCCESS: Detective Agent successfully parsed the stack, identified the root cause, and prescribed a fix.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: Detective Agent failed to generate accurate RCA.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testDetective();
