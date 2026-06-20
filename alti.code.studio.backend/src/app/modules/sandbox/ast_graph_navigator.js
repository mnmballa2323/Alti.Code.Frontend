import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../../shared/logger.js';

export class AstGraphNavigator {
    /**
     * Parses a JS/TS file to build a map of its symbol definitions (classes, functions, methods).
     * @param {string} filePath - Absolute path to the file
     * @returns {object} Graph structure mapping symbol names to their line locations and contents
     */
    static buildGraph(filePath) {
        if (!fs.existsSync(filePath)) {
            logger.warn(`[AST Graph Navigator] File not found: ${filePath}`);
            return { symbols: {} };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const symbols = {};

        // Match patterns for class, function, and method definitions
        const classRegex = /(?:export\s+)?class\s+(\w+)/;
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/;
        const methodRegex = /^(?:\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/;
        const arrowFuncRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;

        let currentClass = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            // 1. Detect Class
            const classMatch = classRegex.exec(line);
            if (classMatch) {
                currentClass = classMatch[1];
                symbols[currentClass] = {
                    name: currentClass,
                    type: 'class',
                    startLine: lineNum,
                    endLine: lineNum, // Updated below
                    methods: []
                };
                continue;
            }

            // 2. Detect Function
            const funcMatch = functionRegex.exec(line);
            if (funcMatch) {
                const name = funcMatch[1];
                symbols[name] = {
                    name,
                    type: 'function',
                    startLine: lineNum,
                    endLine: lineNum
                };
                continue;
            }

            // 3. Detect Arrow Function
            const arrowMatch = arrowFuncRegex.exec(line);
            if (arrowMatch) {
                const name = arrowMatch[1];
                symbols[name] = {
                    name,
                    type: 'arrow_function',
                    startLine: lineNum,
                    endLine: lineNum
                };
                continue;
            }

            // 4. Detect Method inside Class
            const methodMatch = methodRegex.exec(line);
            if (methodMatch && currentClass) {
                const name = methodMatch[1];
                if (name !== 'if' && name !== 'for' && name !== 'while' && name !== 'switch') {
                    const key = `${currentClass}.${name}`;
                    symbols[key] = {
                        name,
                        type: 'method',
                        parentClass: currentClass,
                        startLine: lineNum,
                        endLine: lineNum
                    };
                    symbols[currentClass].methods.push(name);
                }
            }
        }

        // Determine symbol end lines by matching brackets
        const symbolKeys = Object.keys(symbols);
        for (const key of symbolKeys) {
            const sym = symbols[key];
            sym.endLine = this._findClosingBracketLine(lines, sym.startLine);
        }

        return { symbols };
    }

    /**
     * Extracts only the specified symbol's definition and its JSDoc comments to prune context size.
     * @param {string} filePath - Absolute path to file
     * @param {string} symbolName - e.g., 'DatabaseSync' or 'CodeExecutionSandbox.execute'
     * @returns {string} The pruned code snippet
     */
    static pruneFile(filePath, symbolName) {
        if (!fs.existsSync(filePath)) return '';

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const graph = this.buildGraph(filePath);
        const sym = graph.symbols[symbolName];

        if (!sym) {
            logger.debug(`[AST Graph Navigator] Symbol [${symbolName}] not found in ${filePath}. Returning raw file.`);
            return content;
        }

        // Include any JSDoc/comments immediately preceding the symbol start line
        let commentStart = sym.startLine - 1;
        while (commentStart > 0) {
            const prevLine = lines[commentStart - 1].trim();
            if (prevLine.startsWith('/**') || prevLine.startsWith('*') || prevLine.startsWith('*/') || prevLine.startsWith('//')) {
                commentStart--;
            } else {
                break;
            }
        }

        const prunedLines = lines.slice(commentStart, sym.endLine);
        return prunedLines.join('\n');
    }

    /**
     * Helper to locate the closing brace of a code block.
     */
    static _findClosingBracketLine(lines, startLine) {
        let openBrackets = 0;
        let foundBracket = false;

        for (let i = startLine - 1; i < lines.length; i++) {
            const line = lines[i];

            for (let char of line) {
                if (char === '{') {
                    openBrackets++;
                    foundBracket = true;
                } else if (char === '}') {
                    openBrackets--;
                }
            }

            if (foundBracket && openBrackets <= 0) {
                return i + 1; // 1-indexed line number
            }
        }

        return lines.length; // Fallback to EOF
    }
}
