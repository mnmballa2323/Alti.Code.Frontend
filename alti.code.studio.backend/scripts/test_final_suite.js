
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../src/shared/logger.js';

// Final Verification Suite: Phases 26-31
const scripts = [
    'test_phase26.js', // Hive Control Schema
    'test_phase27.js', // Oracle API
    'test_phase28.js', // Guardian Security
    'test_phase29.js', // Diplomat External
    'test_phase30.js', // Historian Persistence
    'test_phase31.js'  // Analyst Reporting
];

async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        logger.info(`📋 Suite: Running ${scriptName}...`);
        const p = path.join(process.cwd(), 'scripts', scriptName);

        const child = spawn('node', [p], { stdio: 'inherit', shell: true });

        child.on('close', (code) => {
            if (code === 0) {
                logger.info(`✅ ${scriptName} PASSED.`);
                resolve();
            } else {
                logger.error(`❌ ${scriptName} FAILED (Exit Code: ${code})`);
                reject(new Error(`${scriptName} failed`));
            }
        });
    });
}

async function runSuite() {
    logger.info("🚀 Starting THE EXECUTIVE SUITE Final Verification...");

    for (const script of scripts) {
        try {
            await runScript(script);
        } catch (error) {
            logger.error("🛑 Suite Aborted due to failure.");
            process.exit(1);
        }
    }

    logger.info("🎉🎉🎉 ALL SYSTEMS GO. THE HIVE MIND IS OPERATIONAL. 🎉🎉🎉");
}

runSuite();
