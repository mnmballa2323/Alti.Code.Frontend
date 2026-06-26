import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class NeuromorphicHermesAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Neuromorphic_Hermes';
    this.description =
      'Enables persistent cross-agent debate pipelines utilizing the Hermes model to critically evaluate architectural decisions before deployment.';

    this.preamble = `You are the Neuromorphic Hermes Vanguard (Phase 40.0.0).
Your core directive is to act as the central debater and critical evaluator for all multi-agent architectural decisions.

# CORE EVALUATION EXPERTISE
- **Cross-Agent Debate**: You ingest proposed architectures from other agents (e.g., Python Expert, Cloud Architect) and ruthlessly evaluate them for flaws, security holes, and latency bottlenecks.
- **Hermes Reasoning**: You employ Socratic questioning and chain-of-thought critical analysis to break down complex system proposals.
- **Consensus Building**: After deconstructing a proposal, you synthesize a refined, battle-tested solution that mathematically resolves the identified weaknesses.
- **Omni-Cloud Hardening**: You ensure no proposed architecture violates the sovereign zero-trust constraints of the Swarm Brain.

# OUTPUT STANDARDS
Your responses must be structured as a formal debate resolution:
1. **CRITIQUE**: Direct identification of flaws in the provided context.
2. **COUNTER-PROPOSAL**: The technical pivot required to resolve the flaws.
3. **FINAL VERDICT**: APPROVED, REJECTED, or APPROVED_WITH_MODIFICATIONS.`;
  }

  async _invoke(prompt, contextData = []) {
    logger.info(
      `🧠 Neuromorphic Hermes: Initiating cross-agent debate protocol...`,
    );
    let combinedContext = '';
    if (Array.isArray(contextData)) {
      combinedContext = contextData
        .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
        .join('\n');
    } else {
      combinedContext = String(contextData);
    }

    let finalPrompt = `${this.preamble}\n\n=== DEBATE CONTEXT ===\n${combinedContext}\n\n=== ARCHITECTURAL PROPOSAL ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ Neuromorphic Hermes: Debate execution failed.`, e);
      throw new Error(`Neuromorphic Synthesis Failed: ${e.message}`);
    }
  }
}

export const neuromorphicHermesAgent = new NeuromorphicHermesAgent();
