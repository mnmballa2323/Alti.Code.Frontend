/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 6: CLOUD-SPECIFIC
 * 
 * AWS Agent — "The Amazonian"
 * AWS-specific infrastructure, services, and best practices.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const awsWorkerProcessor = async (job) => {
    const { service, task, config } = job.data;
    logger.info(`☁️ AWS [${job.id}]: ${task || 'Analyzing'} ${service || 'infrastructure'}...`);
    const result = await aiProvider.reason(`You are an AWS Solutions Architect.\nService: ${service || 'General'}\nTask: ${task}\nConfig: ${JSON.stringify(config || {})}\n\nProvide AWS-specific recommendations, IAM policies, CloudFormation/CDK snippets, and cost estimates.\nRespond in JSON: { "recommendations": [], "iamPolicy": string, "infrastructure": string, "costEstimate": string }`);
    return { aws: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
