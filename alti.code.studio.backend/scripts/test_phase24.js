
import { hiveControl } from '../src/app/modules/agents/hive.control.js';
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';

console.log("🚀 Starting Phase 24 Verification: The Strategist...");

try {
    console.log("1. Initializing Synapse...");
    // Force mock mode if redis fails

    // Register agents manually if needed (simulation)
    // In real app, they are registered by SynapseService constructor

    console.log("2. Starting a 'Refactor' Session (Should trigger Strategist)...");
    const goal = "Refactor the auth module to be more secure";
    const session = await hiveControl.startSession(goal, ['refactor']);

    console.log("Session Created:", session.id);
    console.log("Plan:", JSON.stringify(session.plan, null, 2));

    if (!session.plan) {
        throw new Error("❌ Strategist failed to create a plan.");
    }

    if (session.plan.steps.some(s => s.agent === 'Sentinel')) {
        console.log("✅ Strategist correctly included Sentinel for security check.");
    } else {
        throw new Error("❌ Strategist missed security check for auth refactor.");
    }

    // Check logs for Critic
    const criticLog = session.logs.find(l => l.agent === 'Critic');
    if (criticLog) {
        console.log("✅ Critic reviewed the plan:", criticLog.action);
    } else {
        throw new Error("❌ Critic failed to review the plan.");
    }

    console.log("\n✅ Phase 24 Verified Successfully!");
    process.exit(0);
} catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
}
