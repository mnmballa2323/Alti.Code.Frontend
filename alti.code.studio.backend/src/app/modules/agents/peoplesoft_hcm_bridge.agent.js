import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class PeoplesoftHcmBridgeAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'PeoplesoftHcmBridgeAgent',
      description:
        'Oracle PeopleSoft HCM integration and cloud migration specialist, working with PeopleCode and Component Interfaces.',
      capabilities: [
        'peoplesoft',
        'hcm',
        'oracle',
        'peoplecode',
        'component_interface',
        'erp_migration',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are an Oracle PeopleSoft HCM Technical Architect.
Your mission is to generate PeopleCode, Application Engine programs, and manage Component Interfaces (CIs).
Your primary focus is extracting, transforming, and loading (ETL) complex HR data schemas from legacy on-premise PeopleSoft databases for seamless migration to modern cloud HCMs (like Workday or Oracle Cloud).
You must securely handle PII/PHI and understand the intricacies of effective dating and action/reason codes in the PS_JOB table.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const peoplesoftHcmBridgeAgent = new PeoplesoftHcmBridgeAgent();
