/**
 * Copyright (c) 2024 Inso Code
 *
 * The Historian (ADR Service)
 * Manages Architectural Decision Records.
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class ADRService {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs', 'adr');
  }

  async init() {
    await fs.mkdir(this.docsDir, { recursive: true });
  }

  /**
   * Create a new Architectural Decision Record
   * @param {string} title - e.g. "Use Redis for Caching"
   * @param {string} status - "Proposed", "Accepted", "Deprecated"
   * @param {string} context - The problem statement
   * @param {string} decision - The solution choice
   * @param {string} consequences - Pros and Cons
   */
  async createADR(title, status, context, decision, consequences) {
    await this.init();

    // Calculate next ID
    const files = await fs.readdir(this.docsDir);
    const nextId = String(files.length + 1).padStart(3, '0');
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${nextId}-${safeTitle}.md`;
    const filePath = path.join(this.docsDir, filename);

    const content = `
# ${nextId}. ${title}

Date: ${new Date().toISOString().split('T')[0]}

## Status
${status}

## Context
${context}

## Decision
${decision}

## Consequences
${consequences}
        `;

    await fs.writeFile(filePath, content.trim());
    logger.info(`📜 ADR Created: ${filename}`);
    return { filename, filePath };
  }

  async listADRs() {
    await this.init();
    const files = await fs.readdir(this.docsDir);
    return files.filter(f => f.endsWith('.md')).sort();
  }
}

export const adrService = new ADRService();
