/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as recast from 'recast';
import * as babelParser from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default || traverseModule;
import { logger } from '../../shared/logger.js';

class RecastService {
  constructor() {
    // Parser options to parse modern JS, TS, JSX, etc.
    this.parserOptions = {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'decorators-legacy',
        'objectRestSpread',
        'dynamicImport'
      ]
    };

    // Custom recast parser using babel
    this.recastParser = {
      parse: (source) => {
        return babelParser.parse(source, this.parserOptions);
      }
    };
  }

  /**
   * Parse code into an AST using Recast (remembers exact formatting tokens).
   * @param {string} sourceCode 
   * @returns {object} AST
   */
  parse(sourceCode) {
    logger.info('🔮 [Recast] Parsing source code with style tracking...');
    return recast.parse(sourceCode, { parser: this.recastParser });
  }

  /**
   * Print modified AST back to code while preserving unmodified code style.
   * @param {object} ast 
   * @returns {string} Formatted code
   */
  print(ast) {
    logger.info('🔮 [Recast] Generating style-preserved code from AST...');
    const result = recast.print(ast);
    return result.code;
  }

  /**
   * Parse, traverse/modify, and print.
   * @param {string} sourceCode 
   * @param {object} visitors - Babel traverse visitor definitions
   * @returns {string} Trandformed code
   */
  transform(sourceCode, visitors) {
    const ast = this.parse(sourceCode);
    
    // traverse the AST using Babel's traverse
    traverse(ast, visitors);
    
    return this.print(ast);
  }

  /**
   * Helper to perform a simple function rename.
   * @param {string} sourceCode 
   * @param {string} oldName 
   * @param {string} newName 
   * @returns {string} Transformed code
   */
  renameFunction(sourceCode, oldName, newName) {
    logger.info(`🔮 [Recast] Renaming function: "${oldName}" -> "${newName}"`);
    return this.transform(sourceCode, {
      Identifier(path) {
        if (path.node.name === oldName && (
          path.parent.type === 'FunctionDeclaration' ||
          path.parent.type === 'ClassMethod' ||
          path.parent.type === 'VariableDeclarator'
        )) {
          path.node.name = newName;
        }
      }
    });
  }
}

export const recastService = new RecastService();
