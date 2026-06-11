/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import config from '../../../config/index.js';
import { logger } from '../../shared/logger.js';

class PklConfigService {
  constructor() {
    this.configPath = config.pkl.configPath;
    this.pklModule = null;
    this.loadedConfig = null;
    this.initialized = false;
  }

  /**
   * Initializes the Pkl configuration parser/loader
   */
  async initialize() {
    try {
      // Check if pkl-typescript is imported successfully
      this.pklModule = await import('@pkl-community/pkl-typescript');
      this.initialized = true;
      logger.info('✅ [PklConfigService] @pkl-community/pkl-typescript loaded successfully.');
    } catch (error) {
      logger.warn('⚠️ [PklConfigService] @pkl-community/pkl-typescript bindings could not be loaded dynamically. Using standard env fallback.');
    }
  }

  /**
   * Evaluates a Pkl configuration file
   * @param {string} customPath Optional custom Pkl path
   * @returns {Promise<Object>} Evaluated configuration object
   */
  async loadConfig(customPath = null) {
    const targetPath = customPath || this.configPath;

    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pklModule || !fs.existsSync(targetPath)) {
      logger.info(`ℹ️ [PklConfigService] Pkl file not found or module uninitialized at: ${targetPath}. Falling back to default env configuration.`);
      return { ...config };
    }

    try {
      logger.info(`🔌 [PklConfigService] Evaluating Pkl configuration from: ${targetPath}...`);
      // loadFromPath evaluates the Pkl file and returns parsed JavaScript object/properties
      const evaluated = await this.pklModule.loadFromPath(targetPath);
      this.loadedConfig = evaluated;
      logger.info('✅ [PklConfigService] Configuration evaluated successfully.');
      return evaluated;
    } catch (error) {
      logger.error(`❌ [PklConfigService] Failed to parse Pkl file at ${targetPath}:`, error.message);
      // Return default configuration object as a resilient fallback
      return { ...config };
    }
  }

  /**
   * Returns previously loaded configuration or configObject fallback
   */
  get() {
    return this.loadedConfig || config;
  }
}

export const pklConfigService = new PklConfigService();
export default pklConfigService;
