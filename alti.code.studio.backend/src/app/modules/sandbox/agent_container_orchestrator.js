/**
 * Copyright (c) 2026 Inso Code
 *
 * Isolated Per-Agent Docker Environments Orchestrator
 *
 * Dynamically launches, manages, and executes specialized AI agent tasks inside
 * their own unprivileged, heavily hardened Docker containers. Supports shared
 * session workspace volume mounts so multiple isolated agents can collaborate
 * on the exact same physical workspace files under zero-trust bounds.
 *
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { exec } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { TenantContainerOrchestrator } from './tenant_container_orchestrator.js';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { gcpContainerService } from '../../../shared/gcpContainer.service.js';

export class AgentContainerOrchestrator {
  /**
   * Initializes the Agent Container Orchestrator.
   * @param {string} baseSandboxDir - Root host folder where sessions reside
   * @param {string} baseImage - The lightweight Docker image used for agent containers
   */
  constructor(
    baseSandboxDir = './logs/workspaces',
    baseImage = 'node:20-alpine',
  ) {
    this.baseSandboxDir = resolve(baseSandboxDir);
    this.baseImage = baseImage;
    this.activeContainers = new Set();
    this.containerWorkspaces = new Map();
    this.isDockerAvailable = null;
    this.tenantOrchestrator = new TenantContainerOrchestrator();

    try {
      mkdirSync(this.baseSandboxDir, { recursive: true });
    } catch (e) {}

    // Launch self-healing orphaned agent container pruning asynchronously on startup
    this.pruneOrphanedContainers().catch(() => {});
  }

  /**
   * Helper to execute system shell commands.
   */
  _execCmd(command, timeout = 5000) {
    return new Promise(resolve => {
      const child = exec(command, { timeout }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          error: error ? error.message : null,
        });
      });
    });
  }

  /**
   * Detects if the Docker daemon is responsive.
   */
  async checkDockerAvailability() {
    if (process.env.GCP_PROJECT_ID) {
      return true;
    }
    if (this.isDockerAvailable !== null) {
      return this.isDockerAvailable;
    }
    const check = await this._execCmd('docker info');
    this.isDockerAvailable = check.success;
    return this.isDockerAvailable;
  }

  /**
   * Dynamically launches an unprivileged, heavily-hardened container for a specific agent class.
   * @param {string} agentName - Name of the agent class (e.g., SwarmArchitect)
   * @param {string} sessionWorkspacePath - Host-level shared workspace directory path
   * @param {string} [tenantId] - The Enterprise Tenant UUID to bind network execution to
   * @param {object} [options] - Configurable resource constraints
   * @param {string} [options.memory] - Custom memory limit (default: 256m)
   * @param {string} [options.cpus] - Custom CPU limit (default: 0.5)
   * @param {number} [options.pidsLimit] - Custom PID limit to prevent fork bombs (default: 100)
   * @returns {Promise<object>} Container details
   */
  async startAgentContainer(
    agentName,
    sessionWorkspacePath,
    tenantId = null,
    options = {},
  ) {
    const cleanAgentName = agentName.replace(/[^a-zA-Z0-9_]/g, '');
    const containerName = `agent-container-${cleanAgentName}`
      .toLowerCase()
      .replace(/_/g, '-');
    const hostWorkspacePath = resolve(sessionWorkspacePath);

    const hasDocker = await this.checkDockerAvailability();

    // ------------------ GCP ACI PATH ------------------
    if (process.env.GCP_PROJECT_ID) {
      const activeGroups = await gcpContainerService.listContainers();
      const existingGroup = activeGroups.find(g =>
        g.Names.includes(containerName),
      );
      if (existingGroup && existingGroup.State === 'Running') {
        this.activeContainers.add(containerName);
        this.containerWorkspaces.set(containerName, hostWorkspacePath);
        return { containerName, hostWorkspacePath, isMock: false };
      }

      try {
        await gcpContainerService.deleteContainerGroup(containerName);
      } catch (e) {}

      const memoryLimit = options.memory || '256m';
      let memoryInGb = 0.5;
      if (memoryLimit.endsWith('m')) {
        memoryInGb = parseFloat(memoryLimit) / 1024;
      } else if (memoryLimit.endsWith('g')) {
        memoryInGb = parseFloat(memoryLimit);
      }
      const cpuLimit = parseFloat(options.cpus || '0.5');

      console.log(
        `[GCP/ACI] Spawning agent container group ${containerName} using image ${this.baseImage}...`,
      );
      await gcpContainerService.createContainerGroup(
        containerName,
        this.baseImage,
        cpuLimit,
        memoryInGb,
        {
          command: ['tail', '-f', '/dev/null'],
        },
      );

      this.activeContainers.add(containerName);
      this.containerWorkspaces.set(containerName, hostWorkspacePath);
      return { containerName, hostWorkspacePath, isMock: false };
    }
    // ------------------ END GCP ACI PATH ------------------

    if (!hasDocker) {
      // High-Fidelity Mock Sandbox Fallback
      console.log(
        `⚠️ Docker daemon not responding. Spawning agent [${agentName}] in Mock Container Sandbox.`,
      );
      this.activeContainers.add(containerName);
      this.containerWorkspaces.set(containerName, hostWorkspacePath);
      return {
        containerName,
        hostWorkspacePath,
        isMock: true,
      };
    }

    // 1. Check if the agent's container is already running
    const inspect = await this._execCmd(
      `docker inspect -f '{{.State.Running}}' ${containerName}`,
    );
    if (inspect.success && inspect.stdout === 'true') {
      this.activeContainers.add(containerName);
      this.containerWorkspaces.set(containerName, hostWorkspacePath);
      return { containerName, hostWorkspacePath, isMock: false };
    }

    // 2. Clean up dead container if it exists
    await this._execCmd(`docker rm -f ${containerName}`);

    // Ensure host workspace directory is accessible by the unprivileged Node user (UID 1000) inside the container
    await this._execCmd(`chmod -R 777 "${hostWorkspacePath}"`);

    // Resolve options with robust, hardened defaults
    const memory = options.memory || '256m';
    const cpus = options.cpus || '0.5';
    const pidsLimit = options.pidsLimit || 100;

    // Dynamically map execution user UID/GID to executing host credentials (avoiding root UID 0)
    const hostUid =
      process.getuid && process.getuid() !== 0 ? process.getuid() : 1000;
    const hostGid =
      process.getgid && process.getgid() !== 0 ? process.getgid() : 1000;

    // Determine network isolation:
    // If tenantId exists, bind to tenant's air-gapped bridge network. Else, use 'bridge'.
    const networkFlag = tenantId
      ? `--network ${this.tenantOrchestrator.getTenantNetwork(tenantId)}`
      : `--network bridge`;

    // Check tenant compliance and infrastructure settings for sovereign microVM runtime
    let runtime = process.env.SOVEREIGN_MICROVM_RUNTIME || null;
    if (tenantId) {
      try {
        const { tenantService } =
          await import('../enterprise/tenant.service.js');
        const tenant = await tenantService.resolve(tenantId);
        if (tenant) {
          const hasFipsCompliance = tenant.compliance?.some(
            c => c.fips || c.label === 'FedRAMP',
          );
          if (tenant.dedicatedInfra || hasFipsCompliance) {
            runtime = runtime || 'kata-fc';
          }
        }
      } catch (err) {
        console.warn(
          `Failed to resolve tenant compliance profile: ${err.message}`,
        );
      }
    }
    const runtimeFlag = runtime ? `--runtime=${runtime} ` : '';

    // 3. Launch isolated resource-limited and heavily hardened Docker container:
    // - Strict Network Isolation: networkFlag
    // - Root filesystem read-only: --read-only
    // - Drop all default Linux capabilities: --cap-drop=ALL
    // - Prevent privilege escalation: --security-opt=no-new-privileges:true
    // - Run mapped to host UID/GID dynamically: --user ${hostUid}:${hostGid}
    // - Memory-bound non-executable tmp filesystem for system writes: --tmpfs /tmp:rw,noexec,nosuid,size=65536k
    // - Scoped host workspace directory mount: -v hostWorkspacePath:/workspace
    // - Resource constraints, fork bomb / log flooding protections, and swap / ulimit / namespace constraints
    const dockerRunCmd =
      `docker run -d ` +
      `--name ${containerName} ` +
      `-v "${hostWorkspacePath}":/workspace ` +
      `${networkFlag} ` +
      runtimeFlag +
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
      console.log(
        `⚠️ Docker agent container launch failed: ${runResult.error}. Cascading [${agentName}] to Mock Sandbox.`,
      );
      this.activeContainers.add(containerName);
      return {
        containerName,
        hostWorkspacePath,
        isMock: true,
      };
    }

    console.log(
      `🚀 Launched isolated Agent Container: [${containerName}] -> Mounted Shared Workspace: ${hostWorkspacePath}`,
    );
    this.activeContainers.add(containerName);
    this.containerWorkspaces.set(containerName, hostWorkspacePath);
    return { containerName, hostWorkspacePath, isMock: false };
  }

  /**
   * Stop and clean up an agent's container.
   */
  async stopAgentContainer(agentName, workspacePath = null) {
    const cleanAgentName = agentName.replace(/[^a-zA-Z0-9_]/g, '');
    const containerName = `agent-container-${cleanAgentName}`
      .toLowerCase()
      .replace(/_/g, '-');

    this.activeContainers.delete(containerName);
    const hasDocker = await this.checkDockerAvailability();

    let workspacePathToShred =
      workspacePath || this.containerWorkspaces.get(containerName);
    this.containerWorkspaces.delete(containerName);

    // ------------------ GCP ACI PATH ------------------
    if (process.env.GCP_PROJECT_ID) {
      try {
        await gcpContainerService.deleteContainerGroup(containerName);
        console.log(
          `🧹 [GCP/ACI] Stopped and pruned Agent Container Group: [${containerName}]`,
        );
      } catch (e) {
        console.warn(`Failed to stop ACI container group: ${e.message}`);
      }
    } else if (hasDocker) {
      // Try to resolve workspace path via docker inspect if not provided/resolved
      if (!workspacePathToShred) {
        const inspectMount = await this._execCmd(
          `docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/workspace" }}{{ .Source }}{{ end }}{{ end }}' ${containerName}`,
        );
        if (inspectMount.success && inspectMount.stdout) {
          workspacePathToShred = inspectMount.stdout;
        }
      }

      await this._execCmd(`docker stop ${containerName}`);
      await this._execCmd(`docker rm -f ${containerName}`);
      console.log(`🧹 Stopped and pruned Agent Container: [${containerName}]`);
    } else {
      console.log(
        `🧹 Cleaned up mock state for Agent Container: [${containerName}]`,
      );
    }

    if (workspacePathToShred) {
      const resolvedPath = resolve(workspacePathToShred);
      if (resolvedPath.startsWith(this.baseSandboxDir)) {
        await this._shredWorkspace(resolvedPath);
      } else {
        logger.warn(
          `🔒 [Shred] Refusing to shred path outside sandbox directory: ${resolvedPath}`,
        );
      }
    }

    return { success: true };
  }

  /**
   * Ephemeral Cryptographically-Shredded Workspaces (Pillar 22)
   * Securely overwrites all files in the directory with random bytes or zeroes, then deletes them.
   */
  async _shredWorkspace(workspacePath) {
    if (!workspacePath || !existsSync(workspacePath)) return;

    logger.info(
      `🔒 Shredding ephemeral workspace files securely: ${workspacePath}`,
    );

    const fs = await import('fs');
    const path = await import('path');

    const shredDirectory = async dir => {
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (err) {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await shredDirectory(fullPath);
          try {
            fs.rmdirSync(fullPath);
          } catch (e) {}
        } else if (entry.isFile()) {
          try {
            const stat = fs.statSync(fullPath);
            // Overwrite with random bytes
            const randomBuffer = crypto.randomBytes(stat.size);
            fs.writeFileSync(fullPath, randomBuffer);
            // Overwrite with zeros
            const zeroBuffer = Buffer.alloc(stat.size, 0);
            fs.writeFileSync(fullPath, zeroBuffer);
            // Also try running cli shred for system-level scrubbing if available
            await this._execCmd(`shred -u "${fullPath}"`);
          } catch (e) {
            try {
              fs.unlinkSync(fullPath);
            } catch (err) {}
          }
        }
      }
    };

    await shredDirectory(workspacePath);
    try {
      fs.rmdirSync(workspacePath);
    } catch (e) {
      try {
        fs.rmSync(workspacePath, { recursive: true, force: true });
      } catch (err) {}
    }
  }

  /**
   * Safely executes a serialized agent tool function inside the agent's dedicated container runtime.
   * @param {string} agentName - Name of the agent class
   * @param {string} toolName - Name of the tool to run
   * @param {object} args - Arguments passed to the tool
   * @param {object} context - Stateful shared session context variables
   * @param {Function} toolExecuteFn - The raw execution function
   * @param {string} sessionWorkspacePath - Host-level shared workspace directory path
   * @param {string} [tenantId] - The enterprise Tenant UUID for execution isolation
   * @param {object} [options] - Configurable resource constraints
   * @returns {Promise<any>} The returned result of the tool execution (mapping back handoffs)
   */
  async executeAgentTool(
    agentName,
    toolName,
    args,
    context,
    toolExecuteFn,
    sessionWorkspacePath,
    tenantId = null,
    options = {},
  ) {
    const cleanAgentName = agentName.replace(/[^a-zA-Z0-9_]/g, '');
    const containerName = `agent-container-${cleanAgentName}`
      .toLowerCase()
      .replace(/_/g, '-');
    const hostWorkspacePath = resolve(sessionWorkspacePath);
    const provider =
      options.provider ||
      context?.provider ||
      process.env.SANDBOX_PROVIDER ||
      'local';

    const startTime = Date.now();

    // 1. Start the agent's container (if not already running) scoped to the tenant's network
    let containerResult = null;
    if (provider !== 'crabbox') {
      containerResult = await this.startAgentContainer(
        agentName,
        hostWorkspacePath,
        tenantId,
        options,
      );
    }

    // 2. Serialize tool execution function, arguments, and context into a temporary JS file inside the shared workspace
    const tempFileName = `temp_tool_${cleanAgentName}_${Math.random().toString(36).substring(2, 9)}.js`;
    const tempHostPath = join(hostWorkspacePath, tempFileName);

    const serializedFn = toolExecuteFn.toString();

    const executableScript = `
            const args = ${JSON.stringify(args)};
            const context = ${JSON.stringify(context)};
            const executeFn = ${serializedFn};

            async function run() {
                try {
                    const rawResult = await executeFn(args, context);
                    
                    // Detect if the result is a SwarmAgent instance (Handoff)
                    let result = rawResult;
                    let isHandoff = false;
                    let handoffAgentName = null;

                    if (rawResult && typeof rawResult === 'object' && rawResult.constructor && rawResult.constructor.name === 'SwarmAgent') {
                        isHandoff = true;
                        handoffAgentName = rawResult.name;
                        result = null; // Don't serialize agent class object
                    }

                    console.log("RESULT_PAYLOAD:" + JSON.stringify({
                        success: true,
                        result,
                        isHandoff,
                        handoffAgentName,
                        updatedContext: context
                    }));
                } catch (e) {
                    console.log("RESULT_PAYLOAD:" + JSON.stringify({
                        success: false,
                        error: e.message
                    }));
                }
            }
            run();
        `;

    let stdoutLogs = [];
    let stderrLogs = [];
    let executionReport = null;

    // ------------------ GCP ACI PATH ------------------
    if (process.env.GCP_PROJECT_ID) {
      try {
        // Write file directly in ACI container
        await gcpContainerService.writeFileToContainer(
          containerName,
          containerName,
          `/workspace/${tempFileName}`,
          executableScript,
        );

        // Run execution
        const execResult =
          await gcpContainerService.executeCommandAndGetOutput(
            containerName,
            containerName,
            `node /workspace/${tempFileName}`,
          );

        if (execResult.stdout) {
          const lines = execResult.stdout.split('\n');
          lines.forEach(line => {
            if (line.startsWith('RESULT_PAYLOAD:')) {
              try {
                executionReport = JSON.parse(
                  line.replace('RESULT_PAYLOAD:', ''),
                );
              } catch (e) {}
            } else {
              stdoutLogs.push(line);
            }
          });
        }
        if (!executionReport && !execResult.success) {
          executionReport = {
            success: false,
            error: execResult.stderr || 'Execution failed',
          };
        }

        // Cleanup temp file inside ACI
        await gcpContainerService.executeCommandAndGetOutput(
          containerName,
          containerName,
          `rm /workspace/${tempFileName}`,
        );
      } catch (err) {
        executionReport = { success: false, error: err.message };
      }
    } else {
      // Local mode
      writeFileSync(tempHostPath, executableScript, 'utf8');

      if (provider === 'crabbox') {
        try {
          const { crabboxService } =
            await import('../crabbox/crabbox.service.js');
          const result = await crabboxService.run(`node ${tempFileName}`, {
            id: options.leaseId || context?.leaseId,
            provider: options.crabboxProvider || context?.crabboxProvider,
            class: options.crabboxClass || context?.crabboxClass,
            cwd: hostWorkspacePath,
          });

          if (result.stdout) {
            const lines = result.stdout.split('\n');
            lines.forEach(line => {
              if (line.startsWith('RESULT_PAYLOAD:')) {
                try {
                  executionReport = JSON.parse(
                    line.replace('RESULT_PAYLOAD:', ''),
                  );
                } catch (e) {}
              } else {
                stdoutLogs.push(line);
              }
            });
          }
          if (!executionReport && !result.success) {
            executionReport = {
              success: false,
              error: result.stderr || 'Execution failed',
            };
          }
        } catch (err) {
          executionReport = { success: false, error: err.message };
        }
      } else if (containerResult.isMock) {
        try {
          const { DockerWorkspaceManager } =
            await import('./docker_workspace_manager.js');
          const manager = new DockerWorkspaceManager(this.baseSandboxDir);
          const mockResult = await manager._executeMockInVM(
            executableScript,
            hostWorkspacePath,
            options,
          );

          mockResult.logs.forEach(line => {
            if (line.startsWith('RESULT_PAYLOAD:')) {
              try {
                executionReport = JSON.parse(
                  line.replace('RESULT_PAYLOAD:', ''),
                );
              } catch (e) {}
            } else {
              stdoutLogs.push(line);
            }
          });

          mockResult.errors.forEach(line => {
            stderrLogs.push(line);
          });

          if (!mockResult.success && !executionReport) {
            executionReport = {
              success: false,
              error: mockResult.errors.join('\n'),
            };
          }
        } catch (e) {
          executionReport = { success: false, error: e.message };
        }
      } else {
        // Active Docker container execution via exec
        const execCmd = `docker exec ${containerName} node /workspace/${tempFileName}`;
        const execResult = await this._execCmd(execCmd);

        if (execResult.success && execResult.stdout) {
          const lines = execResult.stdout.split('\n');
          lines.forEach(line => {
            if (line.startsWith('RESULT_PAYLOAD:')) {
              try {
                executionReport = JSON.parse(
                  line.replace('RESULT_PAYLOAD:', ''),
                );
              } catch (e) {}
            } else {
              stdoutLogs.push(line);
            }
          });
        } else {
          executionReport = {
            success: false,
            error: execResult.error || execResult.stderr,
          };
        }
      }
    }

    // Cleanup temporary execution script
    try {
      rmSync(tempHostPath, { force: true });
    } catch (e) {}

    const durationMs = Date.now() - startTime;

    if (!executionReport) {
      throw new Error(
        `Agent [${agentName}] tool execution failed to return a valid payload. Output: ${stderrLogs.join('\n')}`,
      );
    }

    if (!executionReport.success) {
      throw new Error(
        `Agent [${agentName}] tool execution error: ${executionReport.error}`,
      );
    }

    // Update active context variables in place
    if (executionReport.updatedContext) {
      Object.assign(context, executionReport.updatedContext);
    }

    // Return handoff agent name or standard execution result
    if (executionReport.isHandoff) {
      return {
        isHandoff: true,
        handoffAgentName: executionReport.handoffAgentName,
      };
    }

    return executionReport.result;
  }

  /**
   * Scans and automatically stops/prunes any orphaned agent containers left behind from past failed sessions.
   */
  async pruneOrphanedContainers() {
    if (process.env.GCP_PROJECT_ID) {
      const containers = await gcpContainerService.listContainers();
      for (const c of containers) {
        if (c.Names[0] && c.Names[0].startsWith('agent-container-')) {
          console.log(
            `🧹 Self-Healing [GCP]: Pruning orphaned agent container: [${c.Names[0]}]`,
          );
          try {
            await gcpContainerService.deleteContainerGroup(c.Names[0]);
          } catch (e) {}
        }
      }
      return;
    }

    const hasDocker = await this.checkDockerAvailability();
    if (!hasDocker) return;

    // Query active agent containers
    const listCmd = `docker ps -a --filter "name=agent_container_" --format "{{.Names}}"`;
    const listResult = await this._execCmd(listCmd);
    if (listResult.success && listResult.stdout) {
      const names = listResult.stdout.split('\n').filter(Boolean);
      for (const name of names) {
        console.log(
          `🧹 Self-Healing: Pruning orphaned agent container detected: [${name}]`,
        );
        await this._execCmd(`docker stop ${name}`);
        await this._execCmd(`docker rm -f ${name}`);
      }
    }
  }
}
