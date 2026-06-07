/**
 * Copyright (c) 2026 Inso Code
 * 
 * Multi-Agent Workspace Sandbox Isolator
 * 
 * High-performance, isolated directory workspace sandboxing library.
 * Dynamically provisions, copies templates, scopes file system read/write
 * operations, and cleanly tears down temporary directories, preventing
 * agents from accidentally modifying critical host repository files.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

export class WorkspaceIsolator {
    /**
     * Initializes a new Workspace Sandbox Isolator.
     * @param {string} baseSandboxDir - Root folder where temporary sandboxes reside
     */
    constructor(baseSandboxDir = './logs/workspaces') {
        this.baseSandboxDir = baseSandboxDir;
        try {
            mkdirSync(this.baseSandboxDir, { recursive: true });
        } catch (e) {
            // Already exists
        }
    }

    /**
     * Dynamically provisions a new isolated workspace folder.
     * @returns {object} Workspace context (id, absolute path)
     */
    provision() {
        const id = `ws_${Math.random().toString(36).substring(2, 9)}`;
        const path = resolve(join(this.baseSandboxDir, id));
        
        mkdirSync(path, { recursive: true });
        console.log(`📂 Provisioned isolated sandbox workspace: [${id}] -> ${path}`);
        
        return { id, path };
    }

    /**
     * Safely writes a file within the isolated workspace path.
     * @param {object} workspace - Active workspace context
     * @param {string} relativeFilePath - Relative path inside the workspace
     * @param {string} content - Contents to write
     */
    safeWrite(workspace, relativeFilePath, content) {
        const targetPath = resolve(join(workspace.path, relativeFilePath));
        
        // Zero-Trust Scope Enforcement: Prevent directory traversal escape attacks
        if (!targetPath.startsWith(workspace.path)) {
            throw new Error(`Zero-Trust Trap: Attempted path traversal escape detected. Scoped boundary is: ${workspace.path}`);
        }

        const parentDir = join(targetPath, '..');
        mkdirSync(parentDir, { recursive: true });
        writeFileSync(targetPath, content, 'utf8');
    }

    /**
     * Cleanly deletes and tears down the temporary workspace sandbox.
     * @param {object} workspace - Active workspace context
     */
    destroy(workspace) {
        if (existsSync(workspace.path)) {
            rmSync(workspace.path, { recursive: true, force: true });
            console.log(`🧹 Cleanly destroyed isolated sandbox workspace: [${workspace.id}]`);
        }
    }

    /**
     * Lists all active provisioned workspace folders.
     * @returns {Array<string>} Active workspace IDs
     */
    listActiveWorkspaces() {
        if (!existsSync(this.baseSandboxDir)) {
            return [];
        }
        return readdirSync(this.baseSandboxDir);
    }

    /**
     * EXTENSION: Provision and start a dedicated user-level Docker container and workspace environment.
     * @param {string} userId - Unique user account identifier
     * @returns {Promise<object>} Launched container status details
     */
    async provisionDockerWorkspace(userId) {
        const { DockerWorkspaceManager } = await import('./docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager(this.baseSandboxDir);
        return await manager.startUserContainer(userId);
    }

    /**
     * EXTENSION: Execute a script in a user's dedicated, isolated Docker container environment.
     * @param {string} userId - Unique user account identifier
     * @param {string} code - The Javascript code block to execute
     * @returns {Promise<object>} Container execution results
     */
    async executeInDockerWorkspace(userId, code) {
        const { DockerWorkspaceManager } = await import('./docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager(this.baseSandboxDir);
        return await manager.executeCode(userId, code);
    }

    /**
     * EXTENSION: Destroy and prune a user's isolated Docker container environment.
     * @param {string} userId - Unique user account identifier
     */
    async destroyDockerWorkspace(userId) {
        const { DockerWorkspaceManager } = await import('./docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager(this.baseSandboxDir);
        return await manager.stopUserContainer(userId);
    }
}
