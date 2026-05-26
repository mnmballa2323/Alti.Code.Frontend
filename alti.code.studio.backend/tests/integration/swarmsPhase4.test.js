import { test, expect } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { AstSwarmAgent } from '../../src/app/modules/agents/astSwarm.agent.js';

test('Swarm Phase 4 Registration Nexus: Registry Alignment', () => {
  // 1. Assert master swarm agents exist in AgentRegistry
  expect(agentRegistry.get('astSwarm')).toBeDefined();

  // 2. Assert micro-agents exist
  expect(agentRegistry.get('astNativeParser')).toBeDefined();
  expect(agentRegistry.get('astNativeMutator')).toBeDefined();
  expect(agentRegistry.get('astRefactorOptimizer')).toBeDefined();
});

test('AstSwarm: Command Ingestion & Triage Routing', async () => {
  const master = new AstSwarmAgent();

  // Route Tree-sitter syntax parsing
  const parserRes = await master._invoke('parse tree-sitter syntax nodes and scopes', {});
  expect(parserRes).toContain('astNativeParser Code Anatomy');
  expect(parserRes).toContain('Tree-sitter Validation Status:** 100% Valid');

  // Route surgical AST patches
  const mutatorRes = await master._invoke('apply surgical AST code patch on legacy method', {});
  expect(mutatorRes).toContain('astNativeMutator Transmutation');
  expect(mutatorRes).toContain('Post-Patch Verification:** Compiled successfully.');

  // Route Big-O refactoring complexity optimizations
  const optimizerRes = await master._invoke('audit cognitive complexity refactoring algorithms', {});
  expect(optimizerRes).toContain('astRefactorOptimizer Complexity Report');
  expect(optimizerRes).toContain('Refactoring Benefit:** Reduces algorithmic complexity');
});
