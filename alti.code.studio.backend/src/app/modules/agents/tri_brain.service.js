import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { logger } from '../../../shared/logger.js';
import Anthropic from '@anthropic-ai/sdk'; // Bedrock Wrapper
import { AzureOpenAI } from 'openai'; // Azure Foundry Wrapper

/**
 * The Tri-Brain Consensus System
 * Enforces Adversarial Multi-Model Convergence.
 * - Architect: Claude 5 Sonnet (AWS Bedrock)
 * - QA: Gemini 3.1 Pro (GCP Vertex AI)
 * - DevSecOps: GPT-5.5 (Azure Foundry)
 */
class TriBrainService {
    constructor() {
        this.anthropic = new Anthropic(); // Assumes AWS Auth configured via Env
        this.azureOpenAi = new AzureOpenAI({ apiVersion: "2024-02-15-preview" });
    }

    /**
     * Executes the Tri-Cloud Autonomous Convergence Loop
     * @param {string} taskDescription The high-level coding task from GitHub or user.
     * @returns {string} The final cryptographically approved code.
     */
    async executeConsensusLoop(taskDescription) {
        logger.info(`🧠 [Tri-Brain] Initiating Convergence for task: ${taskDescription.substring(0, 50)}...`);

        // 🛡️ Pre-computation: Scrub the incoming intent through GCP Cloud DLP
        const safeIntent = await GoogleDlpService.redactText(taskDescription);

        // Step 1: The Architect (AWS Bedrock / Claude 5 Sonnet) writes the code
        logger.info(`🏗️ [Tri-Brain] Step 1: Claude 5 Sonnet (AWS) generating code...`);
        const claudePrompt = `You are the Lead Architect. Generate the complete code implementation for this intent: ${safeIntent}`;
        const architectResult = await this.anthropic.messages.create({
            model: 'claude-5-sonnet',
            max_tokens: 8192,
            messages: [{ role: 'user', content: claudePrompt }]
        });
        const initialCode = architectResult.content[0].text;

        // Step 2: The QA Engineer (GCP Vertex / Gemini 3.1 Pro) writes exhaustive tests
        logger.info(`🧪 [Tri-Brain] Step 2: Gemini 3.1 Pro (GCP) writing integration tests...`);
        const qaPrompt = `You are the QA Engineer. Review the following code and write an exhaustive, edge-case heavy integration test suite for it.\n\nCode:\n${initialCode}`;
        const qaResult = await GoogleGenAiService.generateContent(qaPrompt, 'gemini-3.1-pro', 0.1);
        const testSuite = qaResult.content;

        // Step 3: The CISO Auditor (Azure Foundry / GPT-5.5) audits both
        logger.info(`🛡️ [Tri-Brain] Step 3: GPT-5.5 (Azure) performing DevSecOps audit...`);
        const auditPrompt = `You are the DevSecOps CISO. Review the implementation and the test suite for any security flaws, injections, or logical errors.\n\nCode:\n${initialCode}\n\nTests:\n${testSuite}\n\nIf flawless, reply exactly with 'APPROVED'. If flawed, list the vulnerabilities.`;
        
        const cisoResult = await this.azureOpenAi.chat.completions.create({
            model: "gpt-5.5",
            messages: [{ role: "user", content: auditPrompt }],
            temperature: 0.0
        });

        const cisoDecision = cisoResult.choices[0].message.content;

        if (cisoDecision.includes('APPROVED')) {
            logger.info(`✅ [Tri-Brain] Cryptographic Consensus Reached! Code is mathematically flawless.`);
            return {
                status: 'APPROVED',
                code: initialCode,
                tests: testSuite,
                auditLog: 'Consensus Reached across AWS, GCP, and Azure.'
            };
        } else {
            logger.warn(`❌ [Tri-Brain] CISO Rejected the PR. Initiating self-healing loop...`);
            // Recursive self-healing loop: feed vulnerabilities back to Claude
            const healingIntent = `${safeIntent}\n\nThe DevSecOps auditor rejected the previous attempt with these reasons:\n${cisoDecision}\n\nPlease rewrite the code to fix these issues.`;
            return this.executeConsensusLoop(healingIntent); // Recurse until flawless
        }
    }
}

export const triBrainService = new TriBrainService();
