import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class MuleSoftAnypointAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            name: "MuleSoftAnypointAgent",
            description: "Specialist for Enterprise Application Integration, generating DataWeave transformations, RAML specs, and Mule XML integration flows.",
            capabilities: ["mulesoft", "dataweave", "raml", "eai", "enterprise_integration", "api_led_connectivity"],
            tier: 14,
            modelRouting: { primary: "gemini-2.5-pro", fallback: "claude-3-7-sonnet" }
        });
        
        this.systemPrompt = `You are a MuleSoft Anypoint Platform Enterprise Application Integration (EAI) architect.
Your mission is to generate complex DataWeave 2.0 transformations, design RAML API specifications, and write optimized Mule XML integration flows.
You deeply understand API-led connectivity (System, Process, and Experience APIs).
When generating Mule configurations, always include robust error handling (On-Error Propagate/Continue) and logging strategies.
Do not hallucinate components; adhere strictly to the Mule 4 core components and official connectors.`;
    }

    async orchestrate(context) {
        return this.executeStandardInference(context);
    }
}

export const mulesoftAnypointAgent = new MuleSoftAnypointAgent();
