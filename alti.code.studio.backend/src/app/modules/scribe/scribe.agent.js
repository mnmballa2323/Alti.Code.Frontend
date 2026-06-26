/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Scribe" - Automated Documentation Agent
 * Responsible for generating JSDoc, updating Wiki pages, and maintaining technical documentation.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class ScribeAgent {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs', 'wiki');
  }

  /**
   * Generate JSDoc for a specific file
   * @param {string} code
   * @param {string} filename
   */
  async documentCode(code, filename) {
    logger.info(`✍️ Scribe: Documenting ${filename}...`);

    const prompt = `
        You are "The Scribe", a Technical Writer.
        TASK: Add comprehensive JSDoc comments to this code.
        Include @param, @returns, and brief descriptions for functions/classes.
        Do NOT change the code logic, only add comments.
        
        CODE:
        ${code}

        OUTPUT ONLY the commented code.
        `;

    const response = await aiProvider.generate(prompt);
    const documentedCode = response
      .replace(/^```(javascript|js)?|```$/g, '')
      .trim();

    return {
      originalLength: code.length,
      documentedLength: documentedCode.length,
      code: documentedCode,
    };
  }

  /**
   * Update a Wiki page based on recent changes or context
   * @param {string} topic e.g. 'API Authentication'
   * @param {string} context Recent code changes or features
   */
  async updateWiki(topic, context) {
    logger.info(`✍️ Scribe: Updating Wiki for ${topic}...`);
    await fs.mkdir(this.docsDir, { recursive: true });

    const prompt = `
        You are "The Scribe".
        TASK: Write or Update a technical Wiki page about "${topic}".
        Use this context: ${context}
        
        Format: Markdown.
        `;

    const response = await aiProvider.generate(prompt);
    const content = response.replace(/^```(markdown|md)?|```$/g, '').trim();

    const filename = `${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = path.join(this.docsDir, filename);
    await fs.writeFile(filePath, content);

    return { topic, filePath, status: 'updated' };
  }

  /**
   * Generate a quick README snippet for a module
   * @param {string} moduleName
   */
  async generateReadmeSnippet(moduleName) {
    // Simple helper
    const prompt = `Write a 2-sentence description for a module named ${moduleName}`;
    const desc = await aiProvider.generate(prompt);
    return `# ${moduleName}\n\n${desc}`;
  }
}

export const scribeAgent = new ScribeAgent();
