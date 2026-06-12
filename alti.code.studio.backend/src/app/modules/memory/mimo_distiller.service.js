import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class MimoDistillerService {
    constructor() {
        this.definitionsDir = path.join(
            process.cwd(),
            'src',
            'app',
            'modules',
            'agents',
            'definitions'
        );
    }

    /**
     * Distills a successful trajectory of execution steps into a new dynamic specialist agent.
     * 
     * @param {string} taskDescription - The high-level objective that was solved.
     * @param {Array<string>|string} logs - The logs/actions taken by the agent(s).
     * @param {string} targetId - The unique ID for the new agent (e.g. 'agent.specialist.mytool').
     */
    async distill(taskDescription, logs, targetId) {
        logger.info(`[MimoDistiller] ⚗️ Starting trajectory distillation for agent: ${targetId}...`);

        if (!targetId || !targetId.endsWith('.agent')) {
            // Ensure proper namespace formatting
            if (!targetId) targetId = `agent.custom.${Date.now()}`;
            else if (!targetId.startsWith('agent.')) targetId = `agent.custom.${targetId}`;
        }

        const logString = Array.isArray(logs) ? logs.join('\n') : logs;

        const prompt = `
You are the Agent Trajectory Distiller ("The Alchemist") for Alti.Code.Studio.
Your task is to review a completed task description and the corresponding execution logs/actions,
and synthesize them into a reusable, specialized YAML agent definition.

YAML Agent Schema:
\`\`\`yaml
id: [Must match the targetId provided: "${targetId}"]
name: [A user-friendly title, e.g. "GitLab OAuth Configurator"]
version: "1.0.0"
description: [One line describing the agent's specialty]
preamble: |
  [Write a highly detailed, instruction-rich preamble outlining the role, constraints, and step-by-step logic required to execute this type of task. Use the proven workflows from the execution logs to formulate this instruction core.]
capabilities:
  - [List of capability strings, e.g. "git", "config", "oauth"]
\`\`\`

=== TASK DESCRIPTION ===
${taskDescription}

=== EXECUTION LOGS ===
${logString}

Generate ONLY the raw YAML block. Do not wrap it in markdown code blocks like \`\`\`yaml. Return the raw YAML text directly.
`;

        try {
            const yamlContent = await GeminiAiService.generateContent(prompt);
            const cleanedYaml = yamlContent.trim().replace(/^```yaml\n|```$/g, '');

            // Ensure destination directory exists
            await fs.mkdir(this.definitionsDir, { recursive: true });

            const fileName = `${targetId}.agent.yaml`;
            const filePath = path.join(this.definitionsDir, fileName);

            await fs.writeFile(filePath, cleanedYaml, 'utf8');
            logger.info(`[MimoDistiller] ✅ Successfully distilled new agent definition: ${filePath}`);

            return {
                success: true,
                agentId: targetId,
                filePath,
                content: cleanedYaml
            };

        } catch (error) {
            logger.error(`[MimoDistiller] ❌ Trajectory distillation failed: ${error.message}`);
            throw error;
        }
    }
}

export const mimoDistillerService = new MimoDistillerService();
export default mimoDistillerService;
