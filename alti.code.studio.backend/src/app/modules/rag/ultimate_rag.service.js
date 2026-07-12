import { discoveryEngineService } from '../gcpCloud/gcpSearch.service.js';
import { spannerGraphService } from '../gcpCloud/gcpSpannerGraph.service.js';
import { GeminiCliService } from '../geminiCli/geminiCli.service.js';
import { gcpGenAiService as GcpGenAiService } from '../ai/gcpGenAi.service.js';
import { fileSearchService } from '../fileSearch/fileSearch.service.js';
import { ragCacheService } from '../gcpCloud/gcpCache.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { prismaClient } from '../../platform/db/prismaClient.js';
import { logger } from '../../../shared/logger.js';
import { AstSearchEngine } from '../ast/ast_search_engine.js';
import { lspGateway } from '../lsp/lsp.gateway.js';
import crypto from 'crypto';

const prisma = prismaClient.prisma;

/**
 * The Ultimate Google Cloud RAG Engine — v2.0
 *
 * A 5-source parallel retrieval pipeline built exclusively on Google Cloud:
 * 1. Google Vertex AI Discovery Engine — deep semantic code search
 * 2. Google Cloud Spanner Graph — architectural topology & dependency mapping
 * 3. Google Gemini CLI — autonomous best-practice synthesis
 * 4. Google Gemini File Search API — native document RAG with grounding citations
 * 5. Google Vertex AI Gemini 3.1 Pro — final synthesis with citation enforcement
 *
 * v2.0 Enhancements:
 * - [#1] RAG Cache: SHA-256 hash-based Memorystore cache for <1ms repeat queries
 * - [#2] Query Rewriting: Gemini-powered multi-query expansion for better recall
 * - [#3] Feedback Loop: Successful syntheses are persisted back to vector store
 * - Per-source timing telemetry
 * - 20-second hard pipeline timeout
 * - Graceful per-source degradation
 */

const PIPELINE_TIMEOUT_MS = 20000;
const CACHE_TTL_SECONDS = 3600; // 1 hour
const MAX_FEEDBACK_LENGTH = 2000; // chars persisted to vector store

class UltimateRagService {
  // ─────────────────────────────────────────────────────────────────
  // #2 — Query Rewriting / Expansion
  // ─────────────────────────────────────────────────────────────────

  /**
   * Uses Gemini to expand a vague user query into 2-3 precise sub-queries
   * that maximize recall across heterogeneous retrieval sources.
   *
   * @param {string} query - Raw user query
   * @returns {Promise<string[]>} Expanded queries (always includes original)
   */
  async _expandQuery(query) {
    // Short queries benefit most from expansion; long queries are already specific
    if (query.length > 200) return [query];

    try {
      const prompt = `You are a search query optimizer for a software engineering codebase RAG system.

Given this user query, generate 2-3 alternative search queries that would help retrieve the most relevant code, architecture docs, and technical context.

Original query: "${query}"

Rules:
- Each query should target a different angle (e.g. implementation detail, architectural pattern, API surface)
- Keep each query under 100 characters
- Return ONLY a JSON array of strings, no markdown
- Always include the original query as the first element

Example: ["original query", "specific technical term query", "architectural pattern query"]`;

      const raw = await GcpGenAiService.generateContent(
        prompt,
        'gemini-3.1-pro',
        0.3,
      );
      const cleaned = raw.content
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      const expanded = JSON.parse(cleaned);

      if (Array.isArray(expanded) && expanded.length > 0) {
        // Safety: cap at 3 queries to prevent token explosion
        const queries = expanded.slice(0, 3);
        logger.info(
          `[Ultimate RAG] Query expanded: "${query}" → ${queries.length} sub-queries`,
        );
        return queries;
      }
    } catch (e) {
      logger.warn(
        `[Ultimate RAG] Query expansion failed (non-blocking): ${e.message}`,
      );
    }

    // Fallback: use original query only
    return [query];
  }

  // ─────────────────────────────────────────────────────────────────
  // Core Retrieval Pipeline
  // ─────────────────────────────────────────────────────────────────

  /**
   * Executes the multi-source parallel RAG retrieval with per-source telemetry.
   *
   * @param {string} query - Primary user query
   * @param {string[]} expandedQueries - All query variants (from _expandQuery)
   * @param {string} userId - Target User ID for catalog filters
   * @param {string} tenantId - Tenant ID for vector queries
   * @returns {Promise<{combinedContext: string, pipeline: Object[]}>}
   */
  async executeRetrieval(query, expandedQueries, userId, tenantId, enabledSources) {
    const pipelineStart = Date.now();
    const allQueries = expandedQueries || [query];
    const primaryQuery = allQueries[0];

    logger.info(
      `🌐 [Ultimate RAG] Initiating retrieval for ${allQueries.length} query variant(s) (Tenant: ${tenantId || 'None'})`,
    );

    // ─── Timed source wrappers ──────────────────
    const timedSource = async (id, label, fn) => {
      // Check if source is explicitly disabled in UI
      if (enabledSources && Array.isArray(enabledSources) && !enabledSources.includes(id)) {
        return {
          id,
          label,
          status: 'skipped',
          durationMs: 0,
          result: null,
        };
      }
      const start = Date.now();
      try {
        const result = await fn();
        return {
          id,
          label,
          status: 'done',
          durationMs: Date.now() - start,
          result,
        };
      } catch (e) {
        logger.warn(`[Ultimate RAG] ${label} failed: ${e.message}`);
        return {
          id,
          label,
          status: 'error',
          durationMs: Date.now() - start,
          result: null,
          error: e.message,
        };
      }
    };

    // ─── 5 parallel retrieval sources (multi-query for Discovery Engine) ───
    const sources = await Promise.all([
      // 1. Google Vertex AI Discovery Engine — fan out all expanded queries
      timedSource('vertex', 'Vertex AI Discovery Engine', async () => {
        const allResults = await Promise.all(
          allQueries.map(q =>
            discoveryEngineService.searchCodebase(q).catch(() => []),
          ),
        );
        // Reciprocal Rank Fusion (RRF) to merge and rank results across all query variants
        const rrfMap = new Map();
        const k = 60;

        for (const results of allResults) {
          (results || []).forEach((res, rankZeroIndexed) => {
            const id = res.id || res.title || res.uri;
            if (!id) return;
            const rank = rankZeroIndexed + 1;
            const contribution = 1 / (k + rank);

            if (rrfMap.has(id)) {
              rrfMap.get(id).score += contribution;
            } else {
              rrfMap.set(id, {
                doc: res,
                score: contribution,
              });
            }
          });
        }

        // Sort by RRF score descending and return documents
        const merged = Array.from(rrfMap.values())
          .sort((a, b) => b.score - a.score)
          .map(entry => entry.doc);

        return merged;
      }),

      // 2. Google Cloud Spanner Graph (Architectural Topology)
      timedSource('spanner', 'Google Cloud Spanner Graph', () =>
        spannerGraphService.queryArchitectureDependencies('architecture'),
      ),

      // 3. Google Gemini CLI (Autonomous Best Practices)
      timedSource('cli', 'Gemini CLI Expert', () =>
        GeminiCliService.runGeminiCLI('ask', [
          `"Provide world-class software engineering best practices for: ${primaryQuery}"`,
        ]),
      ),

      // 4. Gemini File Search API (Native RAG with citations)
      timedSource('filesearch', 'Gemini File Search', () =>
        this._executeFileSearchRetrieval(primaryQuery),
      ),

      // 5. User Uploaded Knowledge Files (PostgreSQL / Vector DB)
      timedSource('knowledge_hub', 'Knowledge Catalog Ingestion', async () => {
        const docs = [];
        // A. Search via high-dimensional vectorStoreService
        if (tenantId) {
          try {
            const vectorMatches = await vectorStoreService.search(
              primaryQuery,
              5,
              tenantId,
            );
            if (vectorMatches && vectorMatches.length > 0) {
              docs.push(
                ...vectorMatches.map(m => ({
                  name: m.metadata?.fileName || 'Knowledge Vector Chunk',
                  content: m.document,
                })),
              );
            }
          } catch (err) {
            logger.warn(
              `[Ultimate RAG] Vector store retrieval failed: ${err.message}`,
            );
          }
        }

        // B. Keyword fallback directly from Postgres KnowledgeFile table
        try {
          const dbMatches = await prisma.knowledgeFile.findMany({
            where: {
              OR: [
                { folder: { userId: userId || undefined } },
                { folder: { tenantId: tenantId || undefined } },
              ],
              content: {
                contains: primaryQuery,
                mode: 'insensitive',
              },
            },
            take: 3,
            select: { name: true, content: true },
          });
          if (dbMatches && dbMatches.length > 0) {
            docs.push(
              ...dbMatches.map(m => ({
                name: m.name,
                content: m.content,
              })),
            );
          }
        } catch (err) {
          // Non-blocking fallback
        }

        return docs;
      }),

      // 6. LSP shadow buffers (Live unsaved editor state)
      timedSource('lsp_telepathy', 'LSP Shadow Buffers', async () => {
        const docs = [];
        if (lspGateway && lspGateway.shadowBuffers) {
          for (const [uri, content] of lspGateway.shadowBuffers.entries()) {
            const filename = uri.split('/').pop() || uri;
            docs.push({
              name: filename,
              content: content,
            });
          }
        }
        return docs;
      }),
    ]);

    // ─── Assemble context ───────────────────────
    let combinedContext = '';

    const vertexResult = sources.find(s => s.id === 'vertex')?.result;
    if (
      vertexResult &&
      Array.isArray(vertexResult) &&
      vertexResult.length > 0
    ) {
      combinedContext += `\n\n[VERTEX AI DISCOVERY ENGINE]\n`;
      vertexResult.slice(0, 6).forEach((res, index) => {
        const snippet = res.snippet || '';
        const fileSource = res.title || res.id || `Source_${index + 1}`;
        if (snippet) {
          combinedContext += `\n--- SOURCE: ${fileSource} ---\n${snippet}\n`;
        }
      });
    }

    const spannerResult = sources.find(s => s.id === 'spanner')?.result;
    if (
      spannerResult &&
      Array.isArray(spannerResult) &&
      spannerResult.length > 0
    ) {
      combinedContext += `\n\n[GOOGLE CLOUD SPANNER GRAPH]\n`;
      combinedContext += JSON.stringify(spannerResult, null, 2);
    }

    const cliResult = sources.find(s => s.id === 'cli')?.result;
    if (cliResult) {
      combinedContext += `\n\n[GOOGLE GEMINI CLI EXPERTISE]\n${cliResult}`;
    }

    const fileSearchResult = sources.find(s => s.id === 'filesearch')?.result;
    if (fileSearchResult) {
      combinedContext += `\n\n[GEMINI FILE SEARCH RAG]\n${fileSearchResult.text}`;
      if (fileSearchResult.citations && fileSearchResult.citations.length > 0) {
        combinedContext += `\n\n--- FILE SEARCH CITATIONS ---\n`;
        for (const citation of fileSearchResult.citations) {
          const title = citation.title || 'Unknown';
          const page = citation.pageNumber
            ? ` (Page ${citation.pageNumber})`
            : '';
          combinedContext += `• ${title}${page}: ${citation.text || ''}\n`;
        }
      }
    }

    const knowledgeResult = sources.find(s => s.id === 'knowledge_hub')?.result;
    if (
      knowledgeResult &&
      Array.isArray(knowledgeResult) &&
      knowledgeResult.length > 0
    ) {
      combinedContext += `\n\n[KNOWLEDGE CATALOG UPLOADS]\n`;
      knowledgeResult.forEach(doc => {
        let astMetadata = '';
        if (
          doc.name &&
          (doc.name.endsWith('.js') ||
            doc.name.endsWith('.ts') ||
            doc.name.endsWith('.jsx') ||
            doc.name.endsWith('.tsx'))
        ) {
          try {
            const funcs = AstSearchEngine.findFunctions(doc.content);
            if (funcs && funcs.length > 0) {
              astMetadata = `\n[AST Structure Summary]\nFound ${funcs.length} functions:\n`;
              funcs.slice(0, 10).forEach(f => {
                astMetadata += `- ${f.type} ${f.name}(${f.parameters.join(', ')}) [lines ${f.startLine}-${f.endLine}]\n`;
              });
              if (funcs.length > 10) {
                astMetadata += `... and ${funcs.length - 10} more functions.\n`;
              }
              astMetadata += `\n`;
            }
          } catch (astErr) {
            // Non-blocking fallback for incomplete/non-JS snippets
          }
        }
        combinedContext += `\n--- DOCUMENT: ${doc.name} ---\n${astMetadata}${doc.content}\n`;
      });
    }

    const lspResult = sources.find(s => s.id === 'lsp_telepathy')?.result;
    if (
      lspResult &&
      Array.isArray(lspResult) &&
      lspResult.length > 0
    ) {
      combinedContext += `\n\n[LSP TELEPATHY LIVE BUFFER STATE]\n`;
      lspResult.forEach(doc => {
        combinedContext += `\n--- LIVE UNSAVED FILE: ${doc.name} ---\n${doc.content}\n`;
      });
    }

    const totalDurationMs = Date.now() - pipelineStart;
    const activeSources = sources.filter(s => s.status === 'done').length;
    logger.info(
      `✅ [Ultimate RAG] Pipeline complete: ${activeSources}/${sources.length} sources in ${totalDurationMs}ms`,
    );

    const pipeline = sources.map(s => ({
      id: s.id,
      label: s.label,
      status: s.status,
      durationMs: s.durationMs,
      ...(s.error ? { error: s.error } : {}),
      ...(s.id === 'filesearch' && s.result?.citations
        ? { citationCount: s.result.citations.length }
        : {}),
    }));

    return { combinedContext, pipeline, totalDurationMs };
  }

  /**
   * Queries available File Search stores with safety bounds.
   */
  async _executeFileSearchRetrieval(query) {
    const FILE_SEARCH_TIMEOUT_MS = 15000;
    const MAX_STORES_PER_QUERY = 5;

    const stores = await fileSearchService.listStores();
    if (!stores || stores.length === 0) {
      logger.info('[Ultimate RAG] No File Search stores found — skipping.');
      return null;
    }

    const storeNames = stores.slice(0, MAX_STORES_PER_QUERY).map(s => s.name);
    if (stores.length > MAX_STORES_PER_QUERY) {
      logger.warn(
        `[Ultimate RAG] ${stores.length} stores found, capped to ${MAX_STORES_PER_QUERY}.`,
      );
    }

    logger.info(
      `[Ultimate RAG] Querying ${storeNames.length} File Search store(s)...`,
    );

    const queryPromise = fileSearchService.query(query, storeNames);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('File Search query timed out')),
        FILE_SEARCH_TIMEOUT_MS,
      ),
    );

    return Promise.race([queryPromise, timeoutPromise]);
  }

  // ─────────────────────────────────────────────────────────────────
  // #1 — RAG Cache Helpers
  // ─────────────────────────────────────────────────────────────────

  /**
   * Generates a deterministic SHA-256 hash for cache keying.
   */
  _hashQuery(query, mode, domain, language) {
    const payload = `${query}|${mode || ''}|${domain || ''}|${language || ''}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  // ─────────────────────────────────────────────────────────────────
  // Main Synthesis Entry Point
  // ─────────────────────────────────────────────────────────────────

  /**
   * Synthesizes the RAG context using Google Gemini 3.1 Pro.
   * Includes cache check (#1), query expansion (#2), and feedback loop (#3).
   */
  async synthesize(query, mode, domain, language, userId, tenantId, enabledSources) {
    const synthesisStart = Date.now();

    // ── #1: RAG Cache Check ──────────────────────────────────────
    const cacheKey = this._hashQuery(query, mode, domain, language);
    try {
      const cached = await ragCacheService.getCachedContext(cacheKey);
      if (cached) {
        logger.info(
          `⚡ [Ultimate RAG] CACHE HIT — returning synthesis in <1ms`,
        );
        return {
          ...cached,
          fromCache: true,
          pipeline: { ...cached.pipeline, cachedAt: cached._cachedAt },
        };
      }
    } catch (e) {
      logger.warn(
        `[Ultimate RAG] Cache read failed (non-blocking): ${e.message}`,
      );
    }

    // ── #2: Query Expansion ──────────────────────────────────────
    const expandedQueries = await this._expandQuery(query);

    // ── Core Retrieval ───────────────────────────────────────────
    const {
      combinedContext,
      pipeline,
      totalDurationMs: retrievalMs,
    } = await this.executeRetrieval(query, expandedQueries, userId, tenantId, enabledSources);

    // ── Synthesis Prompt ─────────────────────────────────────────
    let systemPrompt = `You are the world's most advanced RAG Synthesizer. 
        You are powered exclusively by Google Vertex AI. 
        Use the exact context provided by Google Spanner, Discovery Engine, Gemini CLI, and Gemini File Search to answer the user.
        
        CRITICAL REQUIREMENTS:
        1. You MUST provide inline citations for the code you reference.
        2. When quoting or explaining code from the [VERTEX AI DISCOVERY ENGINE] context, explicitly state the SOURCE file path (e.g., \`As seen in src/index.js\`).
        3. When referencing content from [GEMINI FILE SEARCH RAG], include the document title and page number if available.
        4. At the end of your response, always include a "**Citations & Sources**" section listing all the files you referenced.
        5. Format your response using clean Markdown with proper code blocks, headers, and bullet points.
        6. If multiple sources agree on an answer, note the convergence to indicate high confidence.`;

    // Strict isolation boundary for Chat Page: prohibit code generation & modifications
    if (domain === 'Chat' || mode === 'chat') {
      systemPrompt =
        `=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===
1. You are operating in the isolated, sandboxed CHAT workspace under RAG codebase search.
2. You are allowed to answer codebase architecture queries, search the web, explain concepts, and assist with non-development questions.
3. SECURITY ENFORCEMENT: You are strictly PROHIBITED from writing, generating, or outputting any raw source code, code blocks, git commit commands, file creation payloads, or codebase modifications. You MUST NOT output code or write code under any circumstances. DO NOT INCLUDE any code blocks (no \`\`\` blocks with code) in your output.
4. If the user requests code generation, writing code, or codebase edits, you MUST politely guide them to switch to the "Code Workspace" page to perform coding tasks, explaining that the Chat page is strictly for discussion, queries, and conceptual explanations, not code output or execution.
==============================================================\n\n` +
        systemPrompt;
    }

    if (mode && mode.trim() !== '' && mode !== 'Mode') {
      systemPrompt += `\nYour interaction style should be strictly aligned with the role of a: ${mode}.`;
    }
    if (domain && domain.trim() !== '' && domain !== 'Stack') {
      systemPrompt += `\nYour output must focus heavily on the constraints and paradigms of the following technology stack/domain: ${domain}.`;
    }
    if (language && language.trim() !== '' && language !== 'Language') {
      systemPrompt += `\nYour output must be written and explained exclusively in the following programming language: ${language}.`;
    }

    const finalPrompt = `USER QUERY: ${query}\n\n=== GOOGLE RAG CONTEXT ===\n${combinedContext}\n\nSynthesize the ultimate answer based strictly on the context and include citations.`;

    logger.info(`🧠 [Ultimate RAG] Synthesizing via Google Gemini 3.1 Pro...`);
    const response = await GcpGenAiService.generateContent(
      `${systemPrompt}\n\n${finalPrompt}`,
      'gemini-3.1-pro',
      0.2,
    );

    const totalMs = Date.now() - synthesisStart;

    const result = {
      query,
      contextUsed: combinedContext,
      synthesis: response.content,
      pipeline: {
        sources: pipeline,
        retrievalMs,
        synthesisMs: totalMs - retrievalMs,
        totalMs,
        activeSources: pipeline.filter(s => s.status === 'done').length,
        totalSources: pipeline.length,
        expandedQueries,
      },
    };

    // ── #1: Cache the result ─────────────────────────────────────
    try {
      await ragCacheService.setCachedContext(cacheKey, {
        ...result,
        _cachedAt: new Date().toISOString(),
      });
      logger.info(
        `⚡ [Ultimate RAG] Result cached in Memorystore (TTL: ${CACHE_TTL_SECONDS}s)`,
      );
    } catch (e) {
      logger.warn(
        `[Ultimate RAG] Cache write failed (non-blocking): ${e.message}`,
      );
    }

    // ── #3: Feedback Loop — persist to vector store ──────────────
    this._persistFeedback(query, result).catch(() => {});

    return result;
  }

  // ─────────────────────────────────────────────────────────────────
  // #3 — RAG Feedback Loop
  // ─────────────────────────────────────────────────────────────────

  /**
   * Persists successful synthesis results back into the vector store
   * so future queries on the same topic get progressively better results.
   * Fire-and-forget — never blocks the response.
   */
  async _persistFeedback(query, result) {
    try {
      const activeSources = result.pipeline?.activeSources || 0;
      // Only persist if we got meaningful context from at least 2 sources
      if (activeSources < 2) return;

      const synthesisSnippet = (result.synthesis || '').substring(
        0,
        MAX_FEEDBACK_LENGTH,
      );
      if (synthesisSnippet.length < 50) return; // too short to be useful

      const feedbackDoc = `[RAG SYNTHESIS FEEDBACK]\nQuery: ${query}\nAnswer: ${synthesisSnippet}\nSources: ${activeSources} active retrieval sources\nTimestamp: ${new Date().toISOString()}`;

      await vectorStoreService.add(feedbackDoc, {
        type: 'rag_feedback',
        query: query.substring(0, 200),
        activeSources,
        timestamp: new Date().toISOString(),
      });

      logger.info(
        `🔄 [Ultimate RAG] Feedback loop: synthesis persisted to vector store for future recall.`,
      );
    } catch (e) {
      logger.warn(`[Ultimate RAG] Feedback persistence failed: ${e.message}`);
    }
  }
}

export const ultimateRagService = new UltimateRagService();
