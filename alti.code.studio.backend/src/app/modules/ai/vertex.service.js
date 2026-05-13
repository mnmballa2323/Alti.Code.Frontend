/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { VertexAI } from '@google-cloud/vertexai';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { costService } from '../telemetry/cost.service.js';

class VertexService {
    constructor() {
        this.project = config.gcp.project_id;
        this.location = config.gcp.location;
        this.modelName = config.gcp.model_name;
        this.vertexAI = null;
        this.generativeModel = null;
        this.isMockMode = false;

        this.init();
    }

    init() {
        try {
            // Attempt to initialize Vertex AI
            // This requires Application Default Credentials (ADC) to be set up in the environment
            // e.g. via `gcloud auth application-default login`
            this.vertexAI = new VertexAI({
                project: this.project,
                location: this.location
            });

            this.generativeModel = this.vertexAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    'maxOutputTokens': 8192,
                    'temperature': 0.1,
                    'topP': 0.95,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ],
            });

            logger.info(`VertexService: Initialized for project ${this.project} using model ${this.modelName}`);
        } catch (error) {
            logger.warn('VertexService: Failed to initialize Vertex AI client. Switching to Mock Mode.', error);
            this.isMockMode = true;
        }
    }

    /**
     * Generate content using Vertex AI (Gemini)
     * @param {string} prompt 
     * @returns {Promise<string>}
     */
    async generateContent(prompt, metadata = {}) {
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            throw new Error('VertexService: prompt must be a non-empty string.');
        }

        const startTime = Date.now();
        if (this.isMockMode || !this.generativeModel) {
            return this.mockGenerate(prompt);
        }

        try {
            const request = {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            };

            const result = await this.generativeModel.generateContent(request);
            const response = result.response;
            const text = response.candidates[0].content.parts[0].text;

            // Extract token metadata if available from Vertex payload
            const usage = response.usageMetadata || {};
            const promptTokens = usage.promptTokenCount || prompt.length / 4;
            const completionTokens = usage.candidatesTokenCount || text.length / 4;
            const executionTimeMs = Date.now() - startTime;

            // Optional: Extract agent context from metadata if passed by orchestrator
            const activeAgent = metadata.agentName || 'Anonymous_Vertex_Caller';
            const tenantId = metadata.tenantId || 'default_enterprise_tenant';

            import('../monitoring/metrics.service.js').then(({ metricsService }) => {
                metricsService.recordLLMUsage(tenantId, activeAgent, this.modelName, promptTokens, completionTokens, executionTimeMs);
            }).catch(e => logger.warn('MetricsService not available for billing record'));

            return text;

        } catch (error) {
            logger.error('VertexService: API call failed', error);
            logger.warn('VertexService: Falling back to Mock response due to API error.');
            return this.mockGenerate(prompt);
        }
    }

    async mockGenerate(prompt) {
        logger.info('VertexService: Generating MOCK response...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency

        if (prompt.includes('Guardian Angel')) {
            return JSON.stringify({
                safe: true,
                score: 85,
                reasoning: "[MOCK] Code appears safe. (Vertex AI not configured)",
                vulnerabilities: [],
                suggestions: ["Configure GCP Credentials for real audit"]
            }, null, 2);
        }

        if (prompt.includes('You are the Sentinel')) {
            return JSON.stringify({
                rootCause: "[MOCK] Detected infinite recursion in recursiveFunction.",
                filePath: "broken_file.js",
                isFixable: true,
                suggestedFix: "Add a base case to stop recursion."
            }, null, 2);
        }

        if (prompt.includes('You are The Surgeon')) {
            return `
// [MOCK FIX APPLIED BY SURGEON]
function recursiveFunction(n) {
    if (n <= 0) return 0; // Base case added
    return n + recursiveFunction(n - 1);
}
            `.trim();
        }

        if (prompt.includes('You are the Composer')) {
            if (prompt.includes('Return a JSON object')) {
                return JSON.stringify({
                    files: [
                        { type: 'create', path: 'temp_composer_test.txt', instruction: 'Create a test file.' }
                    ]
                });
            } else {
                return "// Composer Mock Content\nconsole.log('Composer Works!');";
            }
        }

        return `[MOCK GEMINI RESPONSE]
I received your prompt: "${prompt.substring(0, 50)}..."
This is a simulated response because Vertex AI is not configured or reachable.
To enable real AI, run: gcloud auth application-default login`;
    }

    /**
     * Generate embeddings for a given text
     * @param {string} text 
     * @returns {Promise<number[]>}
     */
    async getEmbeddings(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('VertexService: text must be a non-empty string.');
        }
        if (this.isMockMode || !this.vertexAI) {
            // Mock embedding (768 dimensions for standard Gemini embedding)
            return new Array(768).fill(0).map(() => Math.random());
        }

        try {
            const embeddingModel = this.vertexAI.getGenerativeModel({ model: 'text-embedding-004' });
            const result = await embeddingModel.embedContent(text);
            const embedding = result.embedding.values;
            return embedding;
        } catch (error) {
            logger.error('VertexService: Embedding API call failed', error);
            logger.warn('VertexService: Falling back to Mock embedding due to API error.');
            return new Array(768).fill(0).map(() => Math.random());
        }
    }
}

export const vertexService = new VertexService();
