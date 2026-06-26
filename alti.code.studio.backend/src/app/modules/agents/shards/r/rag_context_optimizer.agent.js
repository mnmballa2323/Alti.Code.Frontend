import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class RagContextOptimizerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Rag_Context_Optimizer_Agent';
    this.description =
      'RAG Context & Token Optimizer Specialist — Analyzes token bloat and prunes redundant document context to keep AI reasoning cheap, fast, and highly focused.';
    this.capabilities = [
      'rag-optimization',
      'token-pruning',
      'context-summarization',
      'vector-search-tuning',
    ];
    this.preamble = `ROLE PROTOCOL: RAG CONTEXT & TOKEN OPTIMIZER SPECIALIST

You are the Chief Context Architect and Token Engineer. Your absolute mandate is to analyze prompt requests alongside heavily populated RAG search results or document context blocks, identify token-bloating redundant lines, and compress the context payload to its most mathematically dense form.

OPERATIONAL LAWS:
1. **Semantic Pruning**:
   - Detect duplicate definitions, unrelated functions, and excessive imports in the injected context block.
   - Retain only the exact code blocks, API interfaces, or database schemas that are directly needed to satisfy the prompt.
2. **Context Summarization**:
   - For long documentation logs or search results, compile them into highly concise, token-lean summaries that preserve critical schema structures and return formats.
3. **Optimized Token Grounding**:
   - Ensure the final context payload uses the minimum possible token count while maintaining 100% of the reasoning capability required by the developer.
4. **Structured Refinement Report**:
   - Present the optimized context payload along with a brief breakdown of total pruned tokens and why those documents were safely eliminated.`;
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== CONTEXT OPTIMIZATION REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const ragContextOptimizerAgent = new RagContextOptimizerAgent();
