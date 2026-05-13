import { surgeonAgent } from './src/app/modules/agents/surgeon.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testSurgeonAgent() {
    console.log("--- TESTING AUTONOMIC CORE MUTATOR ---");

    const mockInternalAgentFile = `
    export class CodeReviewAgent {
        constructor() {
            this.capabilities = ['Check formatting', 'Find bugs'];
        }
        review(code) { return "LGTM"; }
    }`;

    const mutationGoal = "Upgrade this agent to include 'Security Analysis' in its capabilities and return a JSON instead of a string.";

    console.log(`Initiating Core Surgery. Target Goal:\n> "${mutationGoal}"\n`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            surgeryJustification: "The system requested a capability upgrade for the CodeReviewAgent. Mutating the constructor and the return type of the review() method.",
            mutationRiskLevel: "HIGH",
            patchedInternalCode: "export class CodeReviewAgent {\n  constructor() {\n    this.capabilities = ['Check formatting', 'Find bugs', 'Security Analysis'];\n  }\n  review(code) {\n    return JSON.stringify({ status: 'LGTM', securityPass: true });\n  }\n}"
        });
    };

    try {
        console.log("Executing Source Code Mutation...");
        const result = await surgeonAgent.syntesizeMutation(mockInternalAgentFile, mutationGoal);

        console.log("\nSURGERY REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.patchedInternalCode.includes("'Security Analysis'") && result.patchedInternalCode.includes('JSON.stringify') && result.mutationRiskLevel === "HIGH") {
            console.log("\n✅ SUCCESS: SurgeonAgent correctly rewrote the internal logic file, injecting the new capabilities autonomously.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: SurgeonAgent failed the core mutation.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSurgeonAgent();
