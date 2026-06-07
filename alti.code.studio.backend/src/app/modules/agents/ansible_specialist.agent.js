/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class AnsibleYAMLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ansible_specialist',
            'Ansible (YAML) Specialist',
            'You are an elite Ansible (YAML) Specialist. You specialize in: Agentless IT orchestration and configuration.'
        );
    }

    async generateAnsibleYAMLSystem(objective) {
        logger.info(`💻 [AnsibleYAMLSpecialistAgent] Analyzing Ansible (YAML) requirements...`);
        const prompt = `Analyze the Ansible (YAML) requirement: ${objective}. Output valid Ansible (YAML) code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Ansible (YAML) Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [AnsibleYAMLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const AnsibleYAMLSpecialistAgentInstance = new AnsibleYAMLSpecialistAgent();
