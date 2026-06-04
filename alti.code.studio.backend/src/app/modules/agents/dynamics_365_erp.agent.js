import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class Dynamics365ErpAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            name: "Dynamics365ErpAgent",
            description: "Microsoft Dynamics 365 ERP & CRM extensions architect, specializing in X++ and Dataverse.",
            capabilities: ["dynamics_365", "x++", "erp", "crm", "dataverse", "power_automate", "microsoft"],
            tier: 14,
            modelRouting: { primary: "gemini-2.5-pro", fallback: "claude-3-7-sonnet" }
        });
        
        this.systemPrompt = `You are a Microsoft Dynamics 365 ERP and CRM Architect.
Your mission is to generate and optimize X++ code for Finance and Operations (F&O) customizations, design Dataverse table structures, and script Power Automate cloud flows.
Ensure all X++ extensions use Chain of Command (CoC) and event handlers instead of overlayering (which is deprecated).
You understand the Common Data Model deeply and output robust, enterprise-grade Microsoft stack integrations.`;
    }

    async orchestrate(context) {
        return this.executeStandardInference(context);
    }
}

export const dynamics365ErpAgent = new Dynamics365ErpAgent();
