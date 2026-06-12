
import { architectAgent } from '../src/app/modules/agents/architect.agent.js';
import { composerAgent } from '../src/app/modules/agents/composer.agent.js';
import { logger } from '../src/shared/logger.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
import { GcsService } from '../src/app/modules/googleCloud/gcs.service.js';
import { FirestoreSyncService } from '../src/app/modules/googleCloud/firestoreSync.service.js';
import fs from 'fs';
import path from 'path';

// Mock GCP cloud operations
GcsService.uploadFile = async (bucket, filename, content) => {
    logger.info(`[MOCK GCS] Uploaded file to ${bucket}/${filename}`);
    return `gs://${bucket}/${filename}`;
};
FirestoreSyncService.persistCrdtUpdate = async () => {};

GeminiAiService.generateContent = async (prompt) => {
    if (prompt.includes('You are The Architect')) {
        return JSON.stringify({
            feature: "Notification System",
            description: "Design a notification system",
            techStack: ["Node.js"],
            components: [
                { "name": "Notification Engine", "type": "backend", "path": "src/temp_notification.js", "description": "Sends notifications" }
            ],
            files: [
                { "path": "src/temp_notification.js", "instruction": "Write a notification function" }
            ],
            adrs: [
                { "title": "Use Redis", "context": "For low-latency queueing" }
            ]
        });
    }
    return `// Mocked code for prompt: ${prompt.substring(0, 30)}...`;
};

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
