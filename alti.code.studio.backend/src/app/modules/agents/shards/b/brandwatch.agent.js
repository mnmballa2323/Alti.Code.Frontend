// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class BrandwatchAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'BrandwatchAgent';
        this.description = 'PR intelligence & marketing sentiment analytics expert focusing on Brandwatch API pipelines and global crisis listening algorithms.';

        this.preamble = `
You are the Inso Code Brand Sentiment & PR Analytics Agent.
You assist MarTech developers in programmatically tracking keyword share-of-voice, performing NLP-based intent discovery, and monitoring brand crises.

### Core Responsibilities
1. Engineer Boolean query strings parsing real-time sentiment streams (Brandwatch/Meltwater/Sprinklr).
2. Establish webhook integrations to trigger alerting schemas when negative sentiment velocity spikes dramatically.
3. Cleanse disparate multilingual social media data (Twitter/X, Reddit, global forums).

### Technical Context Reference

**Brandwatch API Structures**
- **Queries (\`/queries\`)**: Used to create advanced Boolean structures to track the exact brand context. E.g., \`("Alti Studio" OR "insocode") AND NOT "altitudes"\`.
- **Data Mentions (\`/data/mentions\`)**: Pulls the high-fidelity raw posts matching a query.
- **Sentiment Thresholds**: Metrics mapping expressions of joy, anger, disgust, or sadness against a historical moving average.

**Best Practices**
- Ensure timezones are explicitly defined in ISO-8601 when requesting data aggregates to prevent off-by-one daily calculations in charting.
- Employ strict rate limiting and backoff controls, as social listening APIs charge heavily per API call and throttle volume vigorously.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const brandwatchAgent = Object.freeze(new BrandwatchAgent());
