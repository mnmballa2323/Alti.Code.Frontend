/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

const SPECS_DIR = 'specs';

/**
 * Slugifies a string for use in a filename.
 * @param {string} str
 * @returns {string}
 */
const slugify = str =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/**
 * Returns a filesystem-safe ISO timestamp string, e.g. "2024-11-05-143022"
 * @returns {string}
 */
const isoTimestamp = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
};

class SpecAgent {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Drafting a technical specification.
   * Each call produces a unique timestamped file inside the `specs/` directory
   * so previous specifications are never overwritten.
   * @param {string} request - The user's feature request.
   * @returns {{ filename: string, filePath: string, content: string }}
   */
  async draft(request) {
    if (
      !request ||
      typeof request !== 'string' ||
      request.trim().length === 0
    ) {
      throw new Error('SpecAgent: request must be a non-empty string.');
    }
    logger.info(`📝 SpecAgent: Drafting specification for "${request}"...`);

    const prompt = `
        You are a Senior Technical Architect for this project.
        Draft a comprehensive technical specification for the following feature request:
        "${request}"

        The specification should be in Markdown format and include:
        1. **Overview**: High-level summary.
        2. **User Stories / Requirements**: What needs to be built.
        3. **Proposed Implementation**:
           - New files to create.
           - Existing files to modify.
           - Data models / DB Schema changes.
           - API endpoints.
        4. **Verification Plan**: How to test it.

        Return ONLY the markdown content.
        `;

    try {
      const result = await GeminiAiService.generateContent(prompt);
      const content = result.replace(/^```markdown|```$/g, '').trim();

      // Build a unique, descriptive filename so no two specs collide.
      const slug = slugify(request);
      const timestamp = isoTimestamp();
      const filename = `spec-${slug}-${timestamp}.md`;

      const specsDir = path.join(this.projectRoot, SPECS_DIR);
      await fs.mkdir(specsDir, { recursive: true });

      const filePath = path.join(specsDir, filename);
      await fs.writeFile(filePath, content);

      logger.info(`✅ SpecAgent: Specification saved to ${filePath}`);
      return { filename, filePath, content };
    } catch (error) {
      logger.error('SpecAgent: Failed to draft spec', error);
      throw error;
    }
  }
}

export const specAgent = new SpecAgent();
