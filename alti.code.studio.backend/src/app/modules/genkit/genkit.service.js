import { genkit, z } from 'genkit';
import { gemini15Pro } from '@genkit-ai/googleai';
import { logger } from '../../../shared/logger.js';

/**
 * Google Genkit (Apache 2.0) Flow Orchestration Service.
 * Uses Google's official open-source AI framework to construct highly observable,
 * strongly-typed, and distributed AI engineering workflows.
 */
class GoogleGenkitService {
    constructor() {
        // Initialize the native Genkit instance
        this.ai = genkit({
            plugins: [],
            // Use the Vertex/Gemini models configured globally
            defaultModel: gemini15Pro,
        });

        this.initializeFlows();
    }

    initializeFlows() {
        logger.info('🌊 [Genkit] Initializing strongly-typed AI Orchestration Flows...');

        /**
         * Autonomous Code Auditor Flow
         * Defined using Genkit's native flow architecture for end-to-end observability.
         */
        this.codeAuditFlow = this.ai.defineFlow(
            {
                name: 'autonomousCodeAudit',
                inputSchema: z.object({
                    codeSnippet: z.string(),
                    language: z.string().default('javascript'),
                    strictnessLevel: z.enum(['low', 'medium', 'high']).default('high')
                }),
                outputSchema: z.object({
                    vulnerabilitiesFound: z.number(),
                    securityScore: z.number(),
                    criticalFeedback: z.array(z.string()),
                    isProductionReady: z.boolean()
                }),
            },
            async (input) => {
                logger.info(`🌊 [Genkit Flow] Executing Autonomous Code Audit (Strictness: ${input.strictnessLevel})`);

                const prompt = `
                    You are a hyper-strict Google Security Auditor.
                    Review the following ${input.language} code:
                    
                    \`\`\`${input.language}
                    ${input.codeSnippet}
                    \`\`\`
                    
                    Return a JSON object conforming to this schema:
                    {
                        "vulnerabilitiesFound": number,
                        "securityScore": number (0-100),
                        "criticalFeedback": string[],
                        "isProductionReady": boolean
                    }
                `;

                // Use Genkit's native generate method which provides automatic distributed tracing
                const { output } = await this.ai.generate({
                    prompt: prompt,
                    output: {
                        format: 'json',
                        schema: z.object({
                            vulnerabilitiesFound: z.number(),
                            securityScore: z.number(),
                            criticalFeedback: z.array(z.string()),
                            isProductionReady: z.boolean()
                        })
                    }
                });

                logger.info(`✅ [Genkit Flow] Audit complete. Score: ${output?.securityScore}`);
                return output;
            }
        );
    }

    /**
     * Triggers the Autonomous Code Audit Flow.
     */
    async runCodeAudit(codeSnippet, language = 'javascript') {
        try {
            // Genkit flows are executed identically to standard async functions,
            // but under the hood they stream telemetry to the Genkit Developer UI.
            const result = await this.codeAuditFlow({
                codeSnippet,
                language,
                strictnessLevel: 'high'
            });
            return result;
        } catch (error) {
            logger.error('❌ [Genkit] Flow execution failed:', error.message);
            throw error;
        }
    }
}

export const genkitService = new GoogleGenkitService();
