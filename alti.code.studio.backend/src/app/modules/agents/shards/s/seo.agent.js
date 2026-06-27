// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class SeoAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SEO_Expert';
    this.description =
      'Growth specialist enforcing Technical SEO audits, structured data generation, and metadata tags.';

    this.preamble = `You are an elite Technical SEO optimization specialist.
Your core expertise revolves around rendering websites discoverable, indexable, and rich in structured data.

# CORE RESPONSIBILITIES
1. Always advocate for JSON-LD Structured Data. Provide explicit schemas (e.g., \`Organization\`, \`Article\`, \`Product\`, \`FAQPage\`) relevant to the component you are auditing.
2. Ensure strict Open Graph (\`og:title\`, \`og:image\`) and Twitter Card metadata tags are present in any \`<head>\` or Next.js \`metadata\` exports.
3. Prioritize Core Web Vitals. Specifically call out Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) optimizations (e.g., explicit width/height on images).
4. For Next.js/React applications: Recommend Server-Side Rendering (SSR) or Static Site Generation (SSG) to ensure search crawler indexability over pure Client-Side logic.

# REAL-TIME SEO TOOLS (OpenSEO)
If the user asks for real-time search engine optimization data (like live Google keyword volumes, competitor backlinks, search rankings, or audit metrics), you must use the OpenSEO MCP server tools.
To invoke an OpenSEO tool, output exactly:
\`\`\`json
{
  "__MCP_CALL__": {
    "tool": "tool_name",
    "params": { ... }
  }
}
\`\`\`
The tools available on the OpenSEO MCP server are:
- "keyword_ideas": params: { "keyword": "target term string" } - Generate keyword opportunities and metrics.
- "serp_analysis": params: { "keyword": "string", "location": "optional country string" } - Inspect Google search engine results.
- "competitor_insights": params: { "domain": "domain string" } - Analyze domain backlinks and ranking stats.
- "search_console_performance": params: { "site_url": "url string" } - Analyze striking-distance ranking queries.

# BEHAVIOR
When auditing code or providing blueprints, provide pure HTML snippets or Next.js \`generateMetadata\` configurations. Do not provide generic marketing advice; provide concrete, programmatic SEO implementations.
`;
  }

  /**
   * Executes an SEO syntactic review or schema generation.
   * @param {string} prompt
   * @param {Array<object>} contextData Project files or AST snippets
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`📈 SEO Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let chatHistory = [];
    let iterations = 0;
    const maxIterations = 3;

    let currentPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    while (iterations < maxIterations) {
      iterations++;
      logger.info(`📈 SEO Expert: Invoking Gemini iteration ${iterations}/${maxIterations}...`);
      
      const response = await GeminiAiService.generateContent(
        chatHistory.length > 0 
          ? `${currentPrompt}\n\n=== TOOL EXECUTION HISTORY ===\n${chatHistory.join('\n')}\n\nContinue execution.`
          : currentPrompt
      );

      // Check if response contains a tool call block
      const jsonMatch = response.match(/\{[\s\S]*"__MCP_CALL__"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const callData = parsed.__MCP_CALL__;
          if (callData && callData.tool) {
            logger.info(`🔌 SEO Expert: Intercepted tool call to "${callData.tool}"`);
            
            // Execute the tool dynamically via the MCP Gateway
            const { mcpGateway } = await import('../../mcp/mcp_gateway.service.js');
            
            let toolResult;
            try {
              toolResult = await mcpGateway.executeToolWithContext(
                'open_seo',
                callData.tool,
                callData.params || {}
              );
            } catch (err) {
              toolResult = { error: `Failed to execute tool ${callData.tool}: ${err.message}` };
            }

            logger.info(`🔌 SEO Expert: Tool execution completed successfully.`);
            chatHistory.push(`Tool Call: ${JSON.stringify(callData)}\nResult: ${JSON.stringify(toolResult)}`);
            continue; // Go to next iteration to let Gemini consume the tool output
          }
        } catch (parseErr) {
          logger.warn(`⚠️ SEO Expert: Failed to parse tool call JSON block: ${parseErr.message}`);
        }
      }

      // No tool calls requested, return the final text
      return response;
    }

    // Fallback if max iterations exceeded
    return `Max execution loop limit reached. Try narrowing down the request.`;
  }
}

export const seoAgent = Object.freeze(new SeoAgent());
export default seoAgent;
