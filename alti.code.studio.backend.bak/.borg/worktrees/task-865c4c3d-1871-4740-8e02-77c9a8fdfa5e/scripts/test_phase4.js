
import { vectorStoreService } from '../src/app/modules/memory/vector.store.js';
import { sirenAgent } from '../src/app/modules/agents/siren.agent.js';
import { logger } from '../src/shared/logger.js';

async function testPhase4() {
    console.log("🚀 Testing Phase 4: Voice & Vector DB...");

    try {
        // Test Voice Instantiation
        if (sirenAgent) {
            console.log("✅ Siren Agent (Voice) instantiated.");
            // Optional: sirenAgent.speak("System check initiated."); 
        }

        // Test Vector Store Instantiation
        if (vectorStoreService) {
            console.log("✅ Vector Store (Chroma) instantiated.");
        }

        console.log("ALL PHASE 4 SERVICES LOADED SUCCESSFULLY.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Phase 4 Test Failed:", error);
        process.exit(1);
    }
}

testPhase4();
