import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Pkg = require('web-tree-sitter');
const Parser = Pkg; // In 0.20.8, Pkg IS the Parser class

import path from 'path';
import { logger } from '../../../shared/logger.js';

class TreeSitterService {
    constructor() {
        this.parser = null;
        this.languages = new Map();
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize the WASM module
            if (Parser.init) {
                await Parser.init();
            } else {
                // Fallback if init is missing (should not happen in 0.20.8)
                throw new Error('Parser.init is missing');
            }

            this.parser = new Parser();
            this.isInitialized = true;
            logger.info('🌲 Tree-sitter Initialized (WASM)');
        } catch (error) {
            logger.error('Failed to initialize Tree-sitter', error);
            throw error;
        }
    }

    async ensureReady() {
        return this.init();
    }

    async loadLanguage(langName) {
        if (!this.isInitialized) await this.init();

        if (this.languages.has(langName)) {
            this.parser.setLanguage(this.languages.get(langName));
            return;
        }

        try {
            // Construct absolute path to the .wasm file
            const wasmPath = path.resolve(
                process.cwd(),
                'node_modules',
                'tree-sitter-wasms',
                'out',
                `tree-sitter-${langName}.wasm`
            );

            // Language class becomes available on Parser after init
            const Language = Parser.Language;

            if (!Language) {
                throw new Error(`Parser.Language is undefined. Keys: ${Object.getOwnPropertyNames(Parser)}`);
            }

            const lang = await Language.load(wasmPath);
            this.languages.set(langName, lang);
            this.parser.setLanguage(lang);
            logger.info(`🌲 Loaded language: ${langName}`);
        } catch (error) {
            logger.error(`Failed to load language ${langName}`, error);
            throw error;
        }
    }

    /**
     * Parses code and returns the Syntax Tree
     * @param {string} code 
     * @param {string} langName 
     * @returns {Promise<Parser.Tree>}
     */
    async parse(code, langName = 'javascript') {
        await this.loadLanguage(langName);
        return this.parser.parse(code);
    }

    /**
     * Executes a query on the code
     * @param {string} code 
     * @param {string} queryString 
     * @param {string} langName 
     */
    async query(code, queryString, langName = 'javascript') {
        await this.languages.get(langName) || await this.loadLanguage(langName); // Ensure loaded
        const tree = this.parser.parse(code);
        const lang = this.languages.get(langName);

        if (!lang) throw new Error(`Language ${langName} not loaded`);

        const query = lang.query(queryString);
        // Returns captures matches
        return query.matches(tree.rootNode);
    }
}

export const treeSitterService = new TreeSitterService();
