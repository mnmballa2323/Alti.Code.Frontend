import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { auditLogger } from './auditLogger.js';

class SandboxManager {
  init() {
    logger.info('[SandboxManager] Initializing eBPF/gVisor agent sandbox manager...');
  }

  execute(agentId, command, workspacePath) {
    if (!workspacePath.startsWith('/tmp/workspace')) {
      logger.error(`[SandboxManager] Security violation: Attempted to escape sandbox. Path: ${workspacePath}`);
      throw new Error(`Sandbox violation: Cannot execute outside /tmp/workspace (requested: ${workspacePath})`);
    }

    if (auditLogger && auditLogger.log) {
      auditLogger.log(`[SandboxManager] Spawning sandbox for agent: ${agentId}, command: ${command}`);
    } else {
      logger.info(`[SandboxManager] AUDIT: Spawning sandbox for agent: ${agentId}, command: ${command}`);
    }
    
    logger.info(`[SandboxManager] Executing in sandbox [${agentId}]: ${command} at ${workspacePath}`);
    metrics.incrementCounter('sandbox_executions_total', 1);

    // Simulated sandbox execution boundary
    return {
      success: true,
      stdout: `Simulated sandbox execution for agent ${agentId}`,
    };
  }
}

export const sandboxManager = new SandboxManager();
