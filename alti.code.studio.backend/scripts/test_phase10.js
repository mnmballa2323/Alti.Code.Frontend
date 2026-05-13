
import { watchmanController } from '../src/app/modules/connectivity/watchman.controller.js';
import { courierAgent } from '../src/app/modules/agents/courier.agent.js';
import { graphOrchestrator } from '../src/app/modules/agents/graph.orchestrator.js';
import fs from 'fs/promises';
import path from 'path';

// MOCK RESPONSE
const mockRes = {
    status: (code) => ({
        json: (data) => console.log(`[Response ${code}]`, data)
    })
};

// MOCK ORCHESTRATOR to avoid actual execution overhead during quick verify
graphOrchestrator.executeGraph = async (steps) => {
    console.log("✅ Orchestrator triggered with steps:", JSON.stringify(steps));
    return "Mission Started";
};

const OUTBOX_DIR = path.join(process.cwd(), 'outbox');

async function cleanup() {
    try { await fs.rm(OUTBOX_DIR, { recursive: true, force: true }); } catch (e) { }
}

async function verifyPhase10() {
    console.log("🚀 Testing Phase 10: The Omni-Connection...");
    await cleanup();

    try {
        // --- TEST 1: WATCHMAN (INGRESS) ---
        console.log("\n👀 Testing The Watchman (GitHub Webhook)...");

        const req = {
            params: { source: 'github' },
            body: {
                ref: 'refs/heads/main',
                commits: [{ id: '123', message: 'feat: new thing' }]
            }
        };

        // This should trigger the Orchestrator with a 'judge' mission
        await watchmanController.receiveSignal(req, mockRes);


        // --- TEST 2: COURIER (EGRESS) ---
        console.log("\n📨 Testing The Courier (Message Delivery)...");

        await courierAgent.deliver("This is a test message from Phase 10", "file");

        // Check if file exists
        const files = await fs.readdir(OUTBOX_DIR);
        if (files.length > 0) {
            console.log(`✅ Courier delivered message to ${files[0]}`);
        } else {
            throw new Error("Courier failed to deliver message to file.");
        }

        console.log("\n✅ Phase 10 Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

verifyPhase10();
