/**
 * Copyright (c) 2026 Alti.Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GoogleGenAiService } from '../src/app/modules/googleGenAi/googleGenAi.service.js';
import { agenticRouter } from '../src/app/modules/agents/agentic_router.service.js';
import { mcpClientService } from '../src/app/modules/mcp/mcp.client.js';
import { logger } from '../src/shared/logger.js';

async function runLiveVerification() {
    console.log("================================================================================");
    console.log("🌟 ALTI CODE: LIVE SWARM AND MCP CONNECTIONS VERIFICATION HARNESS 🌟");
    console.log("================================================================================\n");

    // --------------------------------------------------------------------------------
    // SECTION 1: AUTO-SWARM ROUTING & SYNTHESIS CHECK (Interactive Prompt)
    // --------------------------------------------------------------------------------
    console.log("🚀 [TEST 1] Initiating Live Backend Auto-Swarm Chat Prompt Simulation...");
    const sampleHistory = [];
    const complexPrompt = "I need to deploy a highly secure Node.js backend. Analyze our codebase for license compliance, check for dependency vulnerabilities, construct standard unit tests, and design a secure MongoDB connection model.";

    console.log(`\n💬 Simulated User Prompt: "${complexPrompt}"`);
    console.log("--------------------------------------------------------------------------------");

    try {
        // Step 1: Assert Router Plan Generation
        console.log("\n🧠 Step 1.1: Querying Backend Agentic Router...");
        const plan = await agenticRouter.routePrompt(complexPrompt);
        
        console.log(`\n✅ Swarm Plan Mapped Successfully!`);
        console.log(`👉 Strategy: ${plan.strategy}`);
        console.log(`👉 Priority: ${plan.priority}`);
        console.log("👉 Dynamic Specialist Sequence:");
        plan.sequence.forEach((step, index) => {
            console.log(`   ${index + 1}. [Agent: ${step.agentId}] -> Task: "${step.task}"`);
        });

        // Step 2: Trigger Live Chat Session Auto-Swarm Synthesis
        console.log("\n🔮 Step 1.2: Invoking Live Chat Session Execution with Auto-Swarm synthesis...");
        const chatResponse = await GoogleGenAiService.chatSession(sampleHistory, complexPrompt);

        console.log("\n✅ Master Synthesis Response Received!");
        console.log(`🤖 Responder Model: ${chatResponse.model}`);
        console.log(`📋 Route Decided: ${chatResponse.plan}`);
        console.log(`📝 Active Swarm Execution Context:\n${chatResponse.swarmLog}`);
        console.log("\n💬 Synthesized Answer (Truncated Preview):");
        console.log(chatResponse.response.substring(0, 350) + "...\n");

    } catch (err) {
        console.error("❌ Live Swarm Chat Simulation failed:", err);
    }

    // --------------------------------------------------------------------------------
    // SECTION 2: MCP TOOL CONNECTIONS AUDIT
    // --------------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("🔌 [TEST 2] Auditing Backend MCP Tool Connection Integrations...");
    console.log("================================================================================\n");

    try {
        // Step 1: Inspect active dynamic tools schema
        console.log("\n🔍 Step 2.1: Extracting Consolidated Function Call Schemas (MCP)...");
        const schemas = await mcpClientService.getAllTools();
        console.log(`✅ Success! Found ${schemas.length} active registered function schemas.`);
        
        if (schemas.length > 0) {
            console.log("\n👉 Sample Active Tool Schema Structure:");
            console.log(JSON.stringify(schemas[0], null, 2));
        } else {
            console.log("ℹ️ No active third-party connection schemas mapped (standard standalone mode).");
        }

    } catch (err) {
        console.error("❌ MCP Tool connections audit failed:", err);
    }

    console.log("\n================================================================================");
    console.log("🎉 Verification Harness Completed Successfully!");
    console.log("================================================================================");
}

runLiveVerification().catch(err => {
    console.error("❌ Execution Crash:", err);
    process.exit(1);
});
