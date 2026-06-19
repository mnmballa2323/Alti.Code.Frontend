/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default || traverseModule;
import { logger } from './logger.js';
import { astGrepService } from '../app/services/astGrep.service.js';
import { recastService } from '../app/services/recast.service.js';

class AstService {
    constructor() {
        logger.info('🌳 AST: AST service initialized with Babel, ast-grep, and Recast capability.');
    }

    /**
     * Parses source code into a Root AST node.
     * @param {string} sourceCode 
     * @returns {object} Babel AST
     */
    parse(sourceCode) {
        return parser.parse(sourceCode, {
            sourceType: "module",
            plugins: ["jsx", "typescript", "classProperties", "decorators-legacy"]
        });
    }

    /**
     * Extracts an exact function string using style-preserving Recast AST node printing.
     * @param {string} sourceCode The full file source code
     * @param {string} functionName The name of the function to extract
     * @returns {string|null} The raw string of the function block, or null if not found
     */
    extractFunction(sourceCode, functionName) {
        try {
            const ast = recastService.parse(sourceCode);
            let extractedFunc = null;

            traverse(ast, {
                FunctionDeclaration(path) {
                    if (path.node.id && path.node.id.name === functionName) {
                        extractedFunc = recastService.print(path.node);
                        path.stop();
                    }
                },
                VariableDeclarator(path) {
                    if (path.node.id && path.node.id.name === functionName &&
                        (path.node.init?.type === 'ArrowFunctionExpression' || path.node.init?.type === 'FunctionExpression')) {
                        // Extract parent variable declaration to get const/let/var details
                        extractedFunc = recastService.print(path.parentPath.node);
                        path.stop();
                    }
                },
                ClassMethod(path) {
                    if (path.node.key && path.node.key.name === functionName) {
                        extractedFunc = recastService.print(path.node);
                        path.stop();
                    }
                }
            });

            return extractedFunc;
        } catch (err) {
            logger.warn(`⚠️ [AST] Recast extraction failed: ${err.message}. Falling back to standard Babel.`, err);
            // Fallback to standard Babel extraction if Recast fails on syntax
            const ast = this.parse(sourceCode);
            let extractedFunc = null;
            traverse(ast, {
                FunctionDeclaration(path) {
                    if (path.node.id && path.node.id.name === functionName) {
                        extractedFunc = sourceCode.slice(path.node.start, path.node.end);
                        path.stop();
                    }
                },
                VariableDeclarator(path) {
                    if (path.node.id && path.node.id.name === functionName &&
                        (path.node.init?.type === 'ArrowFunctionExpression' || path.node.init?.type === 'FunctionExpression')) {
                        extractedFunc = sourceCode.slice(path.parentPath.node.start, path.parentPath.node.end);
                        path.stop();
                    }
                },
                ClassMethod(path) {
                    if (path.node.key && path.node.key.name === functionName) {
                        extractedFunc = sourceCode.slice(path.node.start, path.node.end);
                        path.stop();
                    }
                }
            });
            return extractedFunc;
        }
    }

    /**
     * Structural pattern query using ast-grep.
     * @param {string} sourceCode 
     * @param {string} pattern 
     * @param {string} [lang] 
     */
    grepSearch(sourceCode, pattern, lang = 'javascript') {
        return astGrepService.findAll(lang, sourceCode, pattern);
    }

    /**
     * Structural pattern rewrite using ast-grep.
     * @param {string} sourceCode 
     * @param {string} pattern 
     * @param {string} rewritePattern 
     * @param {string} [lang] 
     */
    grepRewrite(sourceCode, pattern, rewritePattern, lang = 'javascript') {
        return astGrepService.rewrite(lang, sourceCode, pattern, rewritePattern);
    }

    /**
     * Style-preserving function rename using Recast.
     * @param {string} sourceCode 
     * @param {string} oldName 
     * @param {string} newName 
     */
    recastRename(sourceCode, oldName, newName) {
        return recastService.renameFunction(sourceCode, oldName, newName);
    }

    /**
     * Recursively walks the AST to calculate Cyclomatic Complexity.
     * Focuses on structurally mathematical branch pathways.
     * @param {string} sourceCode 
     * @returns {number} The calculated complexity score
     */
    calculateComplexity(sourceCode) {
        const ast = this.parse(sourceCode);
        let complexity = 1; // Base case

        traverse(ast, {
            IfStatement() { complexity++; },
            ForStatement() { complexity++; },
            ForInStatement() { complexity++; },
            ForOfStatement() { complexity++; },
            WhileStatement() { complexity++; },
            DoWhileStatement() { complexity++; },
            CatchClause() { complexity++; },
            ConditionalExpression() { complexity++; }, // Ternary operator
            SwitchCase(path) {
                if (path.node.test !== null) { // Exclude 'default'
                    complexity++;
                }
            },
            LogicalExpression(path) {
                if (['&&', '||', '??'].includes(path.node.operator)) {
                    complexity++;
                }
            }
        });

        return complexity;
    }
}

export const astService = new AstService();
