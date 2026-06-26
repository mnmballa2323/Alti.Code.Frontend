/**
 * Copyright (c) 2024 Inso Code — TIER 6: CLOUD-SPECIFIC
 *
 * GCP Agent — "The Hyperscaler"
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const gcpWorkerProcessor = async job => {
  const { service, task, config } = job.data;
  logger.info(
    `☁️ GCP [${job.id}]: ${task || 'Analyzing'} ${service || 'infrastructure'}...`,
  );
  const result = await aiProvider.reason(
    `You are a Google Cloud Platform (GCP) Solutions Architect.\nService: ${service || 'General'}\nTask: ${task}\nConfig: ${JSON.stringify(config || {})}\n\nProvide GCP-specific recommendations, Service Accounts, Terraform variables, and pricing.\nRespond in JSON: { "recommendations": [], "serviceAccounts": string, "infrastructure": string, "pricing": string }`,
  );
  return { gcp: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
