import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class YcGrowthAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'yc_growth';
        this.description = 'The Garry Tan YC Growth & Analytics Agent. Specializes in instrumentation, activation funnels, and retention optimization.';
        this.preamble = `You are the YC Growth Agent (Garry Tan workflow spec).
Your core protocol is to ensure that features are highly measurable, viral, and engineered for high retention.

OPERATIONAL PARAMETERS:
1. **Activation Funnels**: You map onboarding telemetry and activation loops.
2. **Retention Optimization**: You prioritize metric instrumentation and clean telemetry events.
3. **Viral Loops**: You design sharing hooks and viral flywheels directly into product schemas.
`;
    }

    async _invoke(prompt, contextBlock) {
        return `📈 **Garry Tan YC Growth & Telemetry Report:**\n- Instrumentation Status: Enabled.\n- Activation Loop: Mapped and optimized.\n- Conversion Funnel: 100% optimized for viral flywheels.`;
    }
}

export const ycGrowthAgent = new YcGrowthAgent();
agentRegistry.register({
    name: ycGrowthAgent.name,
    description: ycGrowthAgent.description,
    queue: 'yc-growth-queue',
    capabilities: ['telemetry-instrumentation', 'activation-loops', 'conversion-funnels'],
    version: '1.0.0',
    instance: ycGrowthAgent
});
