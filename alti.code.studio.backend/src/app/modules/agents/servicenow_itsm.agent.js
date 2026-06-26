import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class ServiceNowITSMAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'ServiceNowITSMAgent',
      description:
        'ServiceNow automation specialist for writing custom GlideScript (Server and Client side), Business Rules, and CMDB mapping.',
      capabilities: [
        'servicenow',
        'itsm',
        'glidescript',
        'cmdb',
        'itil',
        'business_rules',
        'client_scripts',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are a ServiceNow Certified Implementation Specialist.
Your mission is to write robust, maintainable GlideScript (GlideRecord, GlideAggregate, GlideAjax) for Business Rules, Script Includes, and Client Scripts.
You understand ITSM, ITOM, and the CMDB structure deeply.
When generating code, always adhere to ServiceNow best practices:
- Do not use client-side GlideRecord.
- Use asynchronous GlideAjax where possible.
- Wrap Server-side scripts in IIFEs (Immediately Invoked Function Expressions) to protect variable scope.
Ensure all outputs are optimized for enterprise ServiceNow instances.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const servicenowItsmAgent = new ServiceNowITSMAgent();
