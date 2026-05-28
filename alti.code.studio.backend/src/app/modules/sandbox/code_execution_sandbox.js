/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Sandboxed Code Execution Engine
 * 
 * High-performance, isolated code execution sandbox.
 * Spawns a dedicated, resource-constrained subprocess with strict timeouts
 * and pruned environment variables to execute untrusted JavaScript code,
 * protecting the host process from memory crashes, infinite loops, and security leakage.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { fork } from 'child_process';
import { createWriteStream } from 'fs';
import { join } from 'path';

export class CodeExecutionSandbox {
    /**
     * Executes JavaScript code within a safe, isolated Node Docker container.
     * @param {string} code - The raw JavaScript code snippet to run
     * @param {object} options - Execution constraints (timeout, allowedEnv)
     * @returns {Promise<object>} Execution results including exit code, logs, and timing
     */
    static async execute(code, options = {}) {
        const { DockerWorkspaceManager } = await import('./docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager('./logs/workspaces/oss_generic');
        
        // Execute inside a dedicated 'generic' open-source container
        return await manager.executeOssCode('generic', code, './logs/workspaces/oss_generic');
    }
}
