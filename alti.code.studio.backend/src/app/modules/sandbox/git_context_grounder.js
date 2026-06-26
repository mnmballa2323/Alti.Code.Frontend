import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../../shared/logger.js';

const execAsync = promisify(exec);

export class GitContextGrounder {
  /**
   * Retrieves git blame and commit message context for a given file and line range.
   * @param {string} filePath - Absolute path to the file
   * @param {number} startLine - 1-indexed start line
   * @param {number} endLine - 1-indexed end line
   * @returns {Promise<string>} Grounding context block
   */
  static async getLineBlameContext(filePath, startLine, endLine) {
    if (!fs.existsSync(filePath)) {
      return '[Git Context] Target file does not exist.';
    }

    const relativePath = path.relative(process.cwd(), filePath);

    try {
      // Run git blame to fetch porcelain details
      // We use -L <start>,<end> to narrow the blame to the target symbol's line range
      const blameCmd = `git blame -L ${startLine},${endLine} --porcelain "${filePath}"`;
      const { stdout: blameOutput } = await execAsync(blameCmd, {
        cwd: process.cwd(),
      });

      if (!blameOutput.trim()) {
        return '[Git Context] No blame history found for this range.';
      }

      // Parse porcelain output
      const lines = blameOutput.split('\n');
      const commits = {};

      let currentHash = null;
      for (const line of lines) {
        const parts = line.split(' ');
        const firstWord = parts[0];

        if (firstWord.length === 40 && /^[0-9a-fA-F]+$/.test(firstWord)) {
          currentHash = firstWord.slice(0, 11); // Short commit hash
          if (!commits[currentHash]) {
            commits[currentHash] = { hash: currentHash, count: 0 };
          }
          commits[currentHash].count++;
        } else if (currentHash) {
          if (line.startsWith('author ')) {
            commits[currentHash].author = line.slice(7).trim();
          } else if (line.startsWith('author-time ')) {
            const timestamp = parseInt(line.slice(12).trim(), 10);
            commits[currentHash].date = new Date(timestamp * 1000)
              .toISOString()
              .split('T')[0];
          }
        }
      }

      // Sort commits by how many lines they affect in this range
      const sortedCommits = Object.values(commits).sort(
        (a, b) => b.count - a.count,
      );
      if (sortedCommits.length === 0) {
        return '[Git Context] No commit details could be parsed.';
      }

      // Get the commit messages for the top commits (max 3)
      let contextBlock = `[Git Context Grounding for ${relativePath} (Lines ${startLine}-${endLine})]\n`;

      for (const commit of sortedCommits.slice(0, 3)) {
        let commitMsg = 'Unknown commit message';
        try {
          const showCmd = `git show -s --format="%s" ${commit.hash}`;
          const { stdout: showOutput } = await execAsync(showCmd, {
            cwd: process.cwd(),
          });
          commitMsg = showOutput.trim();
        } catch (e) {
          logger.debug(
            `[Git Blame Grounder] Failed to run git show for ${commit.hash}: ${e.message}`,
          );
        }

        contextBlock += `- Commit: ${commit.hash} | Author: ${commit.author || 'Unknown'} | Date: ${commit.date || 'Unknown'} | Affects: ${commit.count} line(s)\n`;
        contextBlock += `  Message: "${commitMsg}"\n`;
      }

      return contextBlock;
    } catch (error) {
      logger.debug(
        `[Git Blame Grounder] Failed to fetch blame: ${error.message}`,
      );
      return `[Git Context] Blame tracking unavailable: ${error.message.includes('not a git repository') ? 'Not a git repository' : error.message}`;
    }
  }
}
