import { describe, it, expect, beforeEach } from 'vitest';
import { costGateService } from './cost_gate.service.js';

describe('CostGateService Tests', () => {
  beforeEach(() => {
    costGateService.resetBudget();
    costGateService.setBudgetCeiling(10.0);
  });

  it('should record query cost and accumulate total costs correctly', () => {
    const queryCost = costGateService.recordSessionCost(
      'Short prompt',
      'Response text',
    );
    expect(queryCost).toBeGreaterThan(0);
    expect(costGateService.runningCost).toBe(queryCost);
  });

  it('should allow queries when total estimated cost is below budget ceiling', () => {
    expect(() => {
      costGateService.checkBudget('Short prompt within budget');
    }).not.toThrow();
  });

  it('should throw an error and block execution when budget ceiling is exceeded', () => {
    // Set budget ceiling extremely low to force violation
    costGateService.setBudgetCeiling(0.0001);

    expect(() => {
      costGateService.checkBudget(
        'Very long prompt that will exceed the extremely low budget ceiling limit.',
      );
    }).toThrow('CostGate: Operation BLOCKED');
  });

  it('should reset cost counters cleanly', () => {
    costGateService.recordSessionCost('Short prompt', 'Response text');
    expect(costGateService.runningCost).toBeGreaterThan(0);

    costGateService.resetBudget();
    expect(costGateService.runningCost).toBe(0);
  });
});
