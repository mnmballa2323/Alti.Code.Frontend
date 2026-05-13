/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 1: CODE INTELLIGENCE
 * 
 * Debug Agent — "The Detective"
 * AI-powered root cause analysis and automated debugging.
 */
import { detectiveAgent } from '../agents/detective.agent.js';
import { logger } from '../../../shared/logger.js';

export const debugWorkerProcessor = async (job) => {
    const { error, stackTrace, code } = job.data;
    logger.info(`🐛 DebugWorker [${job.id}]: Delegating to DetectiveAgent...`);

    const analysis = await detectiveAgent.investigateIncident(error, stackTrace, code);

    return { error, analysis };
};
