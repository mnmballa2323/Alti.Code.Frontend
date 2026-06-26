/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Env Validator" - Tier 8 Micro-Agent
 * Dynamically scrapes `.env` and `app.config` files for massive architectural flaws
 * (like exposing private keys in NEXT_PUBLIC_ space or missing absolutely critical DB strings)
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';

class EnvValidatorAgent {
  constructor() {
    this.name = 'EnvValidator';
    this.description = 'Strict environment variable assertion agent.';
  }

  /**
   * Reads an env file and returns an audit report of its quality.
   * @param {string} envPath
   * @returns {Promise<{valid: boolean, warnings: string[], errors: string[]}>}
   */
  async validateEnvConfiguration(envPath) {
    logger.info(`🛡️ EnvValidator Agent: Auditing [${envPath}]...`);
    let report = { valid: true, warnings: [], errors: [] };

    try {
      const content = await fs.readFile(envPath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        if (!line.includes('=')) {
          report.errors.push(`Line ${i + 1}: Malformed variable, missing '='.`);
          continue;
        }

        const [key, ...rest] = line.split('=');
        const val = rest.join('=');

        // Check 1: Empty variables
        if (!val || val === "''" || val === '""') {
          report.warnings.push(
            `Line ${i + 1}: '${key}' is empty. This might breach deployment configurations.`,
          );
        }

        // Check 2: Sensitive keys leaked to frontend context
        if (
          key.startsWith('NEXT_PUBLIC_') ||
          key.startsWith('REACT_APP_') ||
          key.startsWith('VITE_')
        ) {
          const lcKey = key.toLowerCase();
          if (
            lcKey.includes('secret') ||
            lcKey.includes('password') ||
            lcKey.includes('private_key')
          ) {
            report.errors.push(
              `CRITICAL [Line ${i + 1}]: '${key}' exposes a secret heavily into the public DOM/Client tier.`,
            );
          }
        }

        // Check 3: Insecure default values
        const insecureDefaults = [
          'password',
          '123456',
          'admin',
          'test',
          'secret',
        ];
        if (insecureDefaults.includes(val.toLowerCase())) {
          report.warnings.push(
            `Line ${i + 1}: '${key}' is using an insecure default value ('${val}').`,
          );
        }
      }

      if (report.errors.length > 0) report.valid = false;

      logger.info(
        `🛡️ EnvValidator Agent: Validation complete. Valid=${report.valid}`,
      );
      return report;
    } catch (err) {
      logger.error(
        `❌ EnvValidator Agent: Failed to read env file: ${envPath}`,
        err,
      );
      return {
        valid: false,
        warnings: [],
        errors: ['File read permission denied or file not found.'],
      };
    }
  }
}

export const envValidatorAgent = new EnvValidatorAgent();
