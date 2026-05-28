/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * AST Structural Query Language Evaluator
 * 
 * High-performance AST query parser and compiler.
 * Allows agents to declare structured queries in JSON (specifying node types,
 * target identifier names, parameter lists, or import paths) and evaluates
 * them against the Abstract Syntax Tree (AST) to filter matching nodes.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { AstSearchEngine } from './ast_search_engine.js';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

export class AstQueryEvaluator {
    /**
     * Evaluates a structured JSON query against target source code.
     * @param {string} sourceCode - Raw JavaScript or TypeScript code
     * @param {object} query - GritQL-inspired structural AST query
     * @returns {Array<object>} List of matching AST nodes with code range details
     */
    static evaluate(sourceCode, query) {
        const ast = AstSearchEngine.parse(sourceCode);
        const matches = [];

        traverse(ast, {
            enter(path) {
                // Check if current node type matches target type
                if (query.type && path.node.type !== query.type) {
                    return;
                }

                // Check identifier name matching (for functions, classes, variables)
                if (query.name) {
                    let nodeName = '';
                    if (path.node.id && path.node.id.type === 'Identifier') {
                        nodeName = path.node.id.name;
                    } else if (path.node.key && path.node.key.type === 'Identifier') {
                        nodeName = path.node.key.name;
                    }

                    if (nodeName !== query.name) {
                        return;
                    }
                }

                // Check parameter list constraints
                if (query.parameters) {
                    const params = path.node.params || [];
                    const paramNames = params.map(p => p.name || (p.left ? p.left.name : ''));
                    
                    const hasAllParams = query.parameters.every(p => paramNames.includes(p));
                    if (!hasAllParams) {
                        return;
                    }
                }

                // Check import source constraints (for ImportDeclaration)
                if (query.importSource) {
                    if (path.node.type === 'ImportDeclaration') {
                        if (path.node.source.value !== query.importSource) {
                            return;
                        }
                    } else {
                        return;
                    }
                }

                // Node passed all query constraints! Append to matches.
                const startLine = path.node.loc ? path.node.loc.start.line : null;
                const endLine = path.node.loc ? path.node.loc.end.line : null;

                matches.push({
                    type: path.node.type,
                    startLine,
                    endLine,
                    node: path.node
                });
            }
        });

        return matches;
    }
}
