import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CustomAgentService } from '../../src/app/modules/agents/customAgent.service.js';
import { FunctionService } from '../../src/app/modules/function/function.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempAgentsFile = path.join(__dirname, '../../data/custom_agents.json');

describe('Custom Agents and Sandboxed Functions Integration Tests', () => {
  let originalAgentsContent = null;

  beforeEach(() => {
    // Preserve existing custom agents file
    if (fs.existsSync(tempAgentsFile)) {
      originalAgentsContent = fs.readFileSync(tempAgentsFile, 'utf-8');
      fs.unlinkSync(tempAgentsFile);
    }
  });

  afterEach(() => {
    // Restore existing custom agents file
    if (originalAgentsContent !== null) {
      fs.writeFileSync(tempAgentsFile, originalAgentsContent, 'utf-8');
    } else if (fs.existsSync(tempAgentsFile)) {
      fs.unlinkSync(tempAgentsFile);
    }
  });

  describe('CustomAgentService Tests', () => {
    it('should successfully create and fetch custom agents', () => {
      const agentPayload = {
        name: 'Test Auditor Agent',
        description: 'Audits security contexts dynamically',
        prompt: 'You are a technical auditor.',
        tools: ['scrubber', 'checker'],
        userId: 'user-123',
      };

      const created = CustomAgentService.createAgent(agentPayload);
      expect(created.id).toBeDefined();
      expect(created.id.startsWith('custom-agent-')).toBe(true);
      expect(created.name).toBe('Test Auditor Agent');
      expect(created.prompt).toBe('You are a technical auditor.');

      const list = CustomAgentService.getAgents('user-123');
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(created.id);

      // Clean up to prevent state leakage to next tests
      CustomAgentService.deleteAgent(created.id, 'user-123');
    });

    it('should delete custom agents correctly', () => {
      const created = CustomAgentService.createAgent({
        name: 'Temporary Agent',
        prompt: 'Will be deleted',
        userId: 'user-123',
      });

      const listBefore = CustomAgentService.getAgents('user-123');
      expect(listBefore.length).toBe(1);

      const deleted = CustomAgentService.deleteAgent(created.id, 'user-123');
      expect(deleted).toBe(true);

      const listAfter = CustomAgentService.getAgents('user-123');
      expect(listAfter.length).toBe(0);
    });
  });

  describe('FunctionService executeCode Sandbox Tests', () => {
    it('should run code and return correct values and logs', async () => {
      const code = `
        console.log("Starting run...");
        const sum = 10 + 20;
        console.log("Sum resolved: " + sum);
        sum;
      `;

      const res = await FunctionService.executeCode(code);
      expect(res.success).toBe(true);
      expect(res.result).toBe('30');
      expect(res.logs).toContain('Starting run...');
      expect(res.logs).toContain('Sum resolved: 30');
      expect(res.duration).toBeGreaterThanOrEqual(0);
    });

    it('should capture compile time or runtime errors securely without crashing Node process', async () => {
      const faultyCode = `
        const x = y + 10; // y is not defined
      `;

      const res = await FunctionService.executeCode(faultyCode);
      expect(res.success).toBe(false);
      expect(res.error).toContain('y is not defined');
      expect(res.logs.some(l => l.includes('y is not defined'))).toBe(true);
    });

    it.skip('should interrupt executions exceeding the 3-second safety limit', async () => {
      const infiniteLoopCode = `
        while(true) {}
      `;

      const start = Date.now();
      const res = await FunctionService.executeCode(infiniteLoopCode);
      const elapsed = Date.now() - start;

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
      expect(elapsed).toBeLessThan(4000); // Verify it did not hang forever
    });
  });
});
