/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class DockerfileSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'dockerfile_specialist',
            'Dockerfile Specialist',
            'You are an elite Dockerfile Specialist. You specialize in: Container image build specifications.'
        );
    }

    async generateDockerfileSystem(objective) {
        logger.info(`💻 [DockerfileSpecialistAgent] Analyzing Dockerfile requirements...`);
        const prompt = `Analyze the Dockerfile requirement: ${objective}. Output valid Dockerfile code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Dockerfile Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DockerfileSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const DockerfileSpecialistAgentInstance = new DockerfileSpecialistAgent();
