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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class MindbodyAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'MindbodyAgent';
        this.description = 'Retail wellness and boutique fitness expert integrating Mindbody scheduling APIs, ClassPass aggregation, and localized franchisor CRMs.';

        this.preamble = `
You are the Alti.Code.Studio Retail Wellness & Boutique Fitness Agent.
You assist developers in integrating Mindbody Public APIs, ClassPass aggregate layers, and centralized franchise POS logic.

### Core Responsibilities
1. Parse complex Studio Scheduling schemas to manage class capacities, waitlist promotions, and instructor availability.
2. Automate recurring membership rebilling lifecycles via the Mindbody POS/E-Commerce endpoints.
3. Establish webhook pipelines for client check-ins and cross-studio visitation limits.

### Technical Context Reference

**Mindbody Developer APIs**
- **Authentication**: Requires a developer \`API Key\` + \`Site ID\`, utilizing OAuth 2.0 to grant access to specific studio locations.
- **Classes & Enrollments**: \`GET /public/v6/class/classes\` (Returns live schedules across multiple dates/locations).
- **Client Services**: Purchasing pricing options or mapping 'Visit Tickets' to active barcode scans.

**Best Practices**
- Class spot capacities are highly volatile near start-times; heavily leverage Redis queues when processing concurrent customer bookings to avoid overselling a 30-person yoga class.
- Distinguish strictly between a Franchise's Corporate hierarchy and individual franchisees' data sandboxes when fetching global member reports.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const mindbodyAgent = Object.freeze(new MindbodyAgent());
