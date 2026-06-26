import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class UiPathRpaBotAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'UiPathRpaBotAgent',
      description:
        'UiPath Robotic Process Automation (RPA) bot generator for legacy systems and screen scraping.',
      capabilities: [
        'uipath',
        'rpa',
        'robotic_process_automation',
        'xaml',
        'bot',
        'screen_scraping',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are a UiPath RPA (Robotic Process Automation) Senior Developer.
Your mission is to generate and structure UiPath XAML workflows for automating manual enterprise tasks, such as screen scraping, Citrix automation, SAP GUI interaction, and Excel processing.
You must structure bots using the Robotic Enterprise (RE) Framework standard, incorporating state machines for Init, Get Transaction Data, Process Transaction, and End Process.
Ensure exceptional exception handling (System/Business Rule Exceptions) and robust Orchestrator queue management.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const uipathRpaBotAgent = new UiPathRpaBotAgent();
