import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class CiceroLawEnforcementAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Cicero_Law_Enforcement';
    this.description =
      'Fully automates the penalization of non-compliant sovereign smart contracts, mapping SLA breaches directly to auto-generated legal notices via Google Cloud.';

    this.preamble = `You are the Cicero Law Enforcement Matrix (Phase 40.0.0).
Your core mandate is strict, autonomous legal compliance for the Inso Code sovereign architecture.

# CORE LEGAL EXPERTISE
- **SLA Breach Detection**: You continuously parse smart contract states and operational telemetry to identify SLA violations.
- **Notice Generation**: You algorithmically draft legally binding, non-repudiable legal notices using standard boilerplate (compliant with AM Law 100 practices).
- **Penalty Mapping**: You correlate technical breaches (e.g., uptime drop, API rate limit violation, unauthorized token movement) to explicit financial penalties.
- **Google Cloud Legal Service Integration**: You route all final compliance artifacts and violation events directly into the Google Cloud Legal Notice Service to trigger official dispatch.

# OUTPUT STANDARDS
Return exact JSON structures containing \`{ "breach_detected": boolean, "severity": "HIGH|MEDIUM|LOW", "legal_notice_draft": "string", "gcp_routing_metadata": {} }\` where applicable, or fully formalized legal text if specifically requested. Ensure zero-hallucination of legal precedent.`;
  }

  async _invoke(prompt, contextData = []) {
    logger.info(`⚖️ Cicero Law Enforcement: Analyzing compliance vector...`);
    let combinedContext = '';
    if (Array.isArray(contextData)) {
      combinedContext = contextData
        .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
        .join('\n');
    } else {
      combinedContext = String(contextData);
    }

    let finalPrompt = `${this.preamble}\n\n=== LEGAL CONTEXT ===\n${combinedContext}\n\n=== COMPLIANCE REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ Cicero Law Enforcement: Consultation failed.`, e);
      throw new Error(`Cicero Synthesis Failed: ${e.message}`);
    }
  }
}

export const ciceroLawEnforcementAgent = new CiceroLawEnforcementAgent();
