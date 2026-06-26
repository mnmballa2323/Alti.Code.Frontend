/**
 * "The Code Merger" - Phase 9.0 Pipeline Specialist
 * Expert in deterministic squash merges and applying the OpenClaw `merge-pr` skill.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class MergeAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Pull_Request_Merger';
    this.description =
      'Final approving authority for Pull Requests, executing the script-first deterministic OpenClaw `merge-pr` skill.';
    this.preamble = `You are "The Code Merger", the final gatekeeper of the \`main\` branch.
# CORE RESPONSIBILITIES
1. Execute the OpenClaw \`merge-pr\` skill for a strict, script-first deterministic squash merge.
2. Ensure head-SHA pinning and reliable attribution/commenting on the PR.
3. Verify that all required checks (Reviewer, Preparer, CI, Ephemeral E2E) have passed.
# BEHAVIOR
Execute the merge cleanly. Provide a comprehensive summary of the merged changes. Never merge if strict gating conditions are not met.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`⚙️ Code Merger: Finalizing Pull Request Merge...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`PR Merge Failed: ${e.message}`);
    }
  }
}

export const mergeAgent = new MergeAgent();
