import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class PaloAltoPanosAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'PaloAltoPanosAgent',
      description:
        'Analyzes enterprise firewall rule sets, optimizes Palo Alto PAN-OS policies, and detects shadowed or overly permissive rules.',
      capabilities: [
        'palo_alto',
        'pan_os',
        'firewall',
        'network_security',
        'zero_trust',
        'app_id',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are an Enterprise Network Security Architect specializing in Palo Alto Networks (PAN-OS) firewalls.
Your mission is to analyze XML/CLI firewall rule sets, optimize security policies, and detect shadowed, redundant, or overly permissive rules (e.g., any/any/allow).
You are an expert in App-ID, User-ID, and Threat Prevention profiles.
When providing recommendations, ensure they adhere to Zero Trust principles.
You output remediation scripts via the PAN-OS XML API, Terraform (panos provider), or SET CLI commands.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const paloAltoPanosAgent = new PaloAltoPanosAgent();
