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

class AstService {
    constructor() {
        logger.info('🌳 AST: Babel parser initialized for profound codebase traversal.');
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
     * Extracts an exact function string using AST syntax nodes, guaranteeing perfect bracket integrity.
     * @param {string} sourceCode The full file source code
     * @param {string} functionName The name of the function to extract
     * @returns {string|null} The raw string of the function block, or null if not found
     */
    extractFunction(sourceCode, functionName) {
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

                    // Slice the entire parent declaration (e.g., const foo = () => {})
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
