/**
 * Copyright (c) 2024–2026 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent, AgentError } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js'; // The registry nexus
import { CliAnythingService } from '../cliAnything/cliAnything.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

export class CliAnythingAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'cliAnything';
    this.description = 'Agent-Native Software Compiler — Autonomously transforms target application codebases into stateful agent-native CLIs using a 7-phase compilation pipeline.';
    this.preamble = `
You are the CLI-Anything specialist agent.
Your core capability is executing the HKUDS 7-phase agent-native compilation pipeline over codebases to turn standard apps into stateful, agent-ready command line interfaces (CLIs).

These 7 phases are:
1. ANALYZE: Scan target source directories, identify core internal APIs and models.
2. DESIGN: Architect click-based command groups, schemas, and sessions.
3. IMPLEMENT: Scaffold Python/Click stateful harnesses with REPL, undo/redo capabilities, and JSON outputs.
4. PLAN TESTS: Write comprehensive TEST.md strategies.
5. WRITE TESTS: Generate high-coverage test suites.
6. DOCUMENT: Generate agentic SKILL.md discoverability manifests.
7. PUBLISH: Build setup.py scripts for PATH command-line bindings.

You can also refine and extend commands iteratively based on gap-analysis user requests.
    `.trim();
  }

  /**
   * Invokes the agentic compiler or refinement.
   */
  async _invoke(prompt, contextBlock, opts = {}) {
    const correlationId = crypto.randomUUID().slice(0, 8);
    logger.info(`⚡ [cliAnything] [cid:${correlationId}] Swarm request received: ${prompt}`);

    const cleanPrompt = prompt.toLowerCase();
    
    // Parse target paths out of prompt or context
    const pathMatch = prompt.match(/(?:in|at|path|dir)\s+([^\s]+)/i);
    const workspacePath = pathMatch ? pathMatch[1] : './scratch/compiled-cli';
    
    const appNameMatch = prompt.match(/(?:app|project|name)\s+([^\s]+)/i);
    const appName = appNameMatch ? appNameMatch[1] : 'SovereignApp';

    if (cleanPrompt.includes('refine') || cleanPrompt.includes('extend') || cleanPrompt.includes('gap')) {
      logger.info(`⚡ [cliAnything] Triggering iterative CLI refinement...`);
      try {
        const res = await CliAnythingService.refineCLI(workspacePath, appName, prompt);
        return `✅ [cliAnything] Refinement successful!\n\n${res.message}\nNew capability added: '${res.refinedCommand}'`;
      } catch (err) {
        throw new AgentError(`Refinement failed: ${err.message}`, 'REFINEMENT_ERROR', false);
      }
    }

    // Default: run full 7-phase pipeline
    logger.info(`⚡ [cliAnything] Triggering full 7-phase CLI compilation...`);
    try {
      const res = await CliAnythingService.generateCLI(workspacePath, appName);
      
      const fileSummary = Object.entries(res.results)
        .map(([phase, detail]) => `- **Phase: ${phase}** -> status: ${detail.status} (${detail.file || 'scanned'})`)
        .join('\n');

      return `
🌌 **cliAnything Agent-Native Compilation Complete!**
Successfully compiled application **${appName}** inside **${workspacePath}**.

### 7-Phase Pipeline Results Summary:
${fileSummary}

Generated files are fully verified, written to disk, and ready for system installation.
      `.trim();
    } catch (err) {
      throw new AgentError(`Compilation pipeline exploded: ${err.message}`, 'PIPELINE_ERROR', false);
    }
  }

  getHealth() {
    return {
      name: this.name,
      status: 'READY',
      version: '1.0.0-hkuds',
    };
  }
}

// Dynamically self-register with the central nexus registry
const cliAnythingAgentInstance = new CliAnythingAgent();
agentRegistry.register({
  name: cliAnythingAgentInstance.name,
  description: cliAnythingAgentInstance.description,
  queue: 'cli-anything-queue',
  capabilities: ['cli-generation', 'codebase-refinement', 'stateful-repl-scaffolding', 'agentic-compiler'],
  policy: { accessLevel: 'DEVELOPER' },
  version: '1.0.0',
  instance: cliAnythingAgentInstance
});
