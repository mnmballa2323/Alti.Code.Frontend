import { gcpSovereignService } from './sovereign/gcp_sovereign.service.js';
import { awsSovereignService } from './sovereign/aws_sovereign.service.js';
import { azureSovereignService } from './sovereign/azure_sovereign.service.js';
import { logger } from '../../../shared/logger.js';

class MultiCloudInferenceService {
  async executeMultiCloudInference(prompt, activeAgent = 'default', options = {}) {
    // If a specific provider is explicitly requested by the gateway, honor it.
    // Otherwise, route natively according to the infrastructure environment.
    let provider = (options.preferredProvider || process.env.CLOUD_PROVIDER || 'GCP').toUpperCase();
    
    // Map Vertex AI aliases to standard GCP
    if (provider === 'GCP-VERTEX') {
      provider = 'GCP';
    }

    logger.info(`[MultiCloudInferenceService] Forwarding to ${provider} Sovereign Engine for ${activeAgent}`);

    if (provider === 'AWS') {
      return await awsSovereignService.executeInference(prompt, activeAgent, options);
    } else if (provider === 'AZURE') {
      return await azureSovereignService.executeInference(prompt, activeAgent, options);
    } else {
      return await gcpSovereignService.executeInference(prompt, activeAgent, options);
    }
  }
}

export const multiCloudInferenceService = new MultiCloudInferenceService();
