import { Project, ScriptTarget, SyntaxKind } from 'ts-morph';
import { logger } from '../../../shared/logger.js';
import path from 'path';

class AstGraphService {
    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ESNext,
                allowJs: true,
            }
        });
        this.isGraphBuilt = false;
        // Map of symbol -> array of { file, line, text }
        this.callersMap = new Map();
        // Map of symbol -> { file, line, kind }
        this.definitionsMap = new Map();
        // Map of className -> { extendsClass: string, subclasses: string[] }
        this.inheritanceMap = new Map();
    }

    /**
     * Scans and parses files in the directory to build the code graph.
     * @param {string} directoryPath - Directory to analyze recursively.
     */
    buildGraph(directoryPath) {
        logger.info(`🔍 AST Graph: Building graph for directory: ${directoryPath}`);
        
        try {
            this.project.addSourceFilesAtPaths([
                path.join(directoryPath, '**/*.js'),
                path.join(directoryPath, '**/*.ts')
            ]);
        } catch (e) {
            logger.warn('AST Graph: Error adding path files, project might be preloaded.', e);
        }

        const sourceFiles = this.project.getSourceFiles();
        logger.info(`🔍 AST Graph: Parsing ${sourceFiles.length} source files.`);

        // Clear existing maps
        this.callersMap.clear();
        this.definitionsMap.clear();
        this.inheritanceMap.clear();

        for (const sourceFile of sourceFiles) {
            const filePath = sourceFile.getFilePath();

            // 1. Scan Definitions (functions, classes, methods)
            sourceFile.forEachDescendant(node => {
                const kind = node.getKind();

                // Class Declaration
                if (kind === SyntaxKind.ClassDeclaration) {
                    const name = node.getName();
                    if (name) {
                        const line = node.getStartLineNumber();
                        this.definitionsMap.set(name, { file: filePath, line, kind: 'Class' });

                        const baseClassNode = node.getBaseClass();
                        if (baseClassNode) {
                            const extendsName = baseClassNode.getName();
                            if (extendsName) {
                                // Update inheritance map
                                const currentClassRecord = this.inheritanceMap.get(name) || { extendsClass: null, subclasses: [] };
                                currentClassRecord.extendsClass = extendsName;
                                this.inheritanceMap.set(name, currentClassRecord);

                                const parentClassRecord = this.inheritanceMap.get(extendsName) || { extendsClass: null, subclasses: [] };
                                parentClassRecord.subclasses.push(name);
                                this.inheritanceMap.set(extendsName, parentClassRecord);
                            }
                        }
                    }
                }

                // Function Declaration
                if (kind === SyntaxKind.FunctionDeclaration) {
                    const name = node.getName();
                    if (name) {
                        const line = node.getStartLineNumber();
                        this.definitionsMap.set(name, { file: filePath, line, kind: 'Function' });
                    }
                }

                // Method Declaration
                if (kind === SyntaxKind.MethodDeclaration) {
                    const name = node.getName();
                    if (name) {
                        const line = node.getStartLineNumber();
                        this.definitionsMap.set(name, { file: filePath, line, kind: 'Method' });
                    }
                }

                // Call Expressions (to track callers)
                if (kind === SyntaxKind.CallExpression) {
                    const expression = node.getExpression();
                    let name = '';
                    
                    if (expression.getKind() === SyntaxKind.Identifier) {
                        name = expression.getText();
                    } else if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
                        name = expression.getName();
                    }

                    if (name) {
                        const list = this.callersMap.get(name) || [];
                        list.push({
                            file: filePath,
                            line: node.getStartLineNumber(),
                            text: node.getText()
                        });
                        this.callersMap.set(name, list);
                    }
                }
            });
        }

        this.isGraphBuilt = true;
        logger.info('🔍 AST Graph: Graph built successfully.');
    }

    /**
     * Finds all call sites referencing a function or method name.
     * @param {string} symbolName 
     * @returns {Array} List of caller sites
     */
    findCallers(symbolName) {
        if (!this.isGraphBuilt) {
            logger.warn('AST Graph: findCallers called before graph build. Returning empty.');
            return [];
        }
        return this.callersMap.get(symbolName) || [];
    }

    /**
     * Resolves the definition file and line for a symbol.
     * @param {string} symbolName 
     * @returns {Object|null} Definition details or null
     */
    getDefinition(symbolName) {
        if (!this.isGraphBuilt) {
            logger.warn('AST Graph: getDefinition called before graph build.');
            return null;
        }
        return this.definitionsMap.get(symbolName) || null;
    }

    /**
     * Returns the inheritance metadata for a class.
     * @param {string} className 
     * @returns {Object|null} Inheritance record or null
     */
    getInheritance(className) {
        if (!this.isGraphBuilt) {
            logger.warn('AST Graph: getInheritance called before graph build.');
            return null;
        }
        return this.inheritanceMap.get(className) || null;
    }
}

export const astGraphService = new AstGraphService();
