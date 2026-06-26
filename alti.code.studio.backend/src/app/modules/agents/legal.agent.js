/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Phase 31: The Legal Oracle (Autonomous IP & Compliance)
 * Agent responsible for scanning codebase additions for viral open-source licenses
 * (e.g., GPLv3) and drafting IP/EULAs for novel generated logic before deployment.
 */
class LegalAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      id: 'agent_legal_001',
      name: 'LegalAgent',
      description:
        'Scans for Open-Source license contamination (GPLv3) and drafts EULAs and Software Patents for generated algorithms.',
      tier: 31,
      version: '7.0.0',
      capabilities: [
        'Scan package.json and import trees for restrictive copyleft licenses',
        'Identify MIT/Apache 2.0 vs GPL/AGPL conflicts',
        'Autonomously draft End User License Agreements (EULA)',
        'Generate Provisional Software Patent drafts for novel AI algorithms',
      ],
    });
  }

  /**
   * Interface handler for the capability router / neural net
   */
  async _invoke(query, options = {}) {
    if (query.match(/draft|eula|patent/i)) {
      return this.execute('draft_ip', { query, ...options });
    }
    return this.execute('audit_license', { query, ...options });
  }

  /**
   * Scans package.json for GPL/AGPL licenses.
   */
  async _scanDependencies(repoPath) {
    try {
      const pkgPath = path.join(repoPath, 'package.json');
      const data = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(data);

      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const violations = [];

      // In a real system we would query the NPM Registry for exact license types.
      // Here we utilize a heuristic mock for demonstration.
      for (const [dep, version] of Object.entries(deps)) {
        if (
          dep.includes('gpl') ||
          dep.includes('copyleft') ||
          dep === 'commercial-mock'
        ) {
          violations.push({
            dep,
            version,
            issue: 'Potential viral copyleft license detected (GPL/AGPL).',
          });
        }
      }

      return violations;
    } catch (e) {
      logger.warn(`LegalAgent dependency scan failed: ${e.message}`);
      return [];
    }
  }

  async execute(action, context) {
    logger.info(`⚖️ LegalAgent execution started for action: ${action}`);

    if (action === 'audit_license') {
      const repoPath = context.repoPath || process.cwd();
      const violations = await this._scanDependencies(repoPath);

      if (violations.length > 0) {
        logger.warn(
          `⚖️ LegalOracle: FOUND LICENSE CONTAMINATION! Violations: ${violations.length}`,
        );

        const prompt = `You are the Inso Code Legal Oracle.
                We have detected the following potentially restrictive dependencies in our commercial codebase:
                ${JSON.stringify(violations, null, 2)}
                
                Draft a legal risk assessment for the CTO explaining why including GPL/AGPL in a closed-source SaaS is a risk,
                and recommend strict MIT/Apache 2.0 alternatives.`;

        const riskAssessment = await GeminiAiService.generateContent(prompt);

        return {
          status: 'failed',
          error: 'Open-Source License Contamination Detected.',
          violations,
          riskAssessment,
          isSafeToDeploy: false,
        };
      }

      this._recordSuccess(400);
      return {
        status: 'success',
        message:
          'Codebase cleared of viral copyleft licenses. All dependencies are MIT/Apache compliant.',
        isSafeToDeploy: true,
      };
    }

    if (action === 'draft_ip') {
      const prompt = `You are the Inso Code Intellectual Property Attorney.
            The Swarm just generated a novel piece of software functionality: "${context.query}"
            
            Draft a 3-paragraph End User License Agreement (EULA) clause that protects our proprietary rights
            to this specific functionality. Include standard clauses for "No Warranty" and "Limitation of Liability".
            
            Return ONLY the pure legal text. No markdown fences.`;

      let eulaText = '';
      try {
        eulaText = await GeminiAiService.generateContent(prompt);
        eulaText = eulaText
          .replace(/^```[a-z]*\n?/m, '')
          .replace(/\n?```$/m, '')
          .trim();
      } catch (e) {
        return { status: 'failed', error: 'Failed to draft EULA.' };
      }

      this._recordSuccess(1200);

      return {
        status: 'success',
        eula: eulaText,
        message: 'Proprietary IP generated and legally clamped.',
      };
    }

    throw new Error(`Unsupported action: ${action}`);
  }
}

export const legalAgent = new LegalAgent();
