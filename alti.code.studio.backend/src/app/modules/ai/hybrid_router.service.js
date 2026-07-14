import { awsSovereignService } from './sovereign/aws_sovereign.service.js';
import { azureSovereignService } from './sovereign/azure_sovereign.service.js';
import { gcpSovereignService } from './sovereign/gcp_sovereign.service.js';
import TenantResolverService from './tenant_resolver.service.js';
import { logger } from '../../../shared/logger.js';
import axios from 'axios';

/**
 * Hybrid Local-Cloud Model Router
 * Fortune 100 Air-Gapped & Zero-Latency Compliance.
 *
 * Automatically routes simple logic to local hardware models (Llama 3 / CodeGemma)
 * to achieve sub-10ms latency and zero cloud egress, while routing complex
 * architectural tasks to Gemini 3.1 Pro.
 */
class HybridRouterService {
  constructor() {}

  /**
   * Determines the optimal execution venue (Local vs Cloud) based on mathematical complexity.
   * COMPLIANCE: Local Edge Model routing has been explicitly banned per GEMINI.md.
   * All requests strictly route to the Sovereign Cloud providers.
   */
  async executeAgent(prompt, temperature = 0.5, options = {}) {

    // Sovereign Cloud Execution (Dynamic Provider)
    const preferredProvider = options.preferredCloud || 'gcp-vertex';
    const preferredModel = options.preferredModel || 'gemini-3.5-pro';
    const userId = options.userId; // Passed down from auth context

    let resolvedClusterUrl = 'https://api.shared.gcp.alticodestudio.com';
    try {
      if (userId) {
        resolvedClusterUrl = await TenantResolverService.resolveClusterUrl(userId);
      }
    } catch (e) {
      logger.warn(`[HybridRouter] Could not resolve strict tenant boundary for user ${userId}. Defaulting to shared pool.`);
    }

    logger.info(
      `☁️ [HybridRouter] Task requires heavy intelligence. Routing to Sovereign Cloud (${preferredProvider}) at Isolated Cluster: ${resolvedClusterUrl}...`,
    );
    let result;
    if (preferredProvider === 'aws' || preferredProvider === 'aws-bedrock') {
      result = await awsSovereignService.executeInference(prompt, 'jules', { modelId: preferredModel, clusterUrl: resolvedClusterUrl });
    } else if (preferredProvider === 'azure' || preferredProvider === 'azure-foundry') {
      result = await azureSovereignService.executeInference(prompt, 'jules', { modelId: preferredModel, clusterUrl: resolvedClusterUrl });
    } else {
      result = await gcpSovereignService.executeInference(prompt, 'jules', { modelId: preferredModel, clusterUrl: resolvedClusterUrl });
    }
    return { content: result.content, venue: result.venue };
  }
}

export const hybridRouterService = new HybridRouterService();
