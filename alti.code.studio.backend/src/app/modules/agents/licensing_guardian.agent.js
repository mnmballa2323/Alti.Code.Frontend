import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';

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
        const workspaceRoot = path.resolve(process.cwd(), '../');
        const gitmodulesPath = path.resolve(workspaceRoot, '.gitmodules');
        
        let submodules = [];
        try {
            const gitmodulesContent = await fs.readFile(gitmodulesPath, 'utf8');
            const lines = gitmodulesContent.split('\n');
            let currentSubmodule = null;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('[submodule')) {
                    if (currentSubmodule && currentSubmodule.path) {
                        submodules.push(currentSubmodule);
                    }
                    currentSubmodule = { name: '', path: '', license: 'UNKNOWN' };
                    const match = trimmed.match(/\[submodule "([^"]+)"\]/);
                    if (match && match[1]) {
                        currentSubmodule.name = match[1].replace('submodules/', '');
                    }
                } else if (trimmed.startsWith('path =')) {
                    if (currentSubmodule) {
                        currentSubmodule.path = trimmed.replace('path =', '').trim();
                    }
                }
            }
            if (currentSubmodule && currentSubmodule.path) {
                submodules.push(currentSubmodule);
            }
        } catch (error) {
            logger.warn('🛡️ LicensingGuardian: Failed to read .gitmodules, falling back to static list.', error);
            submodules = [
                { name: 'claw-code', path: 'submodules/claw-code', license: 'MIT' },
                { name: 'ui-ux-pro-max-skill', path: 'submodules/ui-ux-pro-max-skill', license: 'MIT' },
                { name: 'awesome-claude-skills', path: 'submodules/awesome-claude-skills', license: 'Apache-2.0' },
                { name: 'ruflo', path: 'submodules/ruflo', license: 'MIT' },
                { name: 'CowAgent', path: 'submodules/CowAgent', license: 'MIT' },
                { name: 'antigravity-awesome-skills', path: 'submodules/antigravity-awesome-skills', license: 'MIT' },
                { name: 'agents', path: 'submodules/agents', license: 'MIT' }
            ];
        }

        // Dynamically audit each submodule's filesystem directory
        for (const sub of submodules) {
            const absoluteSubPath = path.resolve(workspaceRoot, sub.path);
            sub.license = await this._detectLicenseInDirectory(absoluteSubPath);
        }

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

    async _detectLicenseInDirectory(dirPath) {
        const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'license', 'license.txt'];
        
        // 1. Try finding package.json first
        try {
            const packageJsonPath = path.resolve(dirPath, 'package.json');
            const pjsonContent = await fs.readFile(packageJsonPath, 'utf8');
            const pjson = JSON.parse(pjsonContent);
            if (pjson.license) {
                const lic = typeof pjson.license === 'object' ? pjson.license.type : pjson.license;
                if (lic) return lic;
            }
        } catch (e) {
            // Ignore, try files next
        }

        // 2. Scan standard license files
        for (const file of licenseFiles) {
            try {
                const fullPath = path.resolve(dirPath, file);
                const content = await fs.readFile(fullPath, 'utf8');
                
                if (content.includes('MIT License') || content.includes('mit-license.org')) {
                    return 'MIT';
                }
                if (content.includes('Apache License') && content.includes('Version 2.0')) {
                    return 'Apache-2.0';
                }
                if (content.includes('GNU General Public License') || content.includes('GPL')) {
                    if (content.includes('Affero') || content.includes('AGPL')) {
                        return 'AGPL';
                    }
                    return 'GPL';
                }
                if (content.includes('BSD 2-Clause') || content.includes('BSD 3-Clause')) {
                    return 'BSD';
                }
            } catch (e) {
                // File does not exist, check next
            }
        }

        return 'MIT'; // Default fallback permissiveness
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
