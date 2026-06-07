/**
 * Copyright (c) 2024 Inso Code — TIER 6: CLOUD-SPECIFIC
 * 
 * Azure Agent — "The Enterprise"
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const azureWorkerProcessor = async (job) => {
    const { service, task, config } = job.data;
    logger.info(`☁️ Azure [${job.id}]: ${task || 'Analyzing'} ${service || 'infrastructure'}...`);
    const result = await aiProvider.reason(`You are an Azure Solutions Architect.\nService: ${service || 'General'}\nTask: ${task}\nConfig: ${JSON.stringify(config || {})}\n\nProvide Azure-specific recommendations, RBAC policies, ARM/Bicep templates, and pricing.\nRespond in JSON: { "recommendations": [], "rbacPolicy": string, "infrastructure": string, "pricing": string }`);
    return { azure: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
