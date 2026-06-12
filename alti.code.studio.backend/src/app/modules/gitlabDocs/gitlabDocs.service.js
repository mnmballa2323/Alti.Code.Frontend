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

    // If no preferred agent, automatically route using semantic pgvector search + LLM reranking
    if (!agentId) {
      try {
        const { vectorStoreService } = await import('../memory/vector.store.js');
        const { capabilityRouter } = await import('../agents/capability.router.js');

        // Make sure capability router index is ready
        if (!capabilityRouter.isIndexed) {
          await capabilityRouter.indexAgents();
        }

        logger.info(`🦊 [GitLab Docs Gateway] Querying pgvector database for candidate specialists...`);
        const searchResults = await vectorStoreService.search(query, 10);
        
        let gitlabCandidates = [];
        if (searchResults.documents && searchResults.documents[0] && searchResults.documents[0].length > 0) {
          const docs = searchResults.documents[0];
          const metadatas = searchResults.metadatas[0];
          const distances = searchResults.distances[0];

          for (let i = 0; i < docs.length; i++) {
            const meta = metadatas[i];
            if (meta && meta.agentId && meta.agentId.toLowerCase().startsWith('gitlab')) {
              gitlabCandidates.push({
                agentId: meta.agentId,
                document: docs[i],
                distance: distances[i]
              });
            }
          }
        }

        // 1. Vector Short-Circuit: If exceptionally close distance (< 0.15)
        if (gitlabCandidates.length > 0 && gitlabCandidates[0].distance < 0.15) {
          agentId = gitlabCandidates[0].agentId;
          logger.info(`🦊 [GitLab Docs Gateway] Vector Short-Circuit (Distance: ${gitlabCandidates[0].distance.toFixed(3)}) routed to: [${agentId}]`);
        } 
        
        // 2. LLM Reranker: If candidate list is found, consult LLM to select best GitLab agent
        else if (gitlabCandidates.length > 0) {
          logger.info(`🦊 [GitLab Docs Gateway] Reranking ${gitlabCandidates.length} candidate agents via Gemini...`);
          const candidateStrings = gitlabCandidates.map(c => `Agent: ${c.agentId}\n${c.document}`).join('\n\n');
          const prompt = `You are the dynamic router for Inso Code's GitLab swarm.
Analyze the user query and select the single best GitLab specialist agent from the candidates list.

USER QUERY: "${query}"

CANDIDATES:
${candidateStrings}

RULES:
- Return ONLY a JSON object: { "agentId": "agent_name_here" }
- If no candidate fits, return { "agentId": "NONE" }
- Return raw JSON only, no markdown.`;

          const { GoogleGenAiService } = await import('../googleGenAi/googleGenAi.service.js');
          const modelName = 'gemini-3.1-pro';
          const result = await GoogleGenAiService.generateContent(prompt, modelName, 0.2);
          const text = result.content || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const decision = JSON.parse(match[0]);
            if (decision.agentId && decision.agentId !== 'NONE' && agentRegistry.get(decision.agentId)) {
              agentId = decision.agentId;
              logger.info(`🦊 [GitLab Docs Gateway] Semantic reranker routed to: [${agentId}]`);
            }
          }
        }
      } catch (err) {
        logger.warn(`🦊 [GitLab Docs Gateway] Vector/LLM routing failed. Falling back to keyword rules. Error: ${err.message}`);
      }
    }

    // 3. Fallback Router: If no agent selected yet, use keyword matches or default agents
    if (!agentId) {
      const lowerQuery = query.toLowerCase();
      const allAgents = agentRegistry.list();

      let bestAgentId = null;
      let highestMatchScore = 0;

      for (const agent of allAgents) {
        if (agent.isPlugin && agent.name.startsWith('gitlab')) {
          let score = 0;

          if (agent.capabilities && agent.capabilities.length > 0) {
            for (const cap of agent.capabilities) {
              const capClean = cap.replace(/-/g, ' ');
              const words = capClean.split(' ').filter(w => w !== 'gitlab');
              const matchedWords = words.filter(word =>
                new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery),
              );
              if (matchedWords.length > 0) {
                const capScore = 10 * matchedWords.length;
                if (capScore > highestMatchScore) {
                  highestMatchScore = capScore;
                  bestAgentId = agent.name;
                }
              }
            }
          }

          const idClean = agent.name
            .replace(/gitlab/i, '')
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase();
          const idWords = idClean.split(' ').filter(w => w.trim().length > 0);
          const matchedIdWords = idWords.filter(word =>
            new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery),
          );
          if (matchedIdWords.length > 0) {
            score = 5 * matchedIdWords.length;
            if (score > highestMatchScore) {
              highestMatchScore = score;
              bestAgentId = agent.name;
            }
          }
        }
      }

      if (bestAgentId && highestMatchScore >= 5) {
        agentId = bestAgentId;
        logger.info(
          `🦊 [GitLab Docs Gateway] Keyword fallback match routed query to granular agent: [${agentId}] (Score: ${highestMatchScore})`,
        );
      } else {
        // Fallback groups
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
