import { architectureAgent } from './src/app/modules/agents/architecture.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testArchitecture() {
    console.log("--- TESTING AUTONOMOUS SYSTEM ARCHITECT ---");

    const mockTopology = JSON.stringify({
        "billingService.js": ["import { userService } from './userService'"],
        "userService.js": ["import { paymentGateway } from './paymentGateway'"],
        "paymentGateway.js": ["import { billingService } from './billingService'"]
    }, null, 2);

    console.log("Feeding Tightly-Coupled Topology to the ArchitectureAgent...");

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to avoid API latency
        return JSON.stringify({
            assessment: "The topology exhibits severe tight-coupling and a clear Circular Dependency between billing, routing, and user contexts.",
            antiPatterns: ["Circular Dependency Loop (billing -> user -> payment -> billing)"],
            mermaidGraph: "graph TD;\n  BillingService --> UserService;\n  UserService --> PaymentGateway;\n  PaymentGateway --> BillingService;\n  style BillingService fill:#f9f,stroke:#333;",
            complexityScore: 8
        });
    };

    try {
        console.log("\nExecuting Architectural Audit...");
        const result = await architectureAgent.mapArchitecture(mockTopology, 'Payment Core');

        console.log("\nARCHITECTURE REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.complexityScore > 5 && result.antiPatterns[0].includes('Circular') && result.mermaidGraph.includes('graph TD')) {
            console.log("\n✅ SUCCESS: Architecture Agent correctly identified the architectural anti-pattern and synthesized the requested Mermaid visual mapping.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: Architecture Agent failed to parse the graph correctly.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testArchitecture();
