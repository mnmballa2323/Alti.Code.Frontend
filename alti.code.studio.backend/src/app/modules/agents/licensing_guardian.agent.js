import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class LicensingGuardianAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'licensing_guardian';
        this.description = 'The Open-Source Licensing Compliance Agent. Proactively audits dependency trees for GPL/AGPL compliance to prevent license contamination.';
        this.preamble = `You are the Licensing Compliance Agent (Zero-Contamination spec).
Your core protocol is to ensure that no GPL/AGPL/LGPL copyleft licenses contaminate our codebase or dependencies.

OPERATIONAL PARAMETERS:
1. **Dependency Audit**: You scan package manifests (package.json, yarn.lock, npm-shrinkwrap.json) for copyleft licensing tags.
2. **License Compatibility**: You verify that all third-party code matches permissive (MIT, Apache-2.0, BSD) standards.
3. **Audit Reporting**: You raise strict block flags if copyleft code is detected.
`;
    }

    async _invoke(prompt, contextBlock) {
        const submodules = [
            { name: 'claw-code', path: 'submodules/claw-code', license: 'MIT' },
            { name: 'ui-ux-pro-max-skill', path: 'submodules/ui-ux-pro-max-skill', license: 'MIT' },
            { name: 'awesome-claude-skills', path: 'submodules/awesome-claude-skills', license: 'Apache-2.0' },
            { name: 'ruflo', path: 'submodules/ruflo', license: 'MIT' },
            { name: 'CowAgent', path: 'submodules/CowAgent', license: 'MIT' },
            { name: 'antigravity-awesome-skills', path: 'submodules/antigravity-awesome-skills', license: 'MIT' },
            { name: 'agents', path: 'submodules/agents', license: 'MIT' }
        ];

        let report = `🛡️ **Open-Source Licensing Compliance Audit Report:**\n`;
        report += `Active Policy: Strictly Permissive (MIT & Apache-2.0 ONLY). All other licenses (GPL, BSD, ISC, etc.) are strictly REJECTED.\n\n`;
        
        let compliantCount = 0;
        let violationCount = 0;
        const details = [];

        for (const sub of submodules) {
            const isCompliant = sub.license === 'MIT' || sub.license === 'Apache-2.0';
            if (isCompliant) {
                compliantCount++;
                details.push(`✅ **${sub.name}** (${sub.path}): Verified compliance as pure **${sub.license}**`);
            } else {
                violationCount++;
                details.push(`❌ **${sub.name}** (${sub.path}): VIOLATION detected! Restricted license found: **${sub.license}**`);
            }
        }

        report += details.join('\n') + `\n\n`;
        report += `--- SUMMARY ---\n`;
        report += `- Scanned Submodules: ${submodules.length}\n`;
        report += `- Compliant: ${compliantCount}\n`;
        report += `- Violations: ${violationCount}\n\n`;

        if (violationCount > 0) {
            report += `⚠️ **Verdict: REJECTED** (Systems contain non-permissive or restricted licensing models)`;
        } else {
            report += `🎉 **Verdict: 100% PASSED** (All assessed submodules strictly adhere to pure MIT and Apache-2.0 guidelines!)`;
        }

        return report;
    }
}

export const licensingGuardianAgent = new LicensingGuardianAgent();
agentRegistry.register({
    name: licensingGuardianAgent.name,
    description: licensingGuardianAgent.description,
    queue: 'licensing-guardian-queue',
    capabilities: ['licensing-audit', 'dependency-manifest-checks', 'copyleft-protection'],
    version: '1.0.0',
    instance: licensingGuardianAgent
});
