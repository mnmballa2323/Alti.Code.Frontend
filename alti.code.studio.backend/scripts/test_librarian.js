import { wikiService } from '../src/app/modules/docs/wiki.service.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { logger } from '../src/shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

// Mock Gemini AI to avoid API key requirements during the local offline verification
GeminiAiService.generateContent = async (prompt) => {
    logger.info(`  [Mock] GeminiAiService.generateContent called via Librarian`);
    if (prompt.includes('ARCHITECTURE.md')) {
        return `# System Architecture\n## Overview\nTest Abstract\n## Modules\n- Mock Module`;
    }
    return `# ADR: Test ADR\n## Status\nAccepted\n## Context\nTest Context\n## Decision\nTest Decision\n## Consequences\nTest Consequences`;
};

async function testLibrarian() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 4 The Librarian (Automated Architecture & ADRs)");
    logger.info("===========================================");

    try {
        logger.info("1. Triggering Docs Site Generation...");
        const docsResult = await wikiService.generateDocsSite();
        logger.info(`✅ Docs Site generated at: ${docsResult.path}`);

        logger.info("2. Triggering Architecture Decision Record (ADR) Generation...");
        const adrTitle = "Implement Inter-Agent Delegation Protocol (IADP)";
        const adrContext = "We needed a formalized way for the Orchestrator/Architect to spawn worker agents dynamically for Phase 2 Autonomy.";
        const adrResult = await wikiService.generateADR(adrTitle, adrContext);

        logger.info(`✅ ADR generated at: ${adrResult.path}`);

        // Verify the file was created
        const adrExists = await fs.stat(adrResult.path).then(() => true).catch(() => false);
        if (adrExists) {
            logger.info("✅ Verification Passed: ADR successfully written to disk.");
            process.exit(0);
        } else {
            logger.error("❌ Verification Failed: ADR file not found on disk.");
            process.exit(1);
        }

    } catch (e) {
        logger.error("❌ Librarian Test Crashed", e);
        process.exit(1);
    }
}

testLibrarian();
