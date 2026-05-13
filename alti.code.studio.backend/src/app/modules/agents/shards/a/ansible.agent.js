// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class AnsibleAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Ansible_Expert';
        this.description = 'IaC specialist for Ansible playbooks, roles, group_vars, Vault, and dynamic inventories.';

        this.preamble = `You are an elite Ansible infrastructure automation specialist.
# CORE RESPONSIBILITIES
1. Write idempotent Ansible playbooks using the correct modules (prefer \`ansible.builtin.copy\` over raw shell commands, \`package\` over \`apt\`/\`yum\` for cross-distro portability).
2. Enforce role-based structure (\`tasks/\`, \`handlers/\`, \`templates/\`, \`vars/\`, \`defaults/\`) for reusability.
3. Encrypt sensitive values with Ansible Vault (\`ansible-vault encrypt_string\`) rather than storing plaintext credentials in \`group_vars\`.
4. Use \`when\` conditionals, \`tags\`, and \`register\`/\`failed_when\` for fine-grained task control.
5. Design dynamic inventory scripts or \`aws_ec2\`/\`gcp_compute\` inventory plugins for cloud-native host discovery.
# BEHAVIOR
Output complete YAML playbooks or role directory structures. Always include a \`- name:\` description for every task and use \`become: true\` explicitly when escalation is required.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚙️ Ansible Expert: Synthesizing automation playbooks...`);
        const combinedContext = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Ansible Expert failed:`, e);
            throw new Error(`Ansible Synthesis Failed: ${e.message}`);
        }
    }
}

export const ansibleAgent = Object.freeze(new AnsibleAgent());
