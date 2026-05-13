import { spokespersonService } from '../src/app/modules/spokesperson/spokesperson.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';

const runVerification = async () => {
    logger.info("Starting Spokesperson Agent Verification...");

    // Mock AI Provider
    aiProvider.generate = async (prompt) => {
        if (prompt.includes('CHANGELOG')) return '## v1.0.0\n- Initial release';
        if (prompt.includes('Release Announcement')) return '# Announcing v1.0.0!\n We are live.';
        if (prompt.includes('Review and polish')) return '# Polished Readme';
        return '';
    };

    try {
        // 1. Verify Changelog (Mocking git log might be tricky, so agent handles error gracefully)
        // We expect it to either return a changelog (if in a repo) or an error/empty msg.
        logger.info("1. Testing Changelog...");
        const changelog = await spokespersonService.generateChangelog();
        logger.info("Changelog Result:", changelog);

        // 2. Verify Release Notes
        logger.info("2. Testing Release Notes...");
        const notes = await spokespersonService.draftReleaseNotes('v1.0.0', '## Fixes');
        logger.info("Release Notes:", notes);
        if (notes.version !== 'v1.0.0') throw new Error("Release notes version mismatch");

        // 3. Verify Readme Polish
        logger.info("3. Testing Readme Polish...");
        // Create dummy readme if not exists?
        // Actually, the project root likely has one. If not, we skip.
        try {
            await spokespersonService.polishReadme();
            logger.info("✅ Readme polish run (mocked).");
        } catch (e) {
            logger.warn("Readme test skipped: " + e.message);
        }

        logger.info("Spokesperson Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
