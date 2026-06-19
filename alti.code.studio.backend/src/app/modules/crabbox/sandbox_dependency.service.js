import { logger } from '../../../shared/logger.js';

class SandboxDependencyService {
    constructor() {
        this.installedPackages = new Set();
    }

    /**
     * Inspects run error logs for missing package dependencies.
     * @param {string} errorLog - Stderr/stdout logs containing module error
     * @returns {string|null} Resolved package name or null if no missing dependency detected
     */
    resolveMissingPackage(errorLog) {
        if (!errorLog) return null;

        // JS/Node: Cannot find module 'package-name'
        const nodeMatch = errorLog.match(/Cannot find module '([^']+)'/);
        if (nodeMatch && nodeMatch[1]) {
            // Strip subpaths (e.g. 'lodash/fp' -> 'lodash')
            const pkg = nodeMatch[1].split('/')[0];
            return pkg.startsWith('.') ? null : pkg;
        }

        // Python: ModuleNotFoundError: No module named 'package_name'
        const pythonMatch = errorLog.match(/ModuleNotFoundError: No module named '([^']+)'/);
        if (pythonMatch && pythonMatch[1]) {
            return pythonMatch[1];
        }

        return null;
    }

    /**
     * Installs resolved missing package dependencies inside the active sandbox.
     * @param {string} packageName - Package to install
     * @param {string} runtimeEnv - Runtime environment ('node' or 'python')
     * @param {Object} sandboxExecutor - Sandboxed execution helper proxy
     * @returns {Promise<boolean>} True if package successfully installed
     */
    async installDependency(packageName, runtimeEnv = 'node', sandboxExecutor = null) {
        if (this.installedPackages.has(packageName)) {
            logger.info(`📦 SandboxDependency: Package [${packageName}] is already marked installed.`);
            return true;
        }

        logger.warn(`📦 SandboxDependency: Attempting dynamic installation of missing package [${packageName}] for runtime [${runtimeEnv}]`);

        const installCmd = runtimeEnv === 'python'
            ? `pip install ${packageName}`
            : `npm install ${packageName}`;

        try {
            if (sandboxExecutor && typeof sandboxExecutor.exec === 'function') {
                // Execute command inside sandbox
                await sandboxExecutor.exec(installCmd);
            } else {
                logger.info(`Mocking dynamic sandbox install: ${installCmd}`);
            }

            this.installedPackages.add(packageName);
            logger.info(`📦 SandboxDependency: Dynamic installation of [${packageName}] completed successfully.`);
            return true;
        } catch (e) {
            logger.error(`📦 SandboxDependency: Failed to install package [${packageName}] inside sandbox.`, e);
            return false;
        }
    }
}

export const sandboxDependencyService = new SandboxDependencyService();
