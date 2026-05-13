
import { judgeAgent } from '../src/app/modules/agents/judge.agent.js';
import { diplomatAgent } from '../src/app/modules/agents/diplomat.agent.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

// MOCK GEMINI (For Prophet)
GeminiAiService.generateContent = async (prompt) => {
    if (prompt.includes('SafeCode')) return "null"; // Clean
    if (prompt.includes('ComplexCode')) return JSON.stringify({ prediction: "High Risk", reason: "Too nested" });
    return "null";
};

const TEST_DIR = './temp_phase9_test';
const BAD_FILE = path.join(TEST_DIR, 'bad.js');
const GOOD_FILE = path.join(TEST_DIR, 'good.js');

async function setup() {
    try { await fs.mkdir(TEST_DIR, { recursive: true }); } catch (e) { }

    // 1. Create Vulnerable File (Breaker should catch)
    await fs.writeFile(BAD_FILE, `
        const apiKey = "1234567890abcdef1234567890"; // Hardcoded
    `);

    // 2. Create Clean File
    await fs.writeFile(GOOD_FILE, `
        const x = 1;
        // SafeCode
    `);
}

async function cleanup() {
    try { await fs.rm(TEST_DIR, { recursive: true, force: true }); } catch (e) { }
}

async function verifyPhase9() {
    console.log("🚀 Testing Phase 9: The Executive Suite...");
    await setup();

    try {
        // --- TEST 1: THE JUDGE vs BAD CODE ---
        console.log("\n⚖️ Testing The Judge (Bad Code)...");
        const badVerdict = await judgeAgent.review(BAD_FILE);

        console.log("Bad Verdict:", badVerdict);
        if (badVerdict.status === 'FAIL') {
            console.log("✅ Judge correctly REJECTED bad code.");
        } else {
            throw new Error("Judge failed to reject bad code.");
        }

        // --- TEST 2: THE JUDGE vs GOOD CODE ---
        console.log("\n⚖️ Testing The Judge (Good Code)...");
        const goodVerdict = await judgeAgent.review(GOOD_FILE);

        console.log("Good Verdict:", goodVerdict);
        if (goodVerdict.status === 'PASS') {
            console.log("✅ Judge correctly PASSED good code.");
        } else {
            throw new Error(`Judge failed to pass good code. Status: ${goodVerdict.status}, Issues: ${JSON.stringify(goodVerdict.issues)}`);
        }

        // --- TEST 3: THE DIPLOMAT ---
        console.log("\n🕊️ Testing The Diplomat (Release Management)...");

        // Mock `util.promisify(exec)` inside Diplomat or just catch the "not a git repo" error which is valid behavior
        const release = await diplomatAgent.prepareRelease('HEAD~1..HEAD');

        if (release && (release.changelog || release.location)) {
            console.log("✅ Diplomat successfully generated release assets.");
            console.log("Changelog Snippet:", release.changelog.substring(0, 50) + "...");
        } else {
            // It might return null if no changes, which is also a valid state, but for test we expect something or a handled error
            throw new Error("Diplomat returned no results and no handled error.");
        }

        console.log("\n✅ Phase 9 (Part 1) Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

verifyPhase9();
