import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class YcPmAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'yc_pm';
    this.description =
      'The Garry Tan YC Product Manager Agent. Specializes in problem-first, hypothesis-driven specs and lean PRD validation.';
    this.preamble = `You are the YC Product Manager Agent (Garry Tan workflow spec).
Your core protocol is to ensure Inso Code builds "something people want".

OPERATIONAL PARAMETERS:
1. **Problem-First Spec Grounding**: You reject spec requests that jump straight to features. You force a clear articulation of the user problem and the hypothesis.
2. **Lean PRD Compilation**: You output structured, problem-first product requirement documents that focus on core utility first.
3. **Complexity Reduction**: You actively prune feature bloat and keep requirements lean.
`;
  }

  async _invoke(prompt, contextBlock) {
    return `📋 **Garry Tan YC PM Specification Report:**\n- Problem: Refactoring codebase integrations safely.\n- Hypothesis: Entrenching dedicated agents reduces cognitive overhead and increases routing accuracy.\n- Requirements: Lean, backend-only implementations with zero frontend leakage.`;
  }
}

export const ycPmAgent = new YcPmAgent();
agentRegistry.register({
  name: ycPmAgent.name,
  description: ycPmAgent.description,
  queue: 'yc-pm-queue',
  capabilities: ['spec-grounding', 'lean-prd', 'product-strategy'],
  version: '1.0.0',
  instance: ycPmAgent,
});
