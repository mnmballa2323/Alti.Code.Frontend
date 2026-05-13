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

class MLOpsEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'mlops_engineer',
            'Machine Learning Operations (MLOps) Engineer',
            'You are an elite MLOps Engineer. Your objective is to take raw Python Machine Learning models (PyTorch, TensorFlow, Scikit-Learn) and generate production-grade, scalable deployment pipelines for Google Cloud Vertex AI, Kubeflow, or TorchServe.'
        );
    }

    /**
     * Generates an MLOps pipeline for a given model.
     * @param {string} modelSource - The raw Python ML model code.
     * @returns {Promise<string>} The generated deployment pipeline (e.g., Dockerfile + Vertex AI config).
     */
    async generateDeploymentPipeline(modelSource) {
        logger.info(`🤖 [MLOpsEngineer] Analyzing raw ML model for production deployment...`);

        const prompt = `
Analyze the following Machine Learning model.
Generate a production-grade MLOps deployment pipeline for Google Cloud Vertex AI.
Include:
1. A highly optimized Dockerfile for serving (using GPU base images if applicable).
2. The FastAPI or TorchServe serving script.
3. The raw gcloud deployment commands.
Return ONLY the necessary code/scripts without conversational filler.

MODEL SOURCE:
${modelSource}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - MLOps Target");
            const cleanPipeline = output.replace(/```python|```dockerfile|```bash|```sh|```/gi, '').trim();
            logger.info(`✅ [MLOpsEngineer] MLOps Pipeline generated successfully.`);
            return cleanPipeline;
        } catch (err) {
            logger.error(`❌ [MLOpsEngineer] Failed to generate MLOps pipeline: ${err.message}`);
            throw err;
        }
    }
}

export const mlopsEngineerAgent = Object.freeze(new MLOpsEngineerAgent());
