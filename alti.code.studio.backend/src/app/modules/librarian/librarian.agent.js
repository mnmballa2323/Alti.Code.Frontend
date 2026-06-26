/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Librarian" - Documentation & Knowledge Agent
 * Responsible for maintaining documentation, JSDoc comments, and knowledge indexing.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class LibrarianAgent {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Document a specific file (add JSDoc/TSDoc)
   * @param {string} filePath
   */
  async documentFile(filePath) {
    logger.info(`📚 Librarian: Documenting file ${filePath}...`);

    let content;
    try {
      content = await fs.readFile(
        path.resolve(this.projectRoot, filePath),
        'utf-8',
      );
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const prompt = `
        You are "The Librarian".
        TASK: Add comprehensive JSDoc/TSDoc comments to the following code.
        - Document classes, methods, and exported functions.
        - Add @param and @returns tags.
        - Do NOT change the logic, only add comments.
        - Return everything, including the original code + new comments.
        
        CODE:
        ${content}
        `;

    const response = await aiProvider.generate(prompt);
    const documentedCode = response
      .replace(/^```(javascript|js|ts)?|```$/g, '')
      .trim();

    // Overwrite file
    await fs.writeFile(
      path.resolve(this.projectRoot, filePath),
      documentedCode,
    );
    logger.info(`✅ Librarian: Updated ${filePath}`);
    return { filePath, status: 'Documented' };
  }

  /**
   * Update README for a directory
   * @param {string} dirPath
   */
  async updateReadme(dirPath) {
    logger.info(`📚 Librarian: Updating README for ${dirPath}...`);

    // Scan directory (simplified)
    const fullPath = path.resolve(this.projectRoot, dirPath);
    const files = await fs.readdir(fullPath);
    const fileNames = files.filter(f => !f.startsWith('.')).join(', ');

    const prompt = `
        You are "The Librarian".
        TASK: Write a README.md for this directory.
        path: ${dirPath}
        files: ${fileNames}
        
        Context: Identify the likely purpose of this module based on file names.
        Return ONLY the Markdown content.
        `;

    const response = await aiProvider.generate(prompt);
    const readmeContent = response.replace(/^```markdown|```$/g, '').trim();

    await fs.writeFile(path.join(fullPath, 'README.md'), readmeContent);
    logger.info(`✅ Librarian: Created README.md in ${dirPath}`);
    return { dirPath, status: 'README Updated' };
  }
}

export const librarianAgent = new LibrarianAgent();
