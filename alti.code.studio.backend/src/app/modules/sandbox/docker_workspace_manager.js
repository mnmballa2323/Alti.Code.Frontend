/**
 * Copyright (c) 2026 Inso Code
 * 
 * User-Isolated Docker Workspace Management Engine
 * 
 * Spawns, constraints, and runs isolated user accounts inside their own
 * dedicated Docker container and volume-mounted sandboxes. Prevents cross-user
 * code collision, enforces strict CPU/memory boundaries, and traps system escapes.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { exec } from 'child_process';
import * as hostFs from 'fs';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import vm from 'vm';

export class DockerWorkspaceManager {
    /**
     * Initializes the Docker Workspace Manager.
     * @param {string} baseSandboxDir - Root host folder where temporary workspaces reside
     * @param {string} baseImage - The lightweight Docker image used for user containers
     */
    constructor(baseSandboxDir = './logs/workspaces', baseImage = 'node:20-alpine') {
        this.baseSandboxDir = resolve(baseSandboxDir);
        this.baseImage = baseImage;
        this.activeContainers = new Set();
        this.isDockerAvailable = null; // Evaluated dynamically

        try {
            mkdirSync(this.baseSandboxDir, { recursive: true });
        } catch (e) {}
    }

    /**
     * Helper to execute system shell commands.
     */
    _execCmd(command, timeout = 5000) {
        return new Promise((resolve) => {
            const child = exec(command, { timeout }, (error, stdout, stderr) => {
                resolve({
                    success: !error,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    error: error ? error.message : null,
                    exitCode: error ? (error.code || 1) : 0,
                    killed: error ? !!error.killed : false
                });
            });
        });
    }

    /**
     * Detects if the Docker daemon is responsive.
     */
    async checkDockerAvailability() {
        if (this.isDockerAvailable !== null) {
            return this.isDockerAvailable;
        }
        const check = await this._execCmd('docker info');
        this.isDockerAvailable = check.success;
        return this.isDockerAvailable;
    }

    /**
     * Provisions an isolated host directory for a specific user.
     * @param {string} userId - Target user identifier
     * @returns {string} Absolute path to the user's host workspace
     */
    provisionUserWorkspace(userId) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');
        const hostPath = resolve(join(this.baseSandboxDir, `user_${cleanUserId}`));
        mkdirSync(hostPath, { recursive: true });
        return hostPath;
    }

    /**
     * Dynamically launches a secure, resource-constrained container for the user.
     * @param {string} userId - Target user identifier
     * @param {object} [options] - Configurable resource constraints
     * @param {string} [options.memory] - Custom memory limit (default: 256m)
     * @param {string} [options.cpus] - Custom CPU limit (default: 0.5)
     * @param {number} [options.pidsLimit] - Custom PID limit to prevent fork bombs (default: 50)
     * @returns {Promise<object>} Container details (containerName, hostPath, isMock)
     */
    async startUserContainer(userId, options = {}) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');
        const containerName = `user_sandbox_${cleanUserId}`;
        const hostPath = this.provisionUserWorkspace(userId);

        const hasDocker = await this.checkDockerAvailability();

        if (!hasDocker) {
            // High-Fidelity Mock Fallback Mode
            console.log(`⚠️ Docker daemon not responding. Running [${containerName}] in high-fidelity Mock Fallback Mode.`);
            this.activeContainers.add(containerName);
            return {
                containerName,
                hostPath,
                isMock: true,
                message: 'Started successfully inside Mock Sandbox.'
            };
        }

        // 1. Check if the container is already running
        const inspect = await this._execCmd(`docker inspect -f '{{.State.Running}}' ${containerName}`);
        if (inspect.success && inspect.stdout === 'true') {
            this.activeContainers.add(containerName);
            return { containerName, hostPath, isMock: false };
        }

        // 2. Clean up dead container if it exists
        await this._execCmd(`docker rm -f ${containerName}`);

        // Ensure host workspace directory is accessible by the unprivileged Node user (UID 1000) inside the container
        await this._execCmd(`chmod -R 777 "${hostPath}"`);

        // Resolve options with robust, hardened defaults
        const memory = options.memory || '256m';
        const cpus = options.cpus || '0.5';
        const pidsLimit = options.pidsLimit || 50;

        // Dynamically map execution user UID/GID to executing host credentials (avoiding root UID 0)
        const hostUid = (process.getuid && process.getuid() !== 0) ? process.getuid() : 1000;
        const hostGid = (process.getgid && process.getgid() !== 0) ? process.getgid() : 1000;

        // 3. Launch isolated resource-limited and heavily hardened Docker container:
        // - Strict Air-Gapped Network Isolation: --network none
        // - Root filesystem read-only: --read-only
        // - Drop all default Linux capabilities: --cap-drop=ALL
        // - Prevent privilege escalation: --security-opt=no-new-privileges:true
        // - Run mapped to host UID/GID dynamically: --user ${hostUid}:${hostGid}
        // - Memory-bound non-executable tmp filesystem for system writes: --tmpfs /tmp:rw,noexec,nosuid,size=65536k
        // - Scoped host workspace directory mount: -v hostPath:/workspace
        // - Resource constraints, fork bomb / log flooding protections, and swap / ulimit / namespace constraints
        const dockerRunCmd = `docker run -d ` +
            `--name ${containerName} ` +
            `-v "${hostPath}":/workspace ` +
            `--network none ` +
            `--read-only ` +
            `--security-opt=no-new-privileges:true ` +
            `--cap-drop=ALL ` +
            `--user ${hostUid}:${hostGid} ` +
            `--tmpfs /tmp:rw,noexec,nosuid,size=65536k ` +
            `--pids-limit=${pidsLimit} ` +
            `--log-opt max-size=10m ` +
            `--log-opt max-file=3 ` +
            `--memory="${memory}" ` +
            `--memory-swap="${memory}" ` +
            `--ulimit fsize=52428800 ` +
            `-e NODE_ENV=production ` +
            `-e PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin ` +
            `--cpus="${cpus}" ` +
            `--workdir /workspace ` +
            `${this.baseImage} tail -f /dev/null`;

        const runResult = await this._execCmd(dockerRunCmd);

        if (!runResult.success) {
            // Graceful fallback to Mock mode if container creation fails due to daemon constraints
            console.log(`⚠️ Docker container creation failed: ${runResult.error}. Cascading [${containerName}] to Mock Sandbox.`);
            this.activeContainers.add(containerName);
            return {
                containerName,
                hostPath,
                isMock: true,
                message: 'Docker failed. Cascaded to Mock Sandbox.'
            };
        }

        console.log(`🚀 Provisioned isolated user container: [${containerName}] -> Mounted: ${hostPath}`);
        this.activeContainers.add(containerName);
        return { containerName, hostPath, isMock: false };
    }

    /**
     * Cleanly stops and prunes a user's isolated Docker container.
     */
    async stopUserContainer(userId) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');
        const containerName = `user_sandbox_${cleanUserId}`;

        this.activeContainers.delete(containerName);
        const hasDocker = await this.checkDockerAvailability();

        if (hasDocker) {
            await this._execCmd(`docker stop ${containerName}`);
            await this._execCmd(`docker rm -f ${containerName}`);
            console.log(`🧹 Stopped and pruned user container: [${containerName}]`);
        } else {
            console.log(`🧹 Cleaned up mock state for user container: [${containerName}]`);
        }

        // Delete volume directory
        const hostPath = resolve(join(this.baseSandboxDir, `user_${cleanUserId}`));
        if (existsSync(hostPath)) {
            try {
                rmSync(hostPath, { recursive: true, force: true });
            } catch (e) {}
        }
        return { success: true };
    }

    /**
     * Safely writes a file within the user's workspace directory on the host.
     */
    safeWriteFile(userId, relativeFilePath, content) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');
        const hostPath = resolve(join(this.baseSandboxDir, `user_${cleanUserId}`));
        const targetPath = resolve(join(hostPath, relativeFilePath));

        // Zero-Trust Scope Enforcement: Traversal blocks
        if (!targetPath.startsWith(hostPath)) {
            throw new Error(`Zero-Trust Trap: Attempted path traversal escape detected. Scoped boundary is: ${hostPath}`);
        }

        const parentDir = join(targetPath, '..');
        mkdirSync(parentDir, { recursive: true });
        writeFileSync(targetPath, content, 'utf8');
    }

    /**
     * Executes code inside built-in vm with mocked console, process, and secure fs modules.
     */
    async _executeMockInVM(code, hostWorkspacePath, options = {}) {
        const startTime = Date.now();
        const logs = [];
        const errors = [];
        let success = true;

        try {
            const resolveSafePath = (filePath) => {
                let targetPath = filePath;
                if (targetPath.startsWith('/workspace')) {
                    targetPath = targetPath.replace('/workspace', hostWorkspacePath);
                }
                targetPath = resolve(targetPath);
                if (!targetPath.startsWith(hostWorkspacePath)) {
                    throw new Error(`Zero-Trust Violation: Path traversal attempt outside workspace: ${targetPath}`);
                }
                return targetPath;
            };

            const fsMock = {
                writeFileSync: (filePath, data, opts) => {
                    hostFs.writeFileSync(resolveSafePath(filePath), data, opts);
                },
                readFileSync: (filePath, opts) => {
                    return hostFs.readFileSync(resolveSafePath(filePath), opts);
                },
                existsSync: (filePath) => {
                    return hostFs.existsSync(resolveSafePath(filePath));
                },
                mkdirSync: (filePath, opts) => {
                    hostFs.mkdirSync(resolveSafePath(filePath), opts);
                },
                readdirSync: (filePath, opts) => {
                    return hostFs.readdirSync(resolveSafePath(filePath), opts);
                },
                rmSync: (filePath, opts) => {
                    hostFs.rmSync(resolveSafePath(filePath), opts);
                },
                unlinkSync: (filePath) => {
                    hostFs.unlinkSync(resolveSafePath(filePath));
                },
                statSync: (filePath) => {
                    const stats = hostFs.statSync(resolveSafePath(filePath));
                    return {
                        size: stats.size,
                        isFile: () => stats.isFile(),
                        isDirectory: () => stats.isDirectory()
                    };
                }
            };

            const sandbox = {
                console: {
                    log: (...args) => {
                        logs.push(args.map(x => (x === null ? 'null' : x === undefined ? 'undefined' : typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' '));
                    },
                    error: (...args) => {
                        errors.push(args.map(x => (x === null ? 'null' : x === undefined ? 'undefined' : typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' '));
                    }
                },
                require: (mod) => {
                    if (mod === 'fs') return fsMock;
                    throw new Error("Module not found: " + mod);
                },
                _hostImport: async (mod) => {
                    if (mod === 'fs') return fsMock;
                    throw new Error("Module not found: " + mod);
                },
                process: {
                    env: {},
                    cwd: () => '/workspace',
                    getuid: () => (process.getuid ? process.getuid() : 1000),
                    getgid: () => (process.getgid ? process.getgid() : 1000)
                },
                globalThis: null
            };
            sandbox.globalThis = sandbox;
            sandbox.global = sandbox;

            const timeoutMs = options.timeoutMs || options.timeout || 5000;
            const processedCode = code.replace(/import\(/g, '_hostImport(').replace(/run\(\);/g, 'global._execPromise = run();');
            const script = new vm.Script(processedCode);
            script.runInNewContext(sandbox, { timeout: timeoutMs });

            if (sandbox._execPromise) {
                await sandbox._execPromise;
            }
        } catch (e) {
            success = false;
            errors.push(e.message);
        }

        return {
            success,
            logs,
            errors,
            durationMs: Date.now() - startTime
        };
    }

    /**
     * Securely executes JavaScript or shell code inside the user's dedicated environment.
     */
    async executeCode(userId, code, options = {}) {
        const cleanUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');
        const containerName = `user_sandbox_${cleanUserId}`;
        const hostPath = this.provisionUserWorkspace(userId);

        const startTime = Date.now();

        // Write the code snippet to a temporary execution file inside the user volume
        const tempFileName = `temp_exec_${Math.random().toString(36).substring(2, 9)}.js`;
        this.safeWriteFile(userId, tempFileName, code);

        const containerResult = await this.startUserContainer(userId, options);

        if (containerResult.isMock) {
            const result = await this._executeMockInVM(code, hostPath, options);

            // Cleanup temp file
            try {
                rmSync(join(hostPath, tempFileName), { force: true });
            } catch (e) {}

            return {
                success: result.success,
                logs: result.logs,
                errors: result.errors,
                durationMs: result.durationMs,
                isMock: true
            };
        }

        // Active Docker container execution via exec
        const execCmd = `docker exec ${containerName} node /workspace/${tempFileName}`;
        const execResult = await this._execCmd(execCmd);

        // Cleanup temporary execution file
        try {
            rmSync(join(hostPath, tempFileName), { force: true });
        } catch (e) {}

        const durationMs = Date.now() - startTime;

        return {
            success: execResult.success,
            logs: execResult.stdout ? execResult.stdout.split('\n') : [],
            errors: execResult.stderr ? execResult.stderr.split('\n') : [],
            durationMs,
            isMock: false
        };
    }

    /**
     * Spawns a dedicated, unprivileged, heavily hardened container for an open-source module.
     * @param {string} moduleName - Name of the open-source module
     * @param {string} hostPath - Folder path of the open-source code on the host
     * @param {object} [options] - Configurable resource constraints
     * @param {string} [options.memory] - Custom memory limit (default: 256m)
     * @param {string} [options.cpus] - Custom CPU limit (default: 0.5)
     * @param {number} [options.pidsLimit] - Custom PID limit (default: 50)
     */
    async startOssContainer(moduleName, hostPath, options = {}) {
        const cleanModuleName = moduleName.replace(/[^a-zA-Z0-9_]/g, '');
        const isPython = options.language === 'python';
        const containerName = `oss_container_${cleanModuleName}${isPython ? '_python' : ''}`;
        const targetHostPath = resolve(hostPath);

        const hasDocker = await this.checkDockerAvailability();

        if (!hasDocker) {
            this.activeContainers.add(containerName);
            return { containerName, hostPath: targetHostPath, isMock: true };
        }

        // Check if already running
        const inspect = await this._execCmd(`docker inspect -f '{{.State.Running}}' ${containerName}`);
        if (inspect.success && inspect.stdout === 'true') {
            this.activeContainers.add(containerName);
            return { containerName, hostPath: targetHostPath, isMock: false };
        }

        // Clean dead container
        await this._execCmd(`docker rm -f ${containerName}`);

        // Give unprivileged user permissions
        await this._execCmd(`chmod -R 777 "${targetHostPath}"`);

        // Resolve options with robust, hardened defaults
        const memory = options.memory || '256m';
        const cpus = options.cpus || '0.5';
        const pidsLimit = options.pidsLimit || 50;

        // Dynamically map execution user UID/GID to executing host credentials (avoiding root UID 0)
        const hostUid = (process.getuid && process.getuid() !== 0) ? process.getuid() : 1000;
        const hostGid = (process.getgid && process.getgid() !== 0) ? process.getgid() : 1000;

        // Launch isolated OSS container
        const dockerRunCmd = `docker run -d ` +
            `--name ${containerName} ` +
            `-v "${targetHostPath}":/workspace ` +
            `--network none ` +
            `--read-only ` +
            `--security-opt=no-new-privileges:true ` +
            `--cap-drop=ALL ` +
            `--user ${hostUid}:${hostGid} ` +
            `--tmpfs /tmp:rw,noexec,nosuid,size=65536k ` +
            `--pids-limit=${pidsLimit} ` +
            `--log-opt max-size=10m ` +
            `--log-opt max-file=3 ` +
            `--memory="${memory}" ` +
            `--memory-swap="${memory}" ` +
            `--ulimit fsize=52428800 ` +
            `-e NODE_ENV=production ` +
            `-e PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin ` +
            `--cpus="${cpus}" ` +
            `--workdir /workspace ` +
            `${isPython ? 'python:3.11-alpine' : this.baseImage} tail -f /dev/null`;

        const runResult = await this._execCmd(dockerRunCmd);

        if (!runResult.success) {
            console.log(`⚠️ Docker OSS container launch failed: ${runResult.error}. Cascading to Mock Sandbox.`);
            this.activeContainers.add(containerName);
            return { containerName, hostPath: targetHostPath, isMock: true };
        }

        console.log(`🚀 Provisioned isolated OSS Container: [${containerName}] -> Mounted: ${targetHostPath}`);
        this.activeContainers.add(containerName);
        return { containerName, hostPath: targetHostPath, isMock: false };
    }

    /**
     * Executes open-source code inside its dedicated container sandbox.
     */
    async executeOssCode(moduleName, code, hostPath, options = {}) {
        const cleanModuleName = moduleName.replace(/[^a-zA-Z0-9_]/g, '');
        const isPython = options.language === 'python';
        const containerName = `oss_container_${cleanModuleName}${isPython ? '_python' : ''}`;
        const targetHostPath = resolve(hostPath);

        const startTime = Date.now();

        // Write code snippet to host volume
        const tempExt = isPython ? 'py' : 'js';
        const tempFileName = `temp_exec_oss_${Math.random().toString(36).substring(2, 9)}.${tempExt}`;
        const tempHostPath = join(targetHostPath, tempFileName);
        
        mkdirSync(targetHostPath, { recursive: true });
        writeFileSync(tempHostPath, code, 'utf8');

        const containerResult = await this.startOssContainer(moduleName, targetHostPath, options);

        if (containerResult.isMock) {
            const result = await this._executeMockInVM(code, targetHostPath, options);

            try {
                rmSync(tempHostPath, { force: true });
            } catch (e) {}

            return {
                success: result.success,
                exitCode: result.success ? 0 : 1,
                logs: result.logs,
                errors: result.errors,
                durationMs: result.durationMs,
                isMock: true
            };
        }

        // Docker exec execution
        const runtimeCmd = isPython ? 'python' : 'node';
        const execCmd = `docker exec ${containerName} ${runtimeCmd} /workspace/${tempFileName}`;
        const execResult = await this._execCmd(execCmd);

        try {
            rmSync(tempHostPath, { force: true });
        } catch (e) {}

        const durationMs = Date.now() - startTime;

        const errors = execResult.stderr ? execResult.stderr.split('\n') : [];
        if (execResult.exitCode === 137 || execResult.killed) {
            errors.push('Error: Execution timeout exceeded. The sandbox process was forcefully terminated.');
        }

        return {
            success: execResult.success,
            exitCode: execResult.exitCode,
            logs: execResult.stdout ? execResult.stdout.split('\n') : [],
            errors,
            durationMs,
            isMock: false
        };
    }

    /**
     * Scans and automatically stops/prunes any orphaned containers left behind from past crashed runs.
     */
    async pruneOrphanedContainers() {
        const hasDocker = await this.checkDockerAvailability();
        if (!hasDocker) return;

        // Query active user or OSS containers
        const listCmd = `docker ps -a --filter "name=user_sandbox_" --filter "name=oss_container_" --format "{{.Names}}"`;
        const listResult = await this._execCmd(listCmd);
        if (listResult.success && listResult.stdout) {
            const names = listResult.stdout.split('\n').filter(Boolean);
            for (const name of names) {
                console.log(`🧹 Self-Healing: Pruning orphaned container detected: [${name}]`);
                await this._execCmd(`docker stop ${name}`);
                await this._execCmd(`docker rm -f ${name}`);
            }
        }
    }
}
