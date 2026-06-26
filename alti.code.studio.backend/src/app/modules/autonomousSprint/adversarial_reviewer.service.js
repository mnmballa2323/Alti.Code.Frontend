import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class AdversarialReviewerService {
  /**
   * Conducts an adversarial code review debate between a Red-Team (Security/Robustness)
   * and a Blue-Team (Quality/Architecture) agent over a proposed code patch.
   *
   * @param {Object} patchData - Proposed code patch metadata ({ file, patchCode, originalCode, errorLog })
   * @returns {Promise<Object>} The outcome of the debate including consensus and log of debate arguments
   */
  async conductReview(patchData) {
    logger.info(
      `⚔️ Adversarial Review: Starting debate for patch on file: ${patchData.file}`,
    );

    const debateLogs = [];
    let redTeamVote = null;
    let blueTeamVote = null;

    // 1. Red-Team (Security & Robustness) Initial Analysis
    const redTeamPrompt = `You are a specialized Red-Team Security & Robustness Agent.
Analyze the following proposed patch to fix a bug/error.
Original Code:
${patchData.originalCode || '// None'}

Proposed Patch Code:
${patchData.patchCode}

Error Logs:
${patchData.errorLog || 'None'}

Evaluate the patch for:
- Security vulnerabilities (SQLi, XSS, Path Traversal, prototype pollution).
- Hardcoded credentials or API keys.
- Edge cases, error handling leaks, and race conditions.
- Performance regressions (high Big-O complexity).

Return a JSON structure:
{
  "vote": "APPROVE" or "REJECT",
  "reasoning": "Detailed technical analysis of security & robustness issues or lack thereof."
}`;

    try {
      const res = await aiProvider.reason(redTeamPrompt);
      const parsed = this._parseAgentResponse(res);
      redTeamVote = parsed.vote || 'REJECT';
      debateLogs.push({
        agent: 'Red-Team (Security)',
        vote: redTeamVote,
        argument: parsed.reasoning || 'No reasoning provided.',
      });
    } catch (e) {
      logger.error(
        'Adversarial Review: Red-Team analysis failed. Defaulting to REJECT.',
        e,
      );
      redTeamVote = 'REJECT';
      debateLogs.push({
        agent: 'Red-Team (Security)',
        vote: 'REJECT',
        argument: 'Failed to complete security audit due to runtime error.',
      });
    }

    // 2. Blue-Team (Quality & Architecture) Initial Analysis
    const blueTeamPrompt = `You are a specialized Blue-Team Quality & Architecture Agent.
Analyze the following proposed patch to fix a bug/error.
Original Code:
${patchData.originalCode || '// None'}

Proposed Patch Code:
${patchData.patchCode}

Error Logs:
${patchData.errorLog || 'None'}

Evaluate the patch for:
- Readability, simplicity, and formatting conformity.
- Testability and clean abstractions.
- Immutability and side-effects.

Return a JSON structure:
{
  "vote": "APPROVE" or "REJECT",
  "reasoning": "Detailed technical analysis of design patterns, code style, and readability."
}`;

    try {
      const res = await aiProvider.reason(blueTeamPrompt);
      const parsed = this._parseAgentResponse(res);
      blueTeamVote = parsed.vote || 'REJECT';
      debateLogs.push({
        agent: 'Blue-Team (Quality)',
        vote: blueTeamVote,
        argument: parsed.reasoning || 'No reasoning provided.',
      });
    } catch (e) {
      logger.error(
        'Adversarial Review: Blue-Team analysis failed. Defaulting to REJECT.',
        e,
      );
      blueTeamVote = 'REJECT';
      debateLogs.push({
        agent: 'Blue-Team (Quality)',
        vote: 'REJECT',
        argument:
          'Failed to complete architectural review due to runtime error.',
      });
    }

    logger.info(
      `⚔️ Adversarial Review: Initial Votes - Red-Team: ${redTeamVote}, Blue-Team: ${blueTeamVote}`,
    );

    // 3. Resolve Consensus
    let consensusReached = false;
    let finalOutcome = 'REJECT';

    if (redTeamVote === 'APPROVE' && blueTeamVote === 'APPROVE') {
      consensusReached = true;
      finalOutcome = 'APPROVE';
      logger.info('⚔️ Adversarial Review: Strong positive consensus reached.');
    } else if (redTeamVote === 'REJECT' && blueTeamVote === 'REJECT') {
      consensusReached = true;
      finalOutcome = 'REJECT';
      logger.warn(
        '⚔️ Adversarial Review: Swarm unanimously rejected the patch.',
      );
    } else {
      // One approved, one rejected. Triggering Debate Round!
      logger.warn(
        '⚔️ Adversarial Review: Split decision. Triggering active debate round...',
      );
      const debateResult = await this._runDebateRound(patchData, debateLogs);
      consensusReached = debateResult.consensusReached;
      finalOutcome = debateResult.finalOutcome;
      debateLogs.push(...debateResult.rounds);
    }

    return {
      success: finalOutcome === 'APPROVE',
      consensusReached,
      finalOutcome,
      debateLogs,
    };
  }

  async _runDebateRound(patchData, initialLogs) {
    // Red-Team and Blue-Team exchange arguments, referencing the other agent's review and vote.
    const redRecord = initialLogs.find(l => l.agent.includes('Red-Team'));
    const blueRecord = initialLogs.find(l => l.agent.includes('Blue-Team'));

    const debatePrompt = `You are a senior arbitration agent moderating a debate between two specialized agents:
- Red-Team Security (Vote: ${redRecord.vote}): "${redRecord.argument}"
- Blue-Team Quality (Vote: ${blueRecord.vote}): "${blueRecord.argument}"

Proposed Patch Code:
${patchData.patchCode}

Re-evaluate the patch considering both arguments. Decide whether to override the split decision and reach a final consensus to APPROVE or REJECT the patch.
Return a JSON structure:
{
  "consensusReached": true or false,
  "finalOutcome": "APPROVE" or "REJECT",
  "arbitrationReasoning": "Provide the final architectural decision summary."
}`;

    const rounds = [];
    let consensusReached = false;
    let finalOutcome = 'REJECT';

    try {
      const res = await aiProvider.reason(debatePrompt);
      const parsed = this._parseAgentResponse(res);
      consensusReached = parsed.consensusReached !== false;
      finalOutcome = parsed.finalOutcome || 'REJECT';

      rounds.push({
        agent: 'Arbitrator',
        vote: finalOutcome,
        argument:
          parsed.arbitrationReasoning || 'Arbitration final decision compiled.',
      });
    } catch (e) {
      logger.error('Adversarial Review: Arbitration failed.', e);
      rounds.push({
        agent: 'Arbitrator',
        vote: 'REJECT',
        argument: 'Arbitration failed due to LLM error.',
      });
    }

    return {
      consensusReached,
      finalOutcome,
      rounds,
    };
  }

  _parseAgentResponse(response) {
    try {
      const cleanResponse = response
        .trim()
        .replace(/^```(json)?/, '')
        .replace(/```$/, '')
        .trim();
      return JSON.parse(cleanResponse);
    } catch (e) {
      logger.error(
        'Adversarial Review: Failed to parse JSON response. Using fallback mock.',
        e,
      );
      return {
        vote: 'REJECT',
        reasoning: 'Fallback due to invalid JSON format.',
      };
    }
  }
}

export const adversarialReviewerService = new AdversarialReviewerService();
