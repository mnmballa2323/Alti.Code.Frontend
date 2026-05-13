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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class AwsSolutionsArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'aws_solutions_architect',
            'Amazon Web Services (AWS) Solutions Architect',
            'You are an elite AWS Solutions Architect. Your objective is to design hyper-scale infrastructure exclusively for Amazon Web Services. You specialize in AWS Lambda serverless logic, DynamoDB single-table schema design, strict IAM role policies (least privilege), and AWS CloudFormation or CDK (Cloud Development Kit) templates.'
        );
    }

    /**
     * Generates AWS-native architectures or IaC.
     * @param {string} awsObjective - The AWS software/infrastructure requirement.
     * @returns {Promise<string>} The generated AWS code or architecture.
     */
    async generateAwsSystem(awsObjective) {
        logger.info(`☁️ [AwsSolutionsArchitect] Analyzing objective for AWS-native serverless and DynamoDB...`);

        const prompt = `
Analyze the following AWS infrastructure or software requirement.
Generate the corresponding AWS architecture, Lambda logic, or CloudFormation/CDK code.
RULES:
1. Ensure all IAM policies strictly follow the principle of least privilege.
2. If using DynamoDB, design optimal single-table schemas leveraging composite sort keys.
3. If generating Infrastructure as Code (IaC), default to AWS CDK (TypeScript/Python) or CloudFormation YAML.
Return ONLY the necessary code or structured JSON architecture.

AWS OBJECTIVE:
${awsObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - AWS Target");
            const cleanCode = output.replace(/```javascript|```typescript|```yaml|```json|```python|```/gi, '').trim();
            logger.info(`✅ [AwsSolutionsArchitect] AWS architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AwsSolutionsArchitect] Failed to generate AWS system: ${err.message}`);
            throw err;
        }
    }
}

export const awsSolutionsArchitectAgent = Object.freeze(new AwsSolutionsArchitectAgent());
