/**
 * Copyright (c) 2024 Inso Code
 *
 * oss.agent.factory.js — OSS Agent Synthesizer
 *
 * Given a TrendingRepo object, synthesizes a complete, production-quality
 * specialist agent file that knows deeply about that specific open-source repo.
 *
 * Pipeline:
 *   1. Fetch README from GitHub (for real technical context)
 *   2. LLM generates a complete agent JS file with repo-specific preamble
 *   3. Guardian vets the generated code
 *   4. Written to agents/oss/{slug-safe}.agent.js
 *   5. Hot-loaded into CapabilityRouter via swarm:agent_hotload event
 *   6. Persisted to OssAgentRegistry
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { guardianAgent } from '../agents/guardian.agent.js';
import { swarmBus } from '../agents/self_expanding_swarm.service.js';
import { ossAgentRegistry } from './oss.agent.registry.js';
import { gitHubTrendingService } from './github.trending.service.js';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const OSS_AGENTS_DIR = path.join(process.cwd(), 'src/app/modules/agents/oss');

export class OssAgentFactory {
  constructor() {
    this.name = 'OssAgentFactory';
    /** Track creation timestamps per slug for cooldown */
    this._recentCreations = new Map();
    /** How many agents can be created in one cron run */
    this.batchCap = Number(process.env.OSS_BATCH_CAP ?? 50);
    logger.info('🏭 OssAgentFactory: Initialized. Batch cap =', this.batchCap);
  }

  /**
   * Create an OSS specialist agent for the given trending repo.
   * Main entry point — called by the scheduler or on-demand API.
   *
   * @param {import('./github.trending.service.js').TrendingRepo} repo
   * @returns {Promise<{ agentId: string, status: string, filePath?: string, registered?: boolean }>}
   */
  async createAgentForRepo(repo) {
    const agentId = crypto.randomUUID().slice(0, 8);

    // Dedup check
    if (ossAgentRegistry.has(repo.slug)) {
      logger.info(
        `🏭 OssFactory [${agentId}]: Agent for ${repo.slug} already exists — skipping`,
      );
      return { agentId, status: 'exists', slug: repo.slug };
    }

    logger.info(
      `🏭 OssFactory [${agentId}]: Synthesizing agent for ${repo.slug} (${repo.stars?.toLocaleString()} ⭐)…`,
    );
    swarmBus.emit('oss:agent_synthesis_started', {
      agentId,
      slug: repo.slug,
      stars: repo.stars,
    });

    try {
      // Step 1: Fetch README for real technical context
      const readme = await gitHubTrendingService.fetchReadme(repo.slug);

      // Step 2: Generate keywords (repo name, owner, language, topics)
      const keywords = this._generateKeywords(repo);

      // Step 3: Synthesize agent code via LLM
      const agentName = this._toAgentName(repo.slug);
      const exportName = agentName.charAt(0).toLowerCase() + agentName.slice(1);
      const agentCode = await this._synthesizeOssAgentCode(
        repo,
        readme,
        agentName,
        exportName,
        keywords,
      );

      // Step 4: Guardian safety review
      const guardianResult = await guardianAgent.interceptExecution(
        `OSS Agent Synthesis for ${repo.slug}\nCode preview: ${agentCode.substring(0, 400)}`,
        'OSS_AGENT_SYNTHESIS',
      );

      if (!guardianResult.isSafeToExecute) {
        logger.warn(
          `🛡️ OssFactory: Guardian BLOCKED ${repo.slug}: ${guardianResult.vetoReason}`,
        );
        swarmBus.emit('oss:agent_blocked', {
          agentId,
          slug: repo.slug,
          reason: guardianResult.vetoReason,
        });
        return {
          agentId,
          status: 'blocked',
          reason: guardianResult.vetoReason,
        };
      }

      // Step 5: Write to disk
      await fs.mkdir(OSS_AGENTS_DIR, { recursive: true });
      const fileName = `${this._toSlugSafe(repo.slug)}.agent.js`;
      const filePath = path.join(OSS_AGENTS_DIR, fileName);
      await fs.writeFile(filePath, agentCode, 'utf8');
      logger.info(`📝 OssFactory [${agentId}]: Written → ${filePath}`);
      swarmBus.emit('oss:agent_written', {
        agentId,
        slug: repo.slug,
        filePath,
      });

      // Step 6: Hot-load into CapabilityRouter
      const registered = await this._hotLoad(filePath, agentName, keywords);

      // Step 7: Persist to registry
      const record = {
        slug: repo.slug,
        fullName: repo.fullName,
        name: repo.name,
        owner: repo.owner,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        url: repo.url,
        topics: repo.topics || [],
        agentName,
        exportName,
        filePath,
        keywords,
        createdAt: new Date().toISOString(),
        trending: true,
        registered,
      };
      await ossAgentRegistry.add(record);

      swarmBus.emit('oss:agent_created', {
        agentId,
        slug: repo.slug,
        agentName,
        registered,
        keywords,
      });
      logger.info(
        `✅ OssFactory [${agentId}]: ${agentName} created for ${repo.slug} (registered=${registered})`,
      );

      return {
        agentId,
        status: 'created',
        slug: repo.slug,
        agentName,
        filePath,
        registered,
        keywords,
      };
    } catch (error) {
      logger.error(
        `❌ OssFactory [${agentId}]: Failed for ${repo.slug} —`,
        error.message,
      );
      swarmBus.emit('oss:agent_failed', {
        agentId,
        slug: repo.slug,
        error: error.message,
      });
      return {
        agentId,
        status: 'failed',
        slug: repo.slug,
        error: error.message,
      };
    }
  }

  /**
   * Process a batch of repos sequentially (to respect Gemini rate limits).
   * @param {import('./github.trending.service.js').TrendingRepo[]} repos
   * @param {number} [cap] - max to process in this batch
   * @returns {Promise<Object[]>}
   */
  async createBatch(repos, cap = this.batchCap) {
    const toProcess = repos.slice(0, cap);
    const results = [];
    logger.info(
      `🏭 OssFactory: Starting batch of ${toProcess.length} repos (cap=${cap})`,
    );
    swarmBus.emit('oss:batch_started', { count: toProcess.length });

    for (const repo of toProcess) {
      const result = await this.createAgentForRepo(repo);
      results.push(result);
      // Small delay between syntheses to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    const created = results.filter(r => r.status === 'created').length;
    const skipped = results.filter(r => r.status === 'exists').length;
    logger.info(
      `🏭 OssFactory: Batch done — created=${created}, skipped=${skipped}, failed=${results.length - created - skipped}`,
    );
    swarmBus.emit('oss:batch_done', {
      created,
      skipped,
      total: results.length,
    });

    return results;
  }

  // ── Private: LLM Synthesis ────────────────────────────────────────────────

  async _synthesizeOssAgentCode(repo, readme, agentName, exportName, keywords) {
    const repoDisplay = repo.fullName.replace('/', ' / ');
    const readmeSection = readme
      ? `\nREPOSITORY README EXCERPT:\n${readme}\n`
      : '\n(No README available — use your knowledge of this repository)\n';

    const prompt =
      `You are synthesizing a specialist AI agent for the open-source repository "${repo.fullName}".

REPOSITORY INFO:
- Full Name: ${repo.fullName}
- Description: ${repo.description || 'N/A'}
- Language: ${repo.language || 'Unknown'}
- Stars: ${repo.stars?.toLocaleString() || 'N/A'}
- URL: ${repo.url}
- Topics: ${(repo.topics || []).join(', ') || 'N/A'}
- Keywords this agent will route: ${keywords.join(', ')}
${readmeSection}
Generate a COMPLETE, production-ready JavaScript ES module for an Inso Code specialist agent.

Use EXACTLY this structure (fill in all [PLACEHOLDERS] with real, accurate content):

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

/**
 * ${agentName} — ${repoDisplay} OSS Specialist
 * Auto-generated by OssAgentFactory v7.7.0
 * Repository: ${repo.url}
 * Stars: ${repo.stars?.toLocaleString() || 'N/A'} | Language: ${repo.language || 'Unknown'}
 */
class ${agentName} extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = '${agentName}';
        this.description = '[WRITE: One sentence describing what this repo does and what questions this agent answers]';
        this.repoUrl = '${repo.url}';
        this.repoSlug = '${repo.slug}';

        this.preamble = \`
[WRITE: 50-80 lines of dense, technically accurate reference material about this specific repository. Must include:
1. OVERVIEW: What the repo is, what problem it solves, key philosophy
2. INSTALLATION: Exact install command(s)
3. CORE CONCEPTS: The 5-8 most important concepts/abstractions in this repo
4. KEY APIs / CLI COMMANDS: Real method names, parameters, example usage
5. COMMON PATTERNS: The 3-5 most common real-world use cases with code examples
6. CONFIGURATION: Key config options with types and defaults
7. INTEGRATION PATTERNS: How this commonly integrates with other tools
8. GOTCHAS & BEST PRACTICES: Common mistakes and how to avoid them
9. RESOURCES: Docs URL, GitHub Discussions, Discord/Slack if applicable

Be specific to ${repo.fullName} — not generic. Use real API names from the README.]\`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = \`\${this.preamble}\\n\\n=== USER CONTEXT ===\\n\${contextBlock}\\n\\n=== ${repoDisplay.toUpperCase()} QUESTION ===\\n\${prompt}\`;
        return GeminiAiService.generateContent(finalPrompt);
    }

    /**
     * Generate a getting-started guide or integration example for this repo.
     * @param {string} useCase - e.g. 'REST API', 'authentication', 'testing'
     */
    async generateExample(useCase) {
        const prompt = \`Generate a concise, copy-pasteable ${repo.name} example for: \${useCase}\\n\${this.preamble}\`;
        return GeminiAiService.generateContent(prompt);
    }

    /**
     * Debug a specific error or problem with this repo.
     * @param {string} errorMessage
     * @param {string} context
     */
    async debugIssue(errorMessage, context = '') {
        const prompt = \`Debug this ${repo.name} error:\\nError: \${errorMessage}\\nContext: \${context}\\n\${this.preamble}\`;
        return GeminiAiService.generateContent(prompt);
    }
}

export const ${exportName} = new ${agentName}();

RULES:
- Fill in ALL [PLACEHOLDERS] with real, accurate content specific to ${repo.fullName}
- The preamble must be 50-80 lines of dense, repo-specific technical knowledge
- Use REAL API method names, CLI commands, and config options from the README
- Return ONLY the JavaScript code — no markdown fences, no comments outside the code
- No TODO comments — everything must be implemented`.trim();

    return GeminiAiService.generateContent(prompt);
  }

  // ── Private: Keyword generation ───────────────────────────────────────────

  /**
   * Generate 12-15 routing keywords from repo metadata.
   * @param {import('./github.trending.service.js').TrendingRepo} repo
   * @returns {string[]}
   */
  _generateKeywords(repo) {
    const words = new Set();

    // Repo name variants
    const name = repo.name.toLowerCase();
    words.add(name);
    words.add(name.replace(/[.-]/g, ' ').trim());
    words.add(name.replace(/[.-]/g, ''));

    // Owner/org
    words.add(repo.owner.toLowerCase());

    // Full slug variants
    words.add(repo.slug.toLowerCase());
    words.add(repo.slug.replace('/', ' ').toLowerCase());

    // Language
    if (repo.language) words.add(repo.language.toLowerCase());

    // Topics (up to 5)
    if (repo.topics) {
      for (const t of repo.topics.slice(0, 5)) {
        words.add(t.toLowerCase().replace(/-/g, ' '));
      }
    }

    // Description words (meaningful ones, length > 4)
    if (repo.description) {
      const descWords = repo.description
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(
          w =>
            w.length > 4 &&
            ![
              'their',
              'about',
              'using',
              'with',
              'from',
              'that',
              'this',
              'have',
              'will',
            ].includes(w),
        );
      for (const w of descWords.slice(0, 4)) words.add(w);
    }

    // Remove empty strings
    words.delete('');
    return [...words].slice(0, 15);
  }

  // ── Private: Hot-load into CapabilityRouter ───────────────────────────────

  async _hotLoad(filePath, agentName, keywords) {
    try {
      const fileUrl = pathToFileURL(filePath).href + `?v=${Date.now()}`;
      const agentModule = await import(/* @vite-ignore */ fileUrl);
      const agentInstance = Object.values(agentModule).find(
        v => v && typeof v === 'object' && typeof v.consult === 'function',
      );
      if (!agentInstance) {
        logger.warn(`🏭 OssFactory: No agent instance in ${filePath}`);
        return false;
      }
      swarmBus.emit('swarm:agent_hotload', { agentInstance, keywords });
      logger.info(
        `🔌 OssFactory: Hot-loaded ${agentName} with ${keywords.length} keywords`,
      );
      return true;
    } catch (err) {
      logger.error(
        `🏭 OssFactory: Hot-load failed for ${agentName}: ${err.message}`,
      );
      return false;
    }
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  /** Convert 'facebook/react' → 'FacebookReact_Oss_Agent' */
  _toAgentName(slug) {
    return (
      slug
        .split('/')
        .map(part =>
          part
            .split(/[-_.]/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(''),
        )
        .join('') + '_Oss_Agent'
    );
  }

  /** Convert 'facebook/react' → 'facebook__react' (safe for filenames) */
  _toSlugSafe(slug) {
    return slug
      .replace('/', '__')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .toLowerCase();
  }
}

export const ossAgentFactory = new OssAgentFactory();
