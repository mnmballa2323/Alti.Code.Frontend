import { surferAgent } from '../src/app/modules/agents/surfer.agent.js';
import { logger } from '../src/shared/logger.js';

async function testSurfer() {
    logger.info("===========================================");
    logger.info("🌊 Test: The Surfer Agent (Live OSINT Search)");
    logger.info("===========================================");

    // Test Case: Query something very recent/dynamic to prove it's live
    // e.g., current events or highly specific search vectors
    const query = "React 19 Hooks features documentation";

    logger.info(`🔍 Searching: "${query}"`);

    try {
        const report = await surferAgent.surfWeb(query);

        logger.info("\n✅ Surfer Search Succeeded");
        logger.info(`Source Links Checked: \n - ${report.sourcesChecked.join('\n - ')}`);
        logger.info(`\nSynthesized Intelligence:\n${report.synthesizedSolution}`);
        if (report.codeSnippetFound) {
            logger.info(`\nCode Snippet Found:\n${report.codeSnippetFound}`);
        } else {
            logger.info("\n[No Code Snippet Extracted]");
        }

        process.exit(0);
    } catch (e) {
        logger.error("❌ Surfer Search Failed", e);
        process.exit(1);
    }
}

testSurfer();
