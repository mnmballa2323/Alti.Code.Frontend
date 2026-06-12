
import { healerAgent } from '../src/app/modules/agents/healer.agent.js';
import { prophetAgent } from '../src/app/modules/agents/prophet.agent.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { GitAgentService } from '../src/app/modules/gitAgent/gitAgent.service.js';
import { GcsService } from '../src/app/modules/googleCloud/gcs.service.js';
import { FirestoreSyncService } from '../src/app/modules/googleCloud/firestoreSync.service.js';
import fs from 'fs/promises';
import path from 'path';

// MOCK GCS & FIRESTORE
GcsService.uploadFile = async (bucketName, destFileName, content) => {
    console.log(`[MockGCS] Uploaded to ${bucketName}/${destFileName}`);
    return `mock_snapshot_${destFileName}`;
};
FirestoreSyncService.persistCrdtUpdate = async (docId, buffer) => {
    console.log(`[MockFirestoreSync] Persisted CRDT update for ${docId}`);
};

// MOCK GEMINI
GeminiAiService.generateContent = async (prompt) => {
    if (prompt.includes('"The Healer"')) {
        return `const x = 10;
        console.log("Fixed by Healer");`;
    }
    if (prompt.includes('"The Prophet"')) {
        return JSON.stringify({
            prediction: "High Risk",
            reason: "Nested loops detected",
            suggestion: "Extract inner loop to function"
        });
    }
    return "Unknown Prompt";
};

// MOCK GIT
GitAgentService.commitChanges = async (msg) => {
    console.log(`[MockGit] Committed: ${msg}`);
};

const TEST_DIR = './temp_healer_test';
const BROKEN_FILE = path.join(TEST_DIR, 'broken.js');

async function setup() {
    try { await fs.mkdir(TEST_DIR, { recursive: true }); } catch (e) { }
    // Create a broken file
    await fs.writeFile(BROKEN_FILE, 'const x = ; // Syntax Error');
}

async function cleanup() {
    try { await fs.rm(TEST_DIR, { recursive: true, force: true }); } catch (e) { }
}

async function verifyPhase6() {
    console.log("🚀 Testing Phase 6: The Singularity (Autonomous Evolution)...");
    await setup();

    try {
        // --- TEST 1: THE HEALER ---
        console.log("\n🩹 Testing The Healer...");

        const result = await healerAgent.heal(BROKEN_FILE, "SyntaxError: Unexpected token ';'");
        if (!result.success) throw new Error("Healer failed.");

        const fixedContent = await fs.readFile(BROKEN_FILE, 'utf-8');
        if (fixedContent.includes('const x = 10;')) {
            console.log("✅ Healer Successfully Repaired the Code!");
        } else {
            throw new Error("Healer did not apply the expected fix.");
        }

        // --- TEST 2: THE PROPHET ---
        console.log("\n🔮 Testing The Prophet...");
        const insight = await prophetAgent.predict(BROKEN_FILE);

        if (insight && insight.prediction === "High Risk") {
            console.log(`✅ Prophet Prediction: ${insight.prediction} - ${insight.suggestion}`);
        } else {
            throw new Error("Prophet failed to predict.");
        }

        console.log("\n✅ Phase 6 (Singularity) Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

verifyPhase6();
