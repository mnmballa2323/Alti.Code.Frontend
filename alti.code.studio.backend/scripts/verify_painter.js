import { painterService } from '../src/app/modules/painter/painter.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';
import fs from 'fs/promises';
import path from 'path';

const runVerification = async () => {
    logger.info("Starting Painter Agent Verification...");

    // Mock AI Provider
    aiProvider.generate = async (prompt) => {
        logger.info("Mock AI: Painting Component...");
        return `
        import React from 'react';
        export const MockButton = () => <button className="bg-blue-500">Click Me</button>;
        `;
    };

    try {
        const description = "A simple blue button";
        logger.info(`Requesting: ${description}`);

        const result = await painterService.paintComponent(description);
        logger.info("Painter Result:", result);

        // Verify file creation
        const fileExists = await fs.access(result.filePath).then(() => true).catch(() => false);
        if (fileExists) {
            logger.info("✅ Component file created successfully.");
            // Cleanup
            await fs.unlink(result.filePath);
        } else {
            logger.error("❌ Component file NOT found.");
            process.exit(1);
        }

        logger.info("Painter Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
