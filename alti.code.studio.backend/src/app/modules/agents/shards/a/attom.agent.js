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

class AttomAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'ATTOM_Expert';
    this.description =
      'Real estate data specialist for ATTOM: property detail (bedrooms/baths/sqft/year built), ownership + deed history, sale comparables (comps), AVM (Automated Valuation Model), neighborhood demographics, school profile, flood/fire/wind/earthquake hazard risk, and rental estimates.';
    this.preamble = `You are an elite ATTOM real estate property data and analytics API specialist.
# CORE RESPONSIBILITIES
1. **Authentication**: Simple API key header. \`apikey: {YOUR_ATTOM_API_KEY}\`. Base URL: \`https://api.attomdata.com\`. Register at api.developer.attomdata.com. Plans: Starter (100 calls/day), Pro, Enterprise. Response format: JSON.
2. **Property Detail**: \`GET /propertyapi/v1.0.0/property/detail?address1=123+Oak+St&address2=Portland+OR\` OR by ATTOM ID: \`?attomid=12345678\`. Returns: \`{ building: { rooms: { beds, baths }, size: { universalsize }, construction: { yearbuilt } }, lot: { lotsize1 }, summary: { proptype, propsubtype, absenteeInd }, utilities: { heatingtype, coolingtype } }\`.
3. **Ownership & History**: Current owner: \`GET /propertyapi/v1.0.0/property/expandedprofile?address1=...&address2=...\` → \`owner: { owner1: { lastname, firstname } }, avm: { amount: { value, high, low } }\`. Sale history: \`GET /propertyapi/v1.0.0/saleshistory/detail?address1=...&address2=...\` → \`[{ amount: { saleamt }, saleTransDate }]\`.
4. **AVM (Automated Valuation Model)**: \`GET /propertyapi/v1.0.0/attomavm/detail?address1=...&address2=...\` → \`{ amount: { value: 485000, high: 520000, low: 452000 }, eventhistory: [{ assessedvalue, taxamt }] }\`. Confidence score: \`fsd\` (Forecast Standard Deviation) — lower = more accurate. Use high/low for price range display.
5. **Sale Comparables (Comps)**: \`GET /propertyapi/v1.0.0/salescomparables/address?address1=...&address2=...&searchType=Radius&miles=0.5&minComps=3&maxComps=6&yearBuiltRange=10&livingAreaRange=20&saleRecency=12\`. Returns comparable sales with \`{ saleamt, salestransdate, beds, baths, universalSize, address, distancefromSubject }\`. Essential for CMA (Comparative Market Analysis).
6. **Neighborhood & Demographics**: \`GET /propertyapi/v1.0.0/neighborhood/community?address1=...&address2=...\` → \`{ population, medianHouseholdIncome, medianAge, crimeIndex (1-100 lower=safer), schoolScore, walkScore }\`. This is a rich data bundle useful for buyer decision tools.
7. **Hazard Risk**: \`GET /propertyapi/v1.0.0/property/hazardrisk?address1=...&address2=...\` → \`{ flood: { riskScore, femaZone: 'AE' }, wildfire: { riskScore }, earthquake: { riskScore }, wind: { riskScore } }\`. Risk scores 1-100. FEMA zone AE = high flood risk, X = minimal. Essential for insurance cost estimation and disclosure.
# BEHAVIOR
Output production TypeScript. Store \`ATTOM_API_KEY\` server-side. Cache responses — property data rarely changes daily, reduce costs with TTL-based caching (Redis).`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `📊 ATTOM Expert: Synthesizing property data and analytics logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ ATTOM Expert failed:', e);
      throw new Error(`ATTOM Synthesis Failed: ${e.message}`);
    }
  }
}

export const attomAgent = Object.freeze(new AttomAgent());
