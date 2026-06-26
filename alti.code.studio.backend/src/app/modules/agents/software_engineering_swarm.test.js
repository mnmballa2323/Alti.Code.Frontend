import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwarmEngine } from './custom_swarm_orchestrator.js';
import {
  SwarmArchitectAgent,
  SwarmHermesDebateAgent,
  SwarmTddCoderAgent,
  SwarmQaTesterAgent,
  SwarmSecurityAuditorAgent,
  SwarmDevOpsEngineerAgent,
} from './software_engineering_swarm.js';
import { aiProvider } from '../ai/ai.provider.js';
import { crabboxService } from '../crabbox/crabbox.service.js';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';

vi.mock('../ai/ai.provider.js', () => {
  return {
    aiProvider: {
      init: vi.fn(),
      reason: vi.fn(),
      client: {},
    },
  };
});

vi.mock('./hermes_debate_chamber.service.js', () => {
  return {
    hermesDebateChamberService: {
      initiateDebate: vi
        .fn()
        .mockResolvedValue('Mocked refined architectural consensus spec'),
    },
  };
});

describe('6-Agent Collaborative Developer Swarm with Crabbox Remote Execution', () => {
  let engine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new SwarmEngine();
  });

  it('should successfully run the entire 6-agent SDLC pipeline executing via Crabbox', async () => {
    // 1. Mock the AI Provider reason to simulate LLM swarm orchestration trace
    let turnCount = 0;
    aiProvider.reason.mockImplementation(async (prompt, options = {}) => {
      turnCount++;
      if (turnCount === 1) {
        // Architect designs and hands off to Hermes Debate
        const design = await options.onToolCall('design_system_architecture', {
          featureName: 'Secure Token Rotator',
          requirements: 'Low latency',
        });
        await options.onToolCall('handoff_to_hermes_debate', {});
        return 'Architecture designed and handed off to Hermes Debate.';
      } else if (turnCount === 2) {
        // Hermes Debate Chamber saves refined architecture and hands off to Coder
        const refined = await options.onToolCall('save_refined_architecture', {
          refinedSpec: 'Mocked refined architectural consensus spec',
        });
        await options.onToolCall('handoff_to_coder', {});
        return 'Architecture refined and consensus spec saved.';
      } else if (turnCount === 3) {
        // Coder generates code and hands off to QA
        const code = await options.onToolCall('generate_permissive_code', {
          specifications: 'Specs',
        });
        await options.onToolCall('handoff_to_qa_tester', {});
        return 'Code generated.';
      } else if (turnCount === 4) {
        // QA generates tests, runs them, and hands off to Security
        const test = await options.onToolCall('generate_integration_tests', {
          sourceCode: 'import crypto from "crypto";',
        });
        await options.onToolCall('handoff_to_security_auditor', {});
        return 'Tests generated and run.';
      } else if (turnCount === 5) {
        // Security audits and hands off to DevOps
        const audit = await options.onToolCall('verify_security_compliance', {
          code: 'Code',
        });
        await options.onToolCall('handoff_to_devops', {});
        return 'Security audit complete.';
      } else if (turnCount === 6) {
        // DevOps generates compose and signs off
        const deploy = await options.onToolCall('generate_deployment_spec', {
          serviceName: 'token-rotator',
        });
        const verdict = await options.onToolCall('sign_off_sprint', {});
        return 'DevOps specs generated.';
      }
      return 'Swarm execution complete.';
    });

    // 2. Mock crabboxService.run to run the code locally using node (simulating Crabbox execution)
    const runSpy = vi
      .spyOn(crabboxService, 'run')
      .mockImplementation(async (command, opts = {}) => {
        const scriptPath = path.join(opts.cwd, command.replace('node ', ''));

        return new Promise(resolve => {
          cp.exec(
            `node ${scriptPath}`,
            { cwd: opts.cwd },
            (error, stdout, stderr) => {
              resolve({
                success: !error,
                stdout: stdout,
                stderr: stderr,
                error: error ? error.message : null,
              });
            },
          );
        });
      });

    // 3. Mock WorkspaceIsolator destroy to prevent early deletion of the workspace before assertions
    const { WorkspaceIsolator } =
      await import('../sandbox/workspace_isolator.js');
    const destroySpy = vi
      .spyOn(WorkspaceIsolator.prototype, 'destroy')
      .mockImplementation(() => {});

    // 4. Set the context variables indicating Crabbox provider and lease
    const contextVariables = {
      provider: 'crabbox',
      leaseId: 'mock-lease-id',
    };

    // 5. Run the swarm session starting with SwarmArchitectAgent
    const userRequest = [
      { role: 'user', content: 'Build token rotation service' },
    ];
    const result = await engine.run(
      SwarmArchitectAgent,
      userRequest,
      contextVariables,
      6,
    );

    // 6. Assertions
    expect(result.agent.name).toBe('SwarmDevOpsEngineer');
    expect(result.history.length).toBe(6);
    expect(runSpy).toHaveBeenCalled();

    // Verify that the files were actually created inside the sandbox workspace
    const wsPath = result.contextVariables.sessionWorkspacePath;
    try {
      expect(fs.existsSync(path.join(wsPath, 'architecture_design.md'))).toBe(
        true,
      );
      expect(
        fs.existsSync(path.join(wsPath, 'refined_architecture_design.md')),
      ).toBe(true);
      expect(fs.existsSync(path.join(wsPath, 'SessionTokenManager.js'))).toBe(
        true,
      );
      expect(
        fs.existsSync(path.join(wsPath, 'SessionTokenManager.test.js')),
      ).toBe(true);
      expect(fs.existsSync(path.join(wsPath, 'security_report.json'))).toBe(
        true,
      );
      expect(fs.existsSync(path.join(wsPath, 'Dockerfile'))).toBe(true);
      expect(fs.existsSync(path.join(wsPath, 'docker-compose.yml'))).toBe(true);
    } finally {
      // Clean up workspace after assertions
      destroySpy.mockRestore();
      const isolator = new WorkspaceIsolator();
      isolator.destroy({
        id: result.contextVariables.provisionedSessionWorkspaceId,
        path: wsPath,
      });
    }
  }, 120000);
});
