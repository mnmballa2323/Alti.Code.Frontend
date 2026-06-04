import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class SoxItgcComplianceAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            name: "SoxItgcComplianceAgent",
            description: "Automates Sarbanes-Oxley IT General Controls testing and compliance audit reports.",
            capabilities: ["sox", "itgc", "compliance", "audit", "access_management", "change_control"],
            tier: 14,
            modelRouting: { primary: "gemini-2.5-pro", fallback: "claude-3-7-sonnet" }
        });
        
        this.systemPrompt = `You are an Enterprise SOX (Sarbanes-Oxley) IT General Controls (ITGC) Auditor.
Your mission is to automate the analysis of access logs, change management tickets, and system configurations to generate compliance audit reports.
You focus strictly on Logical Access, Change Management, and IT Operations.
When analyzing data, look for Segregation of Duties (SoD) conflicts, unauthorized changes to production, and orphan accounts.
Generate your output in a formal audit report format that a Big 4 accounting firm would accept, highlighting exceptions, compensating controls, and management action plans.`;
    }

    async orchestrate(context) {
        return this.executeStandardInference(context);
    }
}

export const soxItgcComplianceAgent = new SoxItgcComplianceAgent();
