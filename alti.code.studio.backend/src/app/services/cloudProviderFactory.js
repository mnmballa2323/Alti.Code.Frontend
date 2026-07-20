/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

/**
 * CloudProviderFactory implements the Omni-Economy cloud-agnostic abstraction.
 * It enforces strict routing of models to authorized enterprise clouds:
 * - Gemini -> Google Cloud Vertex AI
 * - Claude -> AWS Bedrock
 * - GPT -> Azure AI Foundry
 */
class CloudProviderFactory {
  /**
   * Retrieves the specific cloud provider endpoint config for a given model.
   * @param {string} modelName - The model identifier (e.g., 'gemini-3.5-pro', 'gpt-5.4')
   * @returns {Object} The provider configuration
   */
  static getProvider(modelName) {
    if (!modelName) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Model name is required for inference routing');
    }

    const normalizedModel = modelName.toLowerCase();

    if (normalizedModel.includes('gemini')) {
      return {
        provider: 'Google Cloud Vertex AI',
        // Mock configurations for the Strategy pattern implementation
        endpoint: 'https://us-central1-aiplatform.googleapis.com',
        authType: 'GCP_SERVICE_ACCOUNT',
        region: 'us-central1'
      };
    }

    if (normalizedModel.includes('claude')) {
      return {
        provider: 'AWS Bedrock',
        endpoint: 'https://bedrock-runtime.us-east-1.amazonaws.com',
        authType: 'AWS_IAM',
        region: 'us-east-1'
      };
    }

    if (normalizedModel.includes('gpt')) {
      return {
        provider: 'Azure AI Foundry',
        endpoint: 'https://alti-openai-eus.openai.azure.com',
        authType: 'AZURE_AD',
        region: 'eastus'
      };
    }

    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Model '${modelName}' is not authorized on the multi-cloud compliant infrastructure.`
    );
  }
}

export const cloudProviderFactory = CloudProviderFactory;
