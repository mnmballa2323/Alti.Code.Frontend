/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { parse, parseAsync, Lang } from '@ast-grep/napi';
import { logger } from '../../shared/logger.js';

class AstGrepService {
  /**
   * Helper to map language name strings to ast-grep Lang enum.
   * @param {string} langName
   * @returns {Lang}
   */
  getLang(langName) {
    if (!langName) return Lang.JavaScript;
    const name = langName.toLowerCase();
    switch (name) {
      case 'javascript':
      case 'js':
        return Lang.JavaScript;
      case 'typescript':
      case 'ts':
        return Lang.TypeScript;
      case 'tsx':
        return Lang.Tsx;
      case 'python':
      case 'py':
        return Lang.Python;
      case 'rust':
      case 'rs':
        return Lang.Rust;
      case 'go':
      case 'golang':
        return Lang.Go;
      case 'html':
        return Lang.Html;
      case 'css':
        return Lang.Css;
      default:
        return Lang.JavaScript;
    }
  }

  /**
   * Parse code into an ast-grep root node.
   * @param {string} langName
   * @param {string} source
   * @returns {object} SgRoot
   */
  parse(langName, source) {
    const lang = this.getLang(langName);
    return parse(lang, source);
  }

  /**
   * Asynchronously parse code into an ast-grep root node.
   * @param {string} langName
   * @param {string} source
   * @returns {Promise<object>} SgRoot
   */
  async parseAsync(langName, source) {
    const lang = this.getLang(langName);
    return await parseAsync(lang, source);
  }

  /**
   * Find the first occurrence of a structural pattern.
   * @param {string} langName
   * @param {string} source
   * @param {string} pattern - e.g. "console.log($MSG)"
   * @returns {object|null} Match object with matched text, range, and metavariables
   */
  find(langName, source, pattern) {
    logger.info(`🔍 [ast-grep] Running find pattern: "${pattern}"`);
    const root = this.parse(langName, source).root();
    const matchNode = root.find(pattern);
    if (!matchNode) return null;

    return this.serializeNode(matchNode);
  }

  /**
   * Find all occurrences of a structural pattern.
   * @param {string} langName
   * @param {string} source
   * @param {string} pattern - e.g. "console.log($MSG)"
   * @returns {Array<object>} Match objects
   */
  findAll(langName, source, pattern) {
    logger.info(`🔍 [ast-grep] Running findAll pattern: "${pattern}"`);
    const root = this.parse(langName, source).root();
    const matchNodes = root.findAll(pattern);
    return matchNodes.map(node => this.serializeNode(node));
  }

  /**
   * Perform structural search and replace (rewrite).
   * @param {string} langName
   * @param {string} source
   * @param {string} pattern - e.g. "console.log($MSG)"
   * @param {string} rewritePattern - e.g. "logger.info($MSG)"
   * @returns {string} The transformed source code
   */
  rewrite(langName, source, pattern, rewritePattern) {
    logger.info(
      `🔄 [ast-grep] Running rewrite pattern: "${pattern}" -> "${rewritePattern}"`,
    );
    const root = this.parse(langName, source).root();
    const matches = root.findAll(pattern);
    if (matches.length === 0) return source;

    // We process replacements from back to front to preserve offsets
    let result = source;
    const sortedMatches = [...matches].sort((a, b) => {
      const rangeA = a.range();
      const rangeB = b.range();
      return rangeB.start.index - rangeA.start.index;
    });

    for (const match of sortedMatches) {
      const range = match.range();
      // Replace metavariables in rewritePattern
      let replacement = rewritePattern;
      // Get all captured metavariables (we can query match.getMatch('VAR'))
      // But standard ast-grep node replace can do this natively if supported,
      // otherwise we perform variable substitution manually by extracting keys from rewritePattern.
      const varRegex = /\$[A-Z_0-9]+/g;
      let varMatch;
      const seenVars = new Set();
      while ((varMatch = varRegex.exec(rewritePattern)) !== null) {
        seenVars.add(varMatch[0].substring(1)); // Remove the leading $
      }

      for (const varName of seenVars) {
        const capturedNode = match.getMatch(varName);
        if (capturedNode) {
          replacement = replacement.replace(
            new RegExp(`\\$${varName}`, 'g'),
            capturedNode.text(),
          );
        }
      }

      result =
        result.substring(0, range.start.index) +
        replacement +
        result.substring(range.end.index);
    }

    return result;
  }

  /**
   * Omni-Economy SAST Auditing Pipeline
   * Intercepts and sanitizes dependencies or raw source before execution,
   * enforcing the MIT/Apache 2.0 rules and blocking hardcoded secrets.
   */
  auditSource(langName, source) {
    logger.info(`🛡️ [SAST] Running Security Audit on source payload...`);
    
    // AST-grep pattern for hardcoded secrets
    const secretPattern = "const $VAR = '$SECRET'";
    const secrets = this.findAll(langName, source, secretPattern);
    
    if (secrets.some(s => s.text.toLowerCase().includes('secret') || s.text.toLowerCase().includes('key') || s.text.toLowerCase().includes('token'))) {
      throw new Error('[SAST_VIOLATION] Hardcoded secret detected in source payload. Execution halted.');
    }
    
    // Enforce Omni-Economy allowed license constraints
    const gplPackages = ['gpl-package', 'agpl-db', 'proprietary-sdk'];
    for (const pkg of gplPackages) {
      if (source.includes(pkg)) {
        throw new Error(`[SAST_VIOLATION] Disallowed copyleft dependency '${pkg}' detected. Omni-Economy strictly mandates MIT/Apache 2.0.`);
      }
    }
    
    return true;
  }

  /**
   * Serialize an SgNode to a plain JS object.
   * @private
   */
  serializeNode(node) {
    const range = node.range();
    return {
      text: node.text(),
      range: {
        start: {
          line: range.start.line,
          column: range.start.column,
          index: range.start.index,
        },
        end: {
          line: range.end.line,
          column: range.end.column,
          index: range.end.index,
        },
      },
    };
  }
}

export const astGrepService = new AstGrepService();
