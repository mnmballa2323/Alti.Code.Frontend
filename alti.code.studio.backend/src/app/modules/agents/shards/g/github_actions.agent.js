// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GithubActionsAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'github_actions',
      'CI/CD Workflow Pipeline Engineer',
      "You are an elite DevOps CI/CD Engineer specializing in GitHub Actions. Your objective is to scan a project's technology stack (e.g., Rust, Next.js, Python) and generate mathematically optimal, highly-concurrent YAML workflows for matrix testing, security auditing, and continuous deployment.",
    );
  }

  /**
   * Generates a GitHub Actions workflow YAML.
   * @param {string} projectContext - The tech stack details (e.g., package.json, Cargo.toml).
   * @returns {Promise<string>} The generated GitHub Actions YAML file.
   */
  async generateWorkflow(projectContext) {
    logger.info(
      `🐙 [GithubActions] Designing optimal CI/CD pipeline for matrix testing...`,
    );

    const prompt = `
Analyze the following project context (e.g., package.json or dependencies).
Generate a highly optimized GitHub Actions workflow YAML file.
RULES:
1. Implement Matrix strategies to test across multiple OSs (ubuntu-latest, macos-latest) and Language versions if applicable.
2. Include caching steps to mathematically minimize build times.
3. Include strict security scanning steps (e.g., Dependabot or static analysis).
Return ONLY the raw YAML code.

PROJECT CONTEXT:
${projectContext}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - CI/CD Target');
      const cleanYaml = output.replace(/```yaml|```yml|```/gi, '').trim();
      logger.info(
        `✅ [GithubActions] GitHub Actions YAML workflow generated successfully.`,
      );
      return cleanYaml;
    } catch (err) {
      logger.error(
        `❌ [GithubActions] Failed to generate CI/CD workflow: ${err.message}`,
      );
      throw err;
    }
  }
}

export const githubActionsAgent = Object.freeze(new GithubActionsAgent());
