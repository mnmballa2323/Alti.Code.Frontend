/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Test Harness for the Phase 15 Browser-Use Integration
 */

import { configureEnvironment } from '../src/app/config/env.config.js';
import { surferAgent } from '../src/app/modules/agents/surfer.agent.js';
import { logger } from '../src/app/shared/logger.js';

configureEnvironment();

async function runTest() {
    logger.info("🧪 Starting Browser-Use Integration Test via SurferAgent...");

    // This search target is complex enough that a simple Google scraper might fail,
    // but a real browser agent will know to navigate to result pages.
    const searchTarget = "Find the latest post about AI on Hacker News (news.ycombinator.com) and summarize its title.";

    try {
        logger.info(`🎯 Target: ${searchTarget}`);
        const result = await surferAgent.surfWeb(searchTarget);

        logger.info("\n📊 === SURFER AGENT BROWSER REPORT ===");
        logger.info(`Vector: ${result.searchVector}`);
        logger.info(`Solution: ${result.synthesizedSolution}`);
        if (result.codeSnippetFound) {
            logger.info(`Code: ${result.codeSnippetFound}`);
        }

        if (result.synthesizedSolution && result.synthesizedSolution.length > 20) {
            logger.info("\n✅ SUCCESS: Browser-Use Python bridge successfully piloted Playwright and synthesized intelligence.");
        } else {
            logger.error("\n❌ FAILED: Browser-Use returned an empty or invalid intelligence vector.");
            process.exit(1);
        }

    } catch (e) {
        logger.error(`\n❌ FAILED: Exception thrown during Browser-Use execution: ${e.message}`);
        process.exit(1);
    }
}

runTest();
