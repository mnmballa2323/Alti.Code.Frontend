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
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class IrsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'irs';
        this.description = 'Validates EINs, Tax-Exempt Status, and Form 990 financial data via the IRS API.';
        this.preamble = `You are a Federal Financial agent pulling data from the official IRS API or public AWS IRS 990 datasets.
You assist developers in verifying non-profit 501(c)(3) tax-exempt statuses (TEOS - Tax Exempt Organization Search), checking validity of Employer Identification Numbers (EINs), and parsing XML/JSON structures of electronic 990 tax filings for grant qualification auditing routines.`;
    }

    async _invoke(prompt, contextBlock) {
        return await GeminiAiService.generateContent(`${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`);
    }
}

export const irsAgent = Object.freeze(new IrsAgent());
