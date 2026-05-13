import { Project, ScriptTarget, QuoteKind } from 'ts-morph';
import { logger } from '../../../shared/logger.js';

class CodeMorphService {
    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ESNext,
                allowJs: true,
            },
            manipulationSettings: {
                quoteKind: QuoteKind.Single,
            }
        });
    }

    /**
     * Loads a file into the project for manipulation.
     * @param {string} filePath - Absolute path to the file.
     * @returns {import('ts-morph').SourceFile}
     */
    addSourceFile(filePath, content) {
        // If content is provided, create/overwrite virtual file
        // If not, add existing from disk
        if (content) {
            return this.project.createSourceFile(filePath, content, { overwrite: true });
        }
        return this.project.addSourceFileAtPath(filePath);
    }

    /**
     * Adds an import declaration to a source file.
     * @param {import('ts-morph').SourceFile} sourceFile 
     * @param {string} moduleSpecifier - e.g. 'fs' or './myModule' 
     * @param {string[]} namedImports - e.g. ['readFileSync']
     * @param {string} defaultImport - e.g. 'fs'
     */
    addImport(sourceFile, moduleSpecifier, namedImports = [], defaultImport = undefined) {
        try {
            // Check if import already exists to avoid duplicates
            const existingImport = sourceFile.getImportDeclaration(d =>
                d.getModuleSpecifierValue() === moduleSpecifier
            );

            if (existingImport) {
                // Determine what to add
                if (defaultImport && !existingImport.getDefaultImport()) {
                    existingImport.setDefaultImport(defaultImport);
                }

                if (namedImports.length > 0) {
                    const currentNamed = existingImport.getNamedImports().map(n => n.getName());
                    for (const name of namedImports) {
                        if (!currentNamed.includes(name)) {
                            existingImport.addNamedImport(name);
                        }
                    }
                }
                logger.debug(`Modified existing import for ${moduleSpecifier}`);
            } else {
                sourceFile.addImportDeclaration({
                    defaultImport,
                    namedImports,
                    moduleSpecifier
                });
                logger.debug(`Added new import for ${moduleSpecifier}`);
            }
        } catch (error) {
            logger.error(`Failed to add import ${moduleSpecifier}`, error);
            throw error;
        }
    }

    /**
     * Adds a method to a class.
     * @param {import('ts-morph').SourceFile} sourceFile 
     * @param {string} className 
     * @param {string} methodName 
     * @param {string} methodContent - Function body content
     * @param {boolean} isAsync 
     */
    addClassMethod(sourceFile, className, methodName, methodContent, isAsync = false) {
        try {
            const classDec = sourceFile.getClass(className);
            if (!classDec) {
                throw new Error(`Class ${className} not found in file`);
            }

            const existingMethod = classDec.getMethod(methodName);
            if (existingMethod) {
                logger.warn(`Method ${methodName} already exists in ${className}. Overwriting implementation.`);
                existingMethod.setBodyText(methodContent);
            } else {
                classDec.addMethod({
                    name: methodName,
                    isAsync,
                    statements: methodContent
                });
                logger.debug(`Added method ${methodName} to ${className}`);
            }
        } catch (error) {
            logger.error(`Failed to add method ${methodName} to ${className}`, error);
            throw error;
        }
    }

    /**
     * Gets the modified source code.
     * @param {import('ts-morph').SourceFile} sourceFile 
     */
    getSource(sourceFile) {
        return sourceFile.getFullText();
    }
}

export const codeMorphService = new CodeMorphService();
