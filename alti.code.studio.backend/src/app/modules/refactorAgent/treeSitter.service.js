/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

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
      if (Parser.init) {
        await Parser.init();
      } else {
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
      const wasmPath = path.resolve(
        process.cwd(),
        'node_modules',
        'tree-sitter-wasms',
        'out',
        `tree-sitter-${langName}.wasm`,
      );

      const Language = Parser.Language;

      if (!Language) {
        throw new Error(
          `Parser.Language is undefined. Keys: ${Object.getOwnPropertyNames(Parser)}`,
        );
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
   * Parses code and returns the Syntax Tree.
   * @param {string} code
   * @param {string} langName
   * @returns {Promise<Parser.Tree>}
   * @throws {Error} if code or langName is invalid
   */
  async parse(code, langName = 'javascript') {
    if (typeof code !== 'string') {
      throw new Error('TreeSitter.parse(): code must be a string.');
    }
    if (!langName || typeof langName !== 'string') {
      throw new Error(
        'TreeSitter.parse(): langName must be a non-empty string.',
      );
    }
    await this.loadLanguage(langName);
    return this.parser.parse(code);
  }

  /**
   * Executes a Tree-sitter query on the code.
   * @param {string} code
   * @param {string} queryString
   * @param {string} langName
   * @throws {Error} if code or queryString is invalid
   */
  async query(code, queryString, langName = 'javascript') {
    if (typeof code !== 'string') {
      throw new Error('TreeSitter.query(): code must be a string.');
    }
    if (!queryString || typeof queryString !== 'string') {
      throw new Error(
        'TreeSitter.query(): queryString must be a non-empty string.',
      );
    }

    // Explicit has() check — avoids truthy coercion on a Language object
    if (!this.languages.has(langName)) {
      await this.loadLanguage(langName);
    }

    const tree = this.parser.parse(code);
    const lang = this.languages.get(langName);
    if (!lang) throw new Error(`Language "${langName}" not loaded.`);

    const q = lang.query(queryString);
    return q.matches(tree.rootNode);
  }
}

export const treeSitterService = new TreeSitterService();
