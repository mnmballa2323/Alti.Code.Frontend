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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class IntegrationAgent {
    constructor() {
        this.name = 'integration';
        this.description = 'Autonomous Swarm Diplomat and API Integrator';
        this.capabilities = [
            'Ingest raw OpenAPI/Swagger JSON document signatures',
            'Map authentication methods, HTTP verbs, and payload schemas',
            'Auto-generate robust Axios API wrappers with exponential backoff'
        ];
    }

    /**
     * Synthesizes an API client wrapper based on a provided Swagger snippet or textual API description.
     * @param {string} apiSpec The JSON Swagger or textual documentation
     * @param {string} targetSystem The name of the remote system (e.g. 'Stripe')
     */
    async generateApiClient(apiSpec, targetSystem = 'External API') {
        logger.info(`🔌 Integration Agent: Mapping remote endpoints for [${targetSystem}] integration...`);

        try {
            const prompt = `
            You are a Senior Integration Engineer building a robust Node.js API client.
            Parse the following API description or Swagger metadata for the system "${targetSystem}".

            API Context:
            \`\`\`
            ${apiSpec.substring(0, 3000)}
            \`\`\`

            Your task is to generate a pristine, ready-to-use Axios API client in JavaScript. It MUST include:
            1. An ES6 Class structure
            2. Methods corresponding to the provided endpoints
            3. Error handling with retry/backoff logic (or at least robust try/catch).

            Return your findings as a strict JSON report:
            {
                "integrationSummary": "1 sentence describing the endpoints mapped.",
                "endpointsMapped": number (integer),
                "generatedCode": "The complete Javascript string containing the Axios class wrapper."
            }
            Do not wrap the JSON output in markdown formatting.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const integrationReport = JSON.parse(reportJson);

            logger.info(`🔌 Integration Agent Summary: ${integrationReport.integrationSummary}`);
            logger.info(`   Mapped ${integrationReport.endpointsMapped} endpoint pathways.`);

            return integrationReport;

        } catch (err) {
            logger.error(`❌ Integration Agent Binding Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const spec = state.data?.content || "{}";
        const systemName = state.data?.context || state.goal || "Generic System";

        const report = await this.generateApiClient(spec, systemName);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Integration Wrapper Generated for ${systemName}.`]
        };
    }
}

export const integrationAgent = Object.freeze(new IntegrationAgent());
