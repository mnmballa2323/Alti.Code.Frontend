import fs from 'fs/promises';
import path from 'path';
import { autonomicService } from '../src/app/modules/surgeon/autonomic.service.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { logger } from '../src/shared/logger.js';

// Lower the complexity threshold to guarantee a hit during testing
autonomicService.COMPLEXITY_THRESHOLD = 3;

// Mock Gemini AI to avoid real API dependencies during the local verification
GeminiAiService.generateContent = async (prompt) => {
    logger.info(`  [Mock] GeminiAiService.generateContent called via Surgeon`);
    return `// Optimized O(1) version by Proactive Surgeon
export const processItems = (items) => {
    const itemMap = new Map(items.map(i => [i.id, i]));
    return items.map(i => itemMap.get(i.id));
};`;
};

const TEST_FILE_PATH = path.join(process.cwd(), 'temp_spaghetti.js');

async function testProactiveSurgeon() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 4 Prelude - Proactive Surgeon");
    logger.info("===========================================");

    // 1. Create a dummy file with high cyclomatic complexity (O(N^2) nested loops + if statements)
    const spaghettiCode = `
export const processItems = (items) => {
    let result = [];
    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < items.length; j++) {
            if (items[i].id === items[j].id) {
                if (items[i].active) {
                    if (!result.includes(items[i])) {
                        result.push(items[i]);
                    }
                }
            }
        }
    }
    return result;
};`;

    await fs.writeFile(TEST_FILE_PATH, spaghettiCode, 'utf8');

    try {
        // 2. Trigger the sweep
        const sweepResult = await autonomicService.commenceProactiveSweep([TEST_FILE_PATH]);

        if (sweepResult.eliminated > 0) {
            logger.info("✅ Autonomic Surgeon Sweep Successful!");
            logger.info(`Files Patched: ${sweepResult.eliminated}`);
            logger.info(`Branch Generated: ${sweepResult.patches[0].branchName}`);

            // Output final file
            const patchedCode = await fs.readFile(TEST_FILE_PATH, 'utf8');
            logger.info(`\n[Final Code in ${path.basename(TEST_FILE_PATH)}]\n${patchedCode}`);
            process.exit(0);
        } else {
            logger.error("❌ Surgeon failed to detect or eliminate technical debt.");
            process.exit(1);
        }

    } catch (e) {
        logger.error("❌ Surgeon Test Crashed", e);
        process.exit(1);
    } finally {
        // Cleanup generated test files (try to remove .bak too)
        try { await fs.unlink(TEST_FILE_PATH); } catch (e) { }
        try { await fs.unlink(TEST_FILE_PATH + '.bak'); } catch (e) { }
    }
}

testProactiveSurgeon();
