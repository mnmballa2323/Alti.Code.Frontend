import { Project, ScriptTarget, SyntaxKind } from 'ts-morph';
import { logger } from '../../../shared/logger.js';

class DryScannerService {
    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ESNext,
                allowJs: true,
            }
        });
    }

    /**
     * Scans multiple files to detect duplicate or highly similar function implementations.
     *
     * @param {Array<Object>} filesData - List of files: [{ path: string, content: string }]
     * @param {number} minLines - Minimum lines of a function to be considered for scanning
     * @returns {Array<Object>} List of duplicate groups/pairs found
     */
    scanDuplicates(filesData, minLines = 3) {
        logger.info(`🔍 DRY Scanner: Auditing ${filesData.length} files for code duplication.`);
        const functions = [];

        try {
            for (const file of filesData) {
                const sourceFile = this.project.createSourceFile(file.path, file.content, { overwrite: true });

                // Find all functions and methods
                const declarations = [];
                
                // Add function declarations
                declarations.push(...sourceFile.getFunctions());
                
                // Add arrow functions or function expressions assigned to variables
                sourceFile.forEachDescendant(node => {
                    const kind = node.getKind();
                    if (kind === SyntaxKind.FunctionExpression || kind === SyntaxKind.ArrowFunction) {
                        declarations.push(node);
                    }
                    if (kind === SyntaxKind.MethodDeclaration) {
                        declarations.push(node);
                    }
                });

                for (const node of declarations) {
                    const startLine = node.getStartLineNumber();
                    const endLine = node.getEndLineNumber();
                    const lineCount = endLine - startLine + 1;

                    if (lineCount < minLines) continue;

                    let name = 'anonymous';
                    if (typeof node.getName === 'function') {
                        name = node.getName() || 'anonymous';
                    } else {
                        // Check if parent is a variable declaration
                        const parent = node.getParent();
                        if (parent && parent.getKind() === SyntaxKind.VariableDeclaration) {
                            name = parent.getName() || 'anonymous';
                        }
                    }

                    const rawText = node.getText();
                    const bodyText = typeof node.getBody === 'function' ? node.getBody()?.getText() || rawText : rawText;

                    functions.push({
                        filePath: file.path,
                        functionName: name,
                        startLine,
                        endLine,
                        lineCount,
                        rawText,
                        normalizedTokens: this._tokenizeAndNormalize(bodyText)
                    });
                }

                this.project.removeSourceFile(sourceFile);
            }
        } catch (e) {
            logger.error('DRY Scanner: Parsing failed.', e);
        }

        const duplicates = [];

        // Compare functions pairwise
        for (let i = 0; i < functions.length; i++) {
            for (let j = i + 1; j < functions.length; j++) {
                const fnA = functions[i];
                const fnB = functions[j];

                // Skip comparing functions in the exact same location
                if (fnA.filePath === fnB.filePath && fnA.startLine === fnB.startLine) {
                    continue;
                }

                const similarity = this._computeSimilarity(fnA.normalizedTokens, fnB.normalizedTokens);

                if (similarity >= 0.8) {
                    duplicates.push({
                        similarity,
                        functionA: {
                            filePath: fnA.filePath,
                            name: fnA.functionName,
                            lines: `${fnA.startLine}-${fnA.endLine}`
                        },
                        functionB: {
                            filePath: fnB.filePath,
                            name: fnB.functionName,
                            lines: `${fnB.startLine}-${fnB.endLine}`
                        }
                    });
                }
            }
        }

        logger.info(`🔍 DRY Scanner: Audit complete. Found ${duplicates.length} duplicate patterns.`);
        return duplicates;
    }

    _tokenizeAndNormalize(text) {
        // Strip comments
        const noComments = text
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');

        // Tokenize by words and symbols, normalize identifiers to lower-case
        const tokens = noComments
            .toLowerCase()
            .match(/[a-z0-9_]+/g) || [];

        return tokens;
    }

    _computeSimilarity(tokensA, tokensB) {
        if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
        if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

        const setA = new Set(tokensA);
        const setB = new Set(tokensB);

        let intersection = 0;
        for (const token of setA) {
            if (setB.has(token)) {
                intersection++;
            }
        }

        const union = setA.size + setB.size - intersection;
        return intersection / union;
    }
}

export const dryScannerService = new DryScannerService();
