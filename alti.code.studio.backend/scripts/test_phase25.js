
import { architectAgent } from '../src/app/modules/agents/architect.agent.js';
import { composerAgent } from '../src/app/modules/agents/composer.agent.js';
import { logger } from '../src/shared/logger.js';
import fs from 'fs';
import path from 'path';

async function runVerification() {
    logger.info("🚀 Starting Phase 25 Verification: The Architect & Composer...");

    try {
        // 1. Test Architect
        const goal = "Design a notification system";
        const design = await architectAgent.execute('design', { goal });

        logger.info("✅ Architect Design Output:", design);

        if (!design.files || design.files.length === 0) {
            throw new Error("Architect failed to produce file list.");
        }

        // 2. Test Composer Scaffolding
        const results = await composerAgent.execute('scaffold', { design });
        logger.info("✅ Composer Scaffold Output:", results);

        // 3. Verify Files Exist
        const projectRoot = process.cwd();
        for (const file of design.files) {
            const fullPath = path.resolve(projectRoot, file.path);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`❌ File was not created: ${fullPath}`);
            }
            logger.info(`✅ Verified File Exists: ${file.path}`);

            // Clean up test files
            fs.unlinkSync(fullPath);
            // Try to remove dir if empty (simplified cleanup)
            const dir = path.dirname(fullPath);
            try { fs.rmdirSync(dir); } catch (e) { }
        }

        logger.info("🎉 Phase 25 Verification Passed!");

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
