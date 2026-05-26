import { test, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { CliAnythingService } from '../../src/app/modules/cliAnything/cliAnything.service.js';
import { CliAnythingAgent } from '../../src/app/modules/agents/cliAnything.agent.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';

const TEST_DIR = path.resolve(__dirname, '../../temp_test_cli');

beforeAll(async () => {
  // Ensure the clean test folder is initialized
  try {
    await fs.mkdir(TEST_DIR, { recursive: true });
  } catch (e) {
    // Already exists
  }
});

afterAll(async () => {
  // Deep clean test folder to avoid polluting workspace
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
});

test('CLI-Anything Service: Complete 7-Phase Pipeline & Disk Scaffold', async () => {
  const appName = 'MyTestApplication';
  
  // 1. Execute the full 7-phase generation pipeline
  const result = await CliAnythingService.generateCLI(TEST_DIR, appName);
  
  expect(result.success).toBe(true);
  expect(result.appName).toBe(appName);
  expect(result.workspacePath).toBe(TEST_DIR);

  // 2. Validate all files actually written to disk in sequence
  const fileList = await fs.readdir(TEST_DIR);
  expect(fileList).toContain('analysis_report.md');
  expect(fileList).toContain('cli_schema.json');
  expect(fileList).toContain('cli_harness.py');
  expect(fileList).toContain('TEST.md');
  expect(fileList).toContain('test_cli_harness.py');
  expect(fileList).toContain('SKILL.md');
  expect(fileList).toContain('setup.py');

  // 3. Verify inner content structure of Click CLI harness
  const harnessCode = await fs.readFile(path.join(TEST_DIR, 'cli_harness.py'), 'utf8');
  expect(harnessCode).toContain('import click');
  expect(harnessCode).toContain('@click.group(invoke_without_command=True)');
  expect(harnessCode).toContain('def status(ctx):');
  expect(harnessCode).toContain('def execute(ctx, action, payload):');
  expect(harnessCode).toContain('def undo(ctx):');
});

test('CLI-Anything Service: Stateful Command Refinement', async () => {
  const appName = 'MyTestApplication';
  const prompt = 'Add dynamic benchmark performance test checks';

  // Trigger iterative refinement over pre-generated click file
  const refineRes = await CliAnythingService.refineCLI(TEST_DIR, appName, prompt);
  
  expect(refineRes.success).toBe(true);
  expect(refineRes.refinedCommand).toBeDefined();

  // Assert click_harness has the dynamically appended subcommand
  const harnessCode = await fs.readFile(path.join(TEST_DIR, 'cli_harness.py'), 'utf8');
  expect(harnessCode).toContain('def add_dynamic_ben');
});

test('CLI-Anything Service: Swarm Discovery', async () => {
  const matches = await CliAnythingService.discoverCLIs(TEST_DIR);
  
  expect(matches.length).toBeGreaterThanOrEqual(1);
  expect(matches[0].appName).toBe(path.basename(TEST_DIR));
  expect(matches[0].skillFile).toContain('SKILL.md');
});

test('CLI-Anything Swarm Agent: Dynamic Registration & Capabilities', () => {
  const agent = new CliAnythingAgent();
  expect(agent.name).toBe('cliAnything');
  
  // Verify agent registration inside central nexus registry
  const registeredAgent = agentRegistry.get('cliAnything');
  expect(registeredAgent).toBeDefined();
  expect(registeredAgent.name).toBe('cliAnything');
  expect(registeredAgent.capabilities).toContain('cli-generation');
  expect(registeredAgent.capabilities).toContain('agentic-compiler');
});

test('CLI-Anything Service: Programmatic Click Execution & State Machine', async () => {
  const appName = 'MyTestApplication';

  // 1. Ingest initial status command
  const statusRes = await CliAnythingService.executeCLICommand(TEST_DIR, appName, 'status');
  expect(statusRes.app).toBe(appName);
  expect(statusRes.status).toBe('idle');
  expect(statusRes.history_depth).toBe(0);

  // 2. Ingest state-changing action mutation
  const execRes = await CliAnythingService.executeCLICommand(TEST_DIR, appName, 'execute', [
    '--action',
    'resize',
    '--payload',
    '{"w":1920}'
  ]);
  expect(execRes.success).toBe(true);
  expect(execRes.status).toBe('active_action_resize');
  expect(execRes.executed_action.action).toBe('resize');

  // 3. Verify history depth increments
  const statusRes2 = await CliAnythingService.executeCLICommand(TEST_DIR, appName, 'status');
  expect(statusRes2.history_depth).toBe(1);
  expect(statusRes2.status).toBe('active_action_resize');

  // 4. Ingest undo state change
  const undoRes = await CliAnythingService.executeCLICommand(TEST_DIR, appName, 'undo');
  expect(undoRes.success).toBe(true);
  expect(undoRes.new_pointer).toBe(-1);

  // 5. Verify status reverted
  const statusRes3 = await CliAnythingService.executeCLICommand(TEST_DIR, appName, 'status');
  expect(statusRes3.status).toBe('undid_action_resize');
});

test('CLI-Anything Swarm Agent: Agentic Command Routing', async () => {
  const appName = 'MyTestApplication';
  const agent = new CliAnythingAgent();

  // Route an execution query through the dynamic specialist agent
  const prompt = `check status in path ${TEST_DIR} and app MyTestApplication`;
  const result = await agent._invoke(prompt, {});

  expect(result).toContain('cliAnything Command Executed Successfully!');
  expect(result).toContain('Stateful Execution Result:');
  expect(result).toContain('undid_action_resize');
});

