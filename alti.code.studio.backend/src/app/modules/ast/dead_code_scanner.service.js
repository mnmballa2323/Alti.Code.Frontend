import { Project, ScriptTarget, SyntaxKind } from 'ts-morph';
import { logger } from '../../../shared/logger.js';

class DeadCodeScannerService {
    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ESNext,
                allowJs: true,
            }
        });
    }

    /**
     * Scans a JS/TS source code block and finds unreferenced variables, imports, or local functions.
     * @param {string} codeContent - Raw JS/TS source code
     * @returns {Array} List of dead code issues found ({ name: string, kind: string, line: number })
     */
    scanDeadCode(codeContent) {
        if (!codeContent) return [];

        const deadSymbols = [];

        try {
            const sourceFile = this.project.createSourceFile('temp_dead_code_eval.js', codeContent, { overwrite: true });

            // Helper to verify if a symbol name is unused in the file context
            const isUnused = (name, refs) => {
                if (refs.length > 1) return false;
                const matches = sourceFile.getFullText().match(new RegExp(`\\b${name}\\b`, 'g'));
                return !matches || matches.length <= 1;
            };

            // 1. Audit Named Imports
            const importDeclarations = sourceFile.getImportDeclarations();
            for (const dec of importDeclarations) {
                const namedImports = dec.getNamedImports();
                for (const named of namedImports) {
                    const name = named.getName();
                    const refs = named.getNameNode().findReferencesAsNodes();
                    
                    if (isUnused(name, refs)) {
                        deadSymbols.push({
                            name,
                            kind: 'Unused Import',
                            line: named.getStartLineNumber()
                        });
                    }
                }

                // Check default import
                const defaultImport = dec.getDefaultImport();
                if (defaultImport) {
                    const name = defaultImport.getText();
                    const refs = defaultImport.findReferencesAsNodes();
                    if (isUnused(name, refs)) {
                        deadSymbols.push({
                            name,
                            kind: 'Unused Import',
                            line: defaultImport.getStartLineNumber()
                        });
                    }
                }
            }

            // 2. Audit Unreferenced Local Variables
            sourceFile.forEachDescendant(node => {
                const kind = node.getKind();

                if (kind === SyntaxKind.VariableDeclaration) {
                    const nameNode = node.getNameNode();
                    if (nameNode.getKind() === SyntaxKind.Identifier) {
                        const name = nameNode.getText();
                        const refs = nameNode.findReferencesAsNodes();

                        if (isUnused(name, refs)) {
                            // Verify it is not exported
                            const variableStatement = node.getVariableStatement();
                            const isExported = variableStatement ? variableStatement.isExported() : false;
                            
                            if (!isExported) {
                                deadSymbols.push({
                                    name,
                                    kind: 'Unused Variable',
                                    line: node.getStartLineNumber()
                                });
                            }
                        }
                    }
                }
            });

            // Clean up temporary source file
            this.project.removeSourceFile(sourceFile);
        } catch (e) {
            logger.error('DeadCodeScanner: Failed to scan code for dead symbols.', e);
        }

        logger.info(`🔍 DeadCodeScanner: Identified ${deadSymbols.length} unused or dead symbols in code.`);
        return deadSymbols;
    }
}

export const deadCodeScannerService = new DeadCodeScannerService();
