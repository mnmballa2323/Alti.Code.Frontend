import { logger } from '../../../shared/logger.js';
import { GithubOpenSourceService } from '../github/githubOpenSource.service.js';
import { triBrainService } from './tri_brain.service.js';
import { astMetamorphService } from './ast_metamorph.service.js';

/**
 * Project Singularity: The Autonomous Open-Source Ingestion Engine
 * Crawls GitHub for permissive MIT/Apache 2.0 licensed code, evaluates its efficiency
 * using the Tri-Brain, and autonomously hot-swaps the superior logic into live memory.
 */
class OpenSourceIngestionService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.INGESTION_CYCLE_MS = 300_000; // Search every 5 minutes

    this.searchTopics = [
      'high performance AST parser',
      'advanced LLM routing algorithm',
      'fastest JSON serialization',
      'lock-free multi-threading queue',
      'memory efficient semantic search',
    ];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info(
      '🪐 [Singularity] Global Open-Source Ingestion Engine booting...',
    );

    this.intervalId = setInterval(
      () => this._executeIngestionCycle(),
      this.INGESTION_CYCLE_MS,
    );

    // Kick off first cycle immediately
    setTimeout(() => this._executeIngestionCycle(), 5000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isRunning = false;
    logger.warn('🛑 [Singularity] Ingestion Engine halted.');
  }

  async _executeIngestionCycle() {
    const topic =
      this.searchTopics[Math.floor(Math.random() * this.searchTopics.length)];
    logger.info(
      `🔍 [Singularity] Crawling GitHub for pure MIT/Apache 2.0 implementations of: "${topic}"`,
    );

    try {
      // Phase 1: Global Ingestion
      // Notice: searchOpenSource strictly enforces 'license:mit license:apache-2.0'
      const results = await GithubOpenSourceService.searchOpenSource(
        topic,
        'code',
        3,
      );

      if (!results || results.length === 0) {
        logger.info(
          `   [Singularity] No suitable permissive code found for topic.`,
        );
        return;
      }

      const targetFile = results[0];
      logger.info(
        `📥 [Singularity] Harvesting candidate: ${targetFile.name} from ${targetFile.repo}`,
      );

      const [owner, repoName] = targetFile.repo.split('/');
      const rawContent = await GithubOpenSourceService.getRawContent(
        owner,
        repoName,
        targetFile.path,
      );

      if (!rawContent) return;

      // Phase 2: Tri-Brain Vetting
      logger.info(
        `🧠 [Singularity] Tri-Brain vetting harvested code for optimization potential...`,
      );

      const vettingPrompt = `You are evaluating a permissive MIT-licensed piece of open-source code harvested from GitHub:
            
            [Source: ${targetFile.repo} / ${targetFile.path}]
            \`\`\`javascript
            ${rawContent.substring(0, 3000)} // Truncated for safety
            \`\`\`
            
            Question: Does this code contain an algorithmic pattern or mathematical optimization that is strictly superior to standard Node.js implementations? 
            If yes, refactor it to fit our architecture and return ONLY the pure JavaScript function code (no markdown, no explanation).
            If no, return the exact string "REJECT".`;

      const evaluation = await triBrainService.fastInference(vettingPrompt);
      const refactoredCode = evaluation.trim();

      if (refactoredCode === 'REJECT' || refactoredCode.includes('REJECT')) {
        logger.info(
          `📉 [Singularity] Tri-Brain rejected the harvested code. (Sub-optimal performance).`,
        );
        return;
      }

      // Phase 3: Autonomous Neural Integration
      logger.info(
        `🚀 [Singularity] Tri-Brain APPROVED harvested optimization. Initiating AST Hot-Swap...`,
      );

      try {
        // Attempt to inject the new algorithm into the live Metamorphic V8 Engine Sandbox
        astMetamorphService.hotSwap(refactoredCode);
        logger.info(
          `✅ [Singularity] Successfully absorbed open-source DNA into live memory.`,
        );
      } catch (hotSwapErr) {
        logger.error(
          `❌ [Singularity] Metamorphic hot-swap rejected the alien DNA: ${hotSwapErr.message}`,
        );
      }
    } catch (error) {
      logger.error('❌ [Singularity] Ingestion cycle failed:', error);
    }
  }
}

export const openSourceIngestionService = new OpenSourceIngestionService();
