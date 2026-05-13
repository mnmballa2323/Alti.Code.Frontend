import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);
const SHADOW_ROOT = path.resolve('.shadow');

// Ensure shadow root exists
const ensureShadowRoot = async () => {
    try {
        await fs.access(SHADOW_ROOT);
    } catch {
        await fs.mkdir(SHADOW_ROOT, { recursive: true });
    }
};

const initShadow = async (sessionId) => {
    await ensureShadowRoot();
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    const sourcePath = path.resolve('.'); // Current project root

    logger.info(`Initializing shadow workspace for session ${sessionId} at ${shadowPath}`);

    // Create shadow directory
    await fs.mkdir(shadowPath, { recursive: true });

    // Copy files (excluding .git, node_modules, .shadow)
    // detailed implementations would use rsync or similar for efficiency
    // For MVP, we'll simpler copy specific critical directories or just source excluding heavy folders.
    // Using a simplified recursive copy function or excluding heavy folders.
    // To avoid complexity, we will simulate by creating a clean directory and pretending to copy core 'src' for now
    // In a real scenario, we'd use 'cp -r' excluding node_modules.

    try {
        // Windows 'xcopy' or Linux 'cp'. relying on node fs.cp
        // Exclude node_modules and .shadow and .git
        const filterFunc = (src, dest) => {
            if (src.includes('node_modules') || src.includes('.git') || src.includes('.shadow')) {
                return false;
            }
            return true;
        };

        // fs.cp is recursive by default in newer node versions with {recursive: true}
        // and filter option is available.
        // However, simpler to just copy 'src' and 'package.json' for the MVP to avoid massive IO
        await fs.cp(path.join(sourcePath, 'src'), path.join(shadowPath, 'src'), { recursive: true });
        await fs.copyFile(path.join(sourcePath, 'package.json'), path.join(shadowPath, 'package.json'));

        return { status: 'initialized', path: shadowPath };
    } catch (error) {
        logger.error('Shadow init failed', error);
        throw error;
    }
};

const applyDiff = async (sessionId, filePath, content) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    const targetFile = path.join(shadowPath, filePath);

    logger.info(`Applying change to ${targetFile}`);

    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, content);

    return { status: 'applied', file: filePath };
};

const runCommand = async (sessionId, command) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    logger.info(`Running command in ${shadowPath}: ${command}`);

    try {
        const { stdout, stderr } = await execAsync(command, { cwd: shadowPath });
        return { stdout, stderr, exitCode: 0 };
    } catch (error) {
        return { stdout: error.stdout, stderr: error.stderr, exitCode: error.code };
    }
};

const commitShadow = async (sessionId) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    const sourcePath = path.resolve('.');

    logger.info(`Committing shadow session ${sessionId} to main`);

    // In a real world, we would rsync back. 
    // For MVP, we copy back 'src'
    await fs.cp(path.join(shadowPath, 'src'), path.join(sourcePath, 'src'), { recursive: true, force: true });

    return { status: 'committed' };
};

export const ShadowWorkspaceService = {
    initShadow,
    applyDiff,
    runCommand,
    commitShadow,
};
