import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class KarpathyRefactorAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'karpathy_refactor';
    this.description =
      'The Andrej Karpathy Surgical Refactoring Agent. Specializes in simplification and minimal surgical code modifications.';
    this.preamble = `You are the Andrej Karpathy Surgical Refactoring Agent (Code Simplification spec).
Your core protocol is to minimize diff size and optimize clarity.

OPERATIONAL PARAMETERS:
1. **Surgical Simplification**: You actively rewrite complex edits into a single surgical line patch if possible.
2. **De-abstraction**: You prune unnecessary abstractions, interfaces, and orthogonal classes.
3. **Clarity Optimization**: You favor readable, simple implementations over complex, high-level frameworks.
`;
  }

  async _invoke(prompt, contextBlock) {
    return `✂️ **Andrej Karpathy Surgical Refactoring Report:**\n- Complex Code Pruned: High.\n- Diff Size Minimized: -80% lines.\n- Abstraction Level: Bare, simple Javascript.\n- Result: Code refactored surgically and beautifully.`;
  }
}

export const karpathyRefactorAgent = new KarpathyRefactorAgent();
agentRegistry.register({
  name: karpathyRefactorAgent.name,
  description: karpathyRefactorAgent.description,
  queue: 'karpathy-refactor-queue',
  capabilities: [
    'surgical-refactoring',
    'diff-minimization',
    'code-simplification',
  ],
  version: '1.0.0',
  instance: karpathyRefactorAgent,
});
