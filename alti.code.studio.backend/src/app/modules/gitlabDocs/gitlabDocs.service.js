import { logger } from '../../../shared/logger.js';
import { ragService } from '../memory/rag.service.js';
import { agentMemoryService } from '../memory/agentmemory.service.js';

class GitlabDocsService {
  constructor() {
    this.name = 'GitlabDocsService';
  }

  /**
   * Query ingested documentation chunks, with live search fallback on RAG confidence low
   */
  async searchDocs(query, limit = 5) {
    logger.info(
      `🦊 [GitLab Docs] Searching GitLab Documentation RAG for: "${query}"`,
    );
    let ragResult = await ragService.query(query, limit);

    // Grounding fallback: check if empty, generic failure string, or low confidence
    if (
      !ragResult ||
      ragResult.includes('No relevant context found') ||
      ragResult.trim().length === 0 ||
      ragResult.includes('does not contain enough information')
    ) {
      logger.info(
        `🦊 [GitLab Docs] Local RAG confidence low/empty. Falling back to live web search grounding...`,
      );
      try {
        const { GoogleSearchService } =
          await import('../googleSearch/googleSearch.service.js');
        const webResult = await GoogleSearchService.getSearchContext(query);
        return `[Live Web Grounding Fallback]\n\n${webResult}`;
      } catch (error) {
        logger.warn(
          `🦊 [GitLab Docs] Web search grounding failed: ${error.message}`,
        );
      }
    }
    return ragResult;
  }

  /**
   * Dispatch a user query dynamically to the correct specialist in our GitLab Swarm.
   * @param {string} query
   * @param {string} [preferredAgentId] - Manually override the router and target a specific agent
   * @returns {Promise<object>} - Telemetry wrapped specialist consultation response
   */
  async dispatchQueryToSwarm(query, preferredAgentId = null) {
    const { agentRegistry } = await import('../agents/agent.registry.js');
    await agentRegistry.loadPlugins();

    let agentId = preferredAgentId;

    // If no preferred agent, automatically route using semantic capability matching rules
    if (!agentId) {
      const lowerQuery = query.toLowerCase();
      const allAgents = agentRegistry.list();

      let bestAgentId = null;
      let highestMatchScore = 0;

      // 1. Dynamic precision capability and keyword mapping over all registered specialist plugins
      for (const agent of allAgents) {
        // Check if agent is a gitlab plugin
        if (agent.isPlugin && agent.name.startsWith('gitlab')) {
          let score = 0;

          // Match by granular capabilities (e.g. gitlab-create-project)
          let maxCapScore = 0;
          if (agent.capabilities && agent.capabilities.length > 0) {
            for (const cap of agent.capabilities) {
              const capClean = cap.replace(/-/g, ' ');
              const words = capClean.split(' ').filter(w => w !== 'gitlab');

              // Score for this specific capability
              const matchedWords = words.filter(word =>
                new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery),
              );
              if (matchedWords.length > 0) {
                const capScore = 10 * matchedWords.length;
                if (capScore > maxCapScore) {
                  maxCapScore = capScore;
                }
              }
            }
          }
          score += maxCapScore;

          // Match by CamelCase Agent Name (e.g. gitlabRepoCreator)
          const idClean = agent.name
            .replace(/gitlab/i, '')
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase();
          const idWords = idClean.split(' ').filter(w => w.trim().length > 0);
          const matchedIdWords = idWords.filter(word =>
            new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery),
          );
          if (matchedIdWords.length > 0) {
            score += 5 * matchedIdWords.length;
          }

          if (score > highestMatchScore) {
            highestMatchScore = score;
            bestAgentId = agent.name;
          }
        }
      }

      if (bestAgentId && highestMatchScore >= 5) {
        agentId = bestAgentId;
        logger.info(
          `🦊 [GitLab Docs Gateway] Dynamic semantic match routed query to granular agent: [${agentId}] (Score: ${highestMatchScore})`,
        );
      } else {
        // 2. Fallback Router to GitLab Swarm Fallbacks
        if (
          /\b(pipelines?|jobs?|artifacts?|variables?|schedules?)\b/i.test(query)
        ) {
          agentId = 'gitlabPipelinesSpecialist';
        } else if (
          /\b(merge requests?|mrs?|approvals?|diffs?|discussions?)\b/i.test(
            query,
          )
        ) {
          agentId = 'gitlabMrManager';
        } else if (
          /\b(issues?|epics?|milestones?|todos?|time)\b/i.test(query)
        ) {
          agentId = 'gitlabIssuesManager';
        } else if (
          /\b(compliance|security|licenses?|environments?|push rules)\b/i.test(
            query,
          )
        ) {
          agentId = 'gitlabSecurityAuditor';
        } else {
          agentId = 'gitlabExpert';
        }
      }
    }

    const agentDef = agentRegistry.get(agentId);
    if (!agentDef || !agentDef.instance) {
      throw new Error(
        `The requested GitLab Swarm agent [${agentId}] is not registered or loaded.`,
      );
    }

    logger.info(
      `🦊 [GitLab Docs Gateway] Dispatching query to specialist agent: [${agentId}]`,
    );
    return await agentDef.instance.consult(query, []);
  }
}

export const gitlabDocsService = new GitlabDocsService();
export default gitlabDocsService;
