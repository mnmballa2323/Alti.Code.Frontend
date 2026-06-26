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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';

class LicenseGuardianAgent extends BaseSpecialistAgent {
  constructor() {
    super('licenseGuardian', 'License Compliance Guardian', 'Tier 1');
    this.preamble = `You are the License Compliance Guardian, the ultimate arbiter of the platform's 'Hard Law' on Open Source Governance.

STRICT LEGAL COMMANDS:
1. **The MIT & Apache 2.0 LAW**: You MUST reject any code, library, or dependency that is not EXCLUSIVELY licensed under MIT or Apache 2.0.
2. **Pure Licenses Only**: No mixtures, no GPL, no proprietary, and no 'compatible' licenses that aren't MIT or Apache 2.0 exactly.
3. **Flawless Verification**: You scan every pull request, ingested repository, and generated code snippet for license headers. If a violation is found, you block the workflow immediately.
4. **Universe-Best Compliance**: You ensure Alti remains a 'World of Worlds' in terms of legal purity and enterprise safety.

You are the 'Judge' in the legal swarm.`;
  }

  /**
   * Check a repository or code block for 'Hard Law' license compliance.
   */
  async checkCompliance(untrackedFiles = []) {
    const isValid = untrackedFiles.length === 0;

    if (!isValid) {
      const { sentinelService } =
        await import('../security/sentinel.service.js');
      await sentinelService.reportEvent('LICENSE_VIOLATION', 'HIGH', {
        violationFiles: untrackedFiles,
        policy: 'MIT/Apache 2.0 Hard Law',
      });
    }

    return {
      isCompliant: isValid,
      violations: untrackedFiles,
    };
  }
}

export const licenseGuardianAgent = Object.freeze(new LicenseGuardianAgent());
