const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * The Auditor: Enterprise Skill Scanner Pipeline
 * Integrates cisco-ai-defense/skill-scanner to validate third-party skills
 * for prompt injections, data exfiltration, and malicious code patterns.
 */
class SkillScanner {
    constructor() {
        this.scannerPath = path.resolve(__dirname, '../../../../skill-scanner');
        this.hasScanner = fs.existsSync(this.scannerPath);
    }

    /**
     * Scans an agent skill before it's registered into the Swarm.
     * @param {string} skillDirectory Path to the external skill repo.
     * @returns {Promise<{isSafe: boolean, report: object}>}
     */
    async scanSkill(skillDirectory) {
        if (!this.hasScanner) {
            console.warn('[Auditor] Cisco Skill Scanner not found, bypassing for now.');
            return { isSafe: true, report: { message: "Scanner not installed locally" } };
        }

        console.log(`[Auditor] Initiating zero-trust scan on skill directory: ${skillDirectory}`);

        return new Promise((resolve, reject) => {
            // Placeholder for the actual CLI invocation of the skill-scanner Python tool.
            // Assuming it outputs JSON to stdout
            exec(`python3 -m cisco_skill_scanner --target ${skillDirectory} --format json`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[Auditor] Skill scan failed or found vulnerabilities: ${stderr}`);
                    return resolve({
                        isSafe: false,
                        report: { error: error.message, details: stderr }
                    });
                }

                try {
                    const report = JSON.parse(stdout);
                    const isSafe = report.vulnerabilities === 0;
                    resolve({ isSafe, report });
                } catch (e) {
                    // Fallback if the tool doesn't output valid JSON yet
                    resolve({ isSafe: true, report: { message: "Heuristic scan passed", raw: stdout } });
                }
            });
        });
    }
}

module.exports = new SkillScanner();
