import { $, chalk } from 'zx';
import { logger } from '../../../shared/logger.js';

/**
 * Google zx DevOps Agent.
 * Replaces standard `child_process` execution with Google's native JS shell wrapper.
 * Grants the Swarm the capability to natively write, execute, and stream 
 * massive bash CI/CD scripts autonomously.
 */
class ZxDevOpsAgent {
    constructor() {
        // Configure zx
        $.verbose = true; // Stream stdout natively
        logger.info('🛠️ [zx DevOps] Google zx Shell Agent initialized.');
    }

    /**
     * Executes a complex shell command on the host.
     * @param {string} script 
     */
    async executeScript(script) {
        logger.info(`🛠️ [zx DevOps] Swarm is executing an autonomous shell script...`);
        
        try {
            // Native bash execution using template literals via Google zx
            const output = await $`bash -c ${script}`;
            
            logger.info(`✅ [zx DevOps] Execution successful: ${chalk.green('0 Exit Code')}`);
            return {
                success: true,
                stdout: output.stdout,
                stderr: output.stderr,
            };
        } catch (p) {
            logger.error(`❌ [zx DevOps] Execution failed with exit code ${p.exitCode}`);
            return {
                success: false,
                stdout: p.stdout,
                stderr: p.stderr,
            };
        }
    }
}

export const zxAgent = new ZxDevOpsAgent();
