/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { TSDocParser, ParserContext } from '@microsoft/tsdoc';
import { logger } from '../../shared/logger.js';

class TSDocParserService {
  constructor() {
    this.parser = new TSDocParser();
  }

  /**
   * Helper to recursively extract plain text from TSDoc AST nodes.
   * @param {Object} node TSDoc AST Node
   * @returns {string} Extracted text
   */
  _extractText(node) {
    if (!node) return '';
    if (node.text) return node.text;
    
    // Some nodes (like DocSoftBreak) represent spacing
    if (node.kind === 'SoftBreak') return '\n';
    
    if (node.nodes && node.nodes.length > 0) {
      return node.nodes.map(n => this._extractText(n)).join('');
    }
    return '';
  }

  /**
   * Parses a raw comment block string (including /** and * symbols).
   * @param {string} commentString The raw comment block text
   * @returns {Object} Structured data containing tags, summary, and parameters
   */
  parseComment(commentString) {
    if (!commentString || typeof commentString !== 'string') {
      return { summary: '', params: [], returns: '', tags: [] };
    }

    try {
      const parserContext = this.parser.parseString(commentString);
      const docComment = parserContext.docComment;

      let summary = '';
      const params = [];
      let returns = '';
      const tags = [];

      // Extract Summary
      if (docComment.summarySection) {
        summary = this._extractText(docComment.summarySection).trim();
      }

      // Extract Block Tags (@param)
      if (docComment.params && docComment.params.blocks) {
        for (const param of docComment.params.blocks) {
          const paramName = param.parameterName || '';
          const paramDesc = param.content ? this._extractText(param.content).trim() : '';
          params.push({
            name: paramName,
            description: paramDesc
          });
        }
      }

      // Extract returns
      if (docComment.returnsBlock && docComment.returnsBlock.content) {
        returns = this._extractText(docComment.returnsBlock.content).trim();
      }

      // Extract custom modifiers/tags
      if (docComment.modifierTagSet && docComment.modifierTagSet.nodes) {
        for (const tag of docComment.modifierTagSet.nodes) {
          if (tag.tagName) {
            tags.push(tag.tagName);
          }
        }
      }

      return {
        summary,
        params,
        returns,
        tags
      };
    } catch (error) {
      logger.error('❌ [TSDocParserService] Comment parsing failed:', error.message);
      return { summary: '', params: [], returns: '', tags: [], error: error.message };
    }
  }
}

export const tsdocParserService = new TSDocParserService();
export default tsdocParserService;
