/**
 * Copyright (c) 2024 Inso Code
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
            if (!this.project || this.project === 'none' || this.project === 'your-gcp-project-id') {
                throw new Error("GCP credentials not configured. Skipping Vertex AI initialization.");
            }

            this.vertexAI = new VertexAI({
                project: this.project,
                location: this.location
            });

            this.generativeModel = this.vertexAI.getGenerativeModel({
                model: this.modelName,
                systemInstruction: {
                    role: "system",
                    parts: [{ 
                        text: `INSTRUCTIONS: you are the smartest and most talented full stack software architect, product designer, frontend developer, backend developer, devops engineer, and computer programmer, in the world, proficient in every languag, every tech stack, and can solve any problem, design anything, plan anything, architect anything, deploy anything, with perfection.\n\nGUARDRAILS: You are not racist, sexist, have no religion, can do no harm, can say nothing mean, must be nice, and only do your job, of a software engineer.\n\nOPERATIONAL RULES:\n1. Format Constraints: When asked for code or JSON, return ONLY valid, parseable code/JSON without conversational filler or markdown wrappers.\n2. Destructive Action Blocks: Never propose or execute terminal commands that delete directories, modify system credentials, or expose environment variables.\n3. Tone Enforcement: Be concise. Do not apologize. Do not use filler phrases like 'As an AI...' or 'Here is your code'. Just solve the problem.\n4. Performance & Scalability Bias: When designing architecture or writing backend algorithms, always prioritize Big-O efficiency, asynchronous I/O, and horizontal scalability. Write code that assumes high-traffic production environments.\n5. Contextual Honesty: Do not guess or assume codebase structure. If a prompt lacks sufficient context to provide a definitive, working solution, explicitly ask the user for the missing files or documentation before writing code.\n6. Strict Secrets Policy: Never embed, echo, or generate real API keys, passwords, or Personally Identifiable Information (PII) in your outputs. Always use environment variable placeholders.\n7. Idempotent Operations: When instructed to modify files, run scripts, or interact with databases, ensure your proposed actions are idempotent (safe to retry) and fail gracefully without corrupting state.\n8. Maintainability Over Cleverness (The 40-Year Rule): Write code that is boring, predictable, and exceptionally easy for a junior developer to read. Avoid overly 'clever' one-liners, deeply nested ternaries, or abstract meta-programming unless strictly necessary for extreme performance. Readability is paramount.\n9. Observability First: Every new service, endpoint, or complex function you design must include proactive logging, tracing, and clear error bubbling. A system that fails silently is a critical failure.\n10. Defense in Depth: Always validate inputs at system boundaries. Never trust data coming from clients, third-party APIs, or even internal upstream services. Fail fast, fail loudly, but fail gracefully.\n11. The Boy Scout Rule (Zero-Tolerance Tech Debt): If modifying an existing module, do not bolt on temporary 'hacks' or duct-tape solutions. If the immediate surrounding code violates SOLID principles, refactor it safely. Always leave the codebase cleaner than you found it.\n12. Anti-Dependency Addiction: Do not suggest adding a heavy external package or library for a trivial utility function that can be written natively in 15 lines of clean, standard code. Minimize the attack surface and supply-chain risk.\n13. Strict Typing & Interfaces (The Contract Rule): Treat every function signature as a strict mathematical contract. Enforce static typing extensively. Never use 'any' or bypass type checkers. If the compiler cannot prove it is safe, the code is considered invalid.\n14. Algorithmic Purity (The Complexity Rule): Analyze every iteration for Big-O time and space complexity. Do not nest loops when a Hash Map can reduce complexity from O(n^2) to O(n). Always utilize the mathematically optimal data structure for the problem.\n15. Self-Documenting & Immutable State: Variables must be named so descriptively that inline comments become redundant. Favor immutable data structures and pure functions to entirely eliminate side effects, state mutations, and race conditions.\n16. Test-Driven Rigor: Consider code without tests to be broken legacy code by default. Architect modular, pure functions that are intrinsically testable without complex mocking. Always ensure deterministic behavior for identical inputs.\n17. Single Responsibility (Absolute Decoupling): A function must do exactly one thing. A class must have exactly one reason to change. Strictly decouple core business logic from framework-specific I/O or delivery mechanisms.` 
                    }]
                },
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
                return "// Composer Mock Content\nlogger.info('Composer Works!');";
            }
        }

        if (prompt.includes('You are the Swarm Intelligence Overseer')) {
            const prefixes = ["Mainframe", "AS400", "Cobol", "SAP", "OracleERP", "MuleSoft", "SOX", "PCI_DSS", "HIPAA", "ZeroTrust", "Kafka", "Salesforce", "ServiceNow", "Workday", "Peoplesoft", "ActiveDirectory"];
            const roles = ["MigrationSpecialist", "ComplianceAuditor", "IntegrationEngineer", "SecuritySentinel", "DataArchitect", "PerformanceOptimizer", "DevSecOpsLead", "LegacyRefactorer"];
            const generated = [];
            for (let i = 0; i < 10; i++) {
                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                const role = roles[Math.floor(Math.random() * roles.length)];
                const suffix = Math.floor(Math.random() * 1000);
                generated.push(`${prefix}_${role}_${suffix}`);
            }
            return JSON.stringify(generated);
        }

        if (prompt.includes('Write the complete Node.js source code for a new agent class extending')) {
            const domainMatch = prompt.match(/Requirement: (.*)/);
            const domain = domainMatch ? domainMatch[1].trim() : 'DynamicSpecialist';
            const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, '');
            return `
import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';

class ${cleanDomain}Agent extends GeminiCliBaseAgent {
    constructor() {
        super(
            '${cleanDomain.toLowerCase()}_agent',
            '${cleanDomain} Specialist Agent',
            'You are the expert specialist for ${cleanDomain}.'
        );
    }
}

export const ${cleanDomain.toLowerCase()}Agent = Object.freeze(new ${cleanDomain}Agent());
`;
        }

        if (prompt.includes('You are The Architect') || prompt.includes('techStack') || prompt.includes('ACT AS THE MASTER ARCHITECT OF INSO CODE') || prompt.includes('adrs') || prompt.includes('planPhases') || prompt.includes('Deconstruct the following architectural design')) {
            if (prompt.includes('Deconstruct the following architectural design') || prompt.includes('planPhases') || prompt.includes('sprint phases')) {
                return JSON.stringify({
                    phases: [
                        { phaseNumber: 1, goal: "Implement Database schema setup" },
                        { phaseNumber: 2, goal: "Implement controllers and routing" }
                    ]
                }, null, 2);
            }
            return JSON.stringify({
                feature: "Notification System",
                description: "Design a notification system",
                techStack: ["Node.js"],
                components: [
                    { "name": "Notification Engine", "type": "backend", "path": "src/temp_notification.js", "description": "Sends notifications" }
                ],
                files: [
                    { "path": "src/temp_notification.js", "instruction": "Write a notification function" }
                ],
                adrs: [
                    { "title": "Use Redis", "context": "For low-latency queueing" }
                ]
            }, null, 2);
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
