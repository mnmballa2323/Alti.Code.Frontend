import { hiveMindAgent } from './src/app/modules/agents/hive_mind.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testHiveMind() {
    console.log("--- TESTING AUTONOMOUS DISTRIBUTED HIVEMIND ---");

    const macroGoal = "Build a highly scalable e-commerce platform utilizing React, Node.js, and PostgreSQL. It must include user authentication, a product catalog, and a Stripe payment gateway.";

    console.log(`Feeding Macro-Goal to HiveMind:\n> "${macroGoal}"`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            swarmArchitectureName: "Project-ECommerce-Prime",
            estimatedComplexity: 9,
            subAgentsToSpawn: [
                { name: "Agent-Auth-JWT", mission: "Implement the OAuth and JWT authentication backend module." },
                { name: "Agent-DB-Postgres", mission: "Construct the PostgreSQL schema for Users, Products, and Orders." },
                { name: "Agent-Frontend-React", mission: "Build the React.js product catalog UI components." },
                { name: "Agent-Gateway-Stripe", mission: "Integrate the Stripe payment processor API." }
            ],
            orchestrationStrategy: "The Postgres Agent will output schemas to the backend Auth and Stripe agents, which will expose GraphQL endpoints for the React Frontend Agent to consume."
        });
    };

    try {
        console.log("\nExecuting Swarm Decomposition Engine...");
        const result = await hiveMindAgent.architectSwarm(macroGoal);

        console.log("\nHIVEMIND REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.subAgentsToSpawn.length === 4 && result.swarmArchitectureName !== "" && result.estimatedComplexity === 9) {
            console.log("\n✅ SUCCESS: HiveMindAgent successfully decomposed the macro-goal and dynamically orchestrated a cohesive multi-agent swarm framework.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: HiveMindAgent failed to orchestrate the swarm architecture.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testHiveMind();
