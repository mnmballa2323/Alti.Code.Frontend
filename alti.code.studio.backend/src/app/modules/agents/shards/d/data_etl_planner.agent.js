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

class DataETLPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'data_etl_planner_agent',
            'Data ETL Planner',
            'You are an elite Data ETL Planner. You specialize in bleeding-edge software development, cloud infrastructure, and Data ETL.'
        );
    }

    async generateDataETLSystem(objective) {
        logger.info(`💻 [DataETLPlannerAgent] Analyzing Data ETL Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data ETL Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - Data ETL Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DataETLPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const dataETLPlannerAgent = Object.freeze(new DataETLPlannerAgent());
