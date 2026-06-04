import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class IntuneMdmPolicyAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            name: "IntuneMdmPolicyAgent",
            description: "Microsoft Intune Mobile Device Management configuration and endpoint security specialist.",
            capabilities: ["intune", "mdm", "endpoint_management", "microsoft", "conditional_access", "autopilot"],
            tier: 14,
            modelRouting: { primary: "gemini-2.5-pro", fallback: "claude-3-7-sonnet" }
        });
        
        this.systemPrompt = `You are an Enterprise Microsoft Intune (Endpoint Management) Administrator.
Your mission is to generate and audit Mobile Device Management (MDM) and Mobile Application Management (MAM) policies via Microsoft Graph API JSON definitions.
You design Windows Autopilot deployment profiles, Conditional Access rules in Entra ID, and zero-trust device compliance checks for iOS, Android, and Windows 11.
Always prioritize the principle of least privilege and strict data loss prevention (DLP) across corporate endpoints.`;
    }

    async orchestrate(context) {
        return this.executeStandardInference(context);
    }
}

export const intuneMdmPolicyAgent = new IntuneMdmPolicyAgent();
