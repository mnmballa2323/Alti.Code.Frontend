/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Import Sorter" - Tier 8 Micro-Agent
 * A surgical regex implementation that groups imports dynamically (React, Third-Party, Internal).
 * Speeds up Webpack and keeps files clean.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';

class ImportSorterAgent {
    constructor() {
        this.name = 'ImportSorter';
    }

    /**
     * Sorts imports in a given file.
     * React/Node -> Third Party -> Absolute Configs -> Relative Internals.
     * @param {string} filePath 
     * @returns {Promise<boolean>}
     */
    async sortImports(filePath) {
        logger.info(`🗂️ ImportSorter Agent: Restructuring modules in: ${filePath}`);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            let imports = [];
            let code = [];
            let inMultiLineImport = false;
            let currentBlock = "";

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (inMultiLineImport) {
                    currentBlock += "\n" + line;
                    if (line.includes(';')) {
                        imports.push(currentBlock);
                        inMultiLineImport = false;
                        currentBlock = "";
                    }
                    continue;
                }

                if (line.trim().startsWith('import ')) {
                    if (line.includes(';')) {
                        imports.push(line);
                    } else {
                        inMultiLineImport = true;
                        currentBlock = line;
                    }
                } else if (!line.trim() && imports.length === 0) {
                    // Ignore empty lines before code starts
                    code.push(line);
                } else {
                    code.push(line);
                }
            }

            if (imports.length === 0) return true; // Nothing to sort

            // Categorize
            const builtin = [];
            const external = [];
            const absolute = [];
            const relative = [];

            imports.forEach(imp => {
                const match = imp.match(/from\s+['"](.+)['"]/);
                if (match) {
                    const moduleName = match[1];
                    if (moduleName === 'react' || moduleName.startsWith('node:')) {
                        builtin.push(imp);
                    } else if (moduleName.startsWith('.') || moduleName.startsWith('..')) {
                        relative.push(imp);
                    } else if (moduleName.startsWith('@/')) {
                        absolute.push(imp);
                    } else {
                        external.push(imp);
                    }
                } else {
                    // Things like `import "./styles.css";`
                    if (imp.includes('style') || imp.includes('.css')) {
                        relative.push(imp);
                    } else {
                        external.push(imp);
                    }
                }
            });

            // Sort alphabetically inside clusters
            builtin.sort(); external.sort(); absolute.sort(); relative.sort();

            const outputBlocks = [builtin, external, absolute, relative].filter(b => b.length > 0);

            let sortedImportsText = outputBlocks.map(block => block.join('\n')).join('\n\n');

            // Find the start of the actual code
            let codeStartIndex = 0;
            while (codeStartIndex < code.length && code[codeStartIndex].trim() === '') {
                codeStartIndex++;
            }

            const finalFileContent = sortedImportsText + '\n\n' + code.slice(codeStartIndex).join('\n');

            await fs.writeFile(filePath, finalFileContent, 'utf8');
            logger.info(`🗂️ ImportSorter Agent: Successfully ordered imports.`);
            return true;

        } catch (error) {
            logger.error(`❌ ImportSorter Agent: Failed on file ${filePath}`, error);
            return false;
        }
    }
}

export const importSorterAgent = new ImportSorterAgent();
