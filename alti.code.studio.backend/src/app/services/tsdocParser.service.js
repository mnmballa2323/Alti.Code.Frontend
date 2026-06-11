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

      const summaryLines = [];
      const params = [];
      let returns = '';
      const tags = [];

      // Extract Summary
      if (docComment.summarySection) {
        // TSDoc node traversal to extract summary text
        const nodes = docComment.summarySection.nodes;
        for (const node of nodes) {
          if (node.nodes) {
            for (const child of node.nodes) {
              if (child.text) {
                summaryLines.push(child.text);
              }
            }
          }
        }
      }

      // Extract Block Tags (@param, @returns, etc)
      if (docComment.params && docComment.params.blocks) {
        for (const param of docComment.params.blocks) {
          const paramName = param.parameterName || '';
          const paramDesc = [];
          if (param.description && param.description.nodes) {
            for (const n of param.description.nodes) {
              if (n.nodes) {
                for (const c of n.nodes) {
                  if (c.text) paramDesc.push(c.text);
                }
              }
            }
          }
          params.push({
            name: paramName,
            description: paramDesc.join(' ').trim()
          });
        }
      }

      // Extract returns
      if (docComment.returnsBlock) {
        const returnsDesc = [];
        if (docComment.returnsBlock.description && docComment.returnsBlock.description.nodes) {
          for (const n of docComment.returnsBlock.description.nodes) {
            if (n.nodes) {
              for (const c of n.nodes) {
                if (c.text) returnsDesc.push(c.text);
              }
            }
          }
        }
        returns = returnsDesc.join(' ').trim();
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
        summary: summaryLines.join(' ').trim(),
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
