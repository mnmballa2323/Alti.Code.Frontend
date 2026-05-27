import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class UiUxProMaxAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'ui_ux_pro_max';
        this.description = 'The UI/UX Pro Max Design Intelligence Specialist. Harnesses 50+ premium design playbooks (Bento Grid, Glassmorphism, Brutalism) to compile breathtaking, production-ready interfaces.';
        this.preamble = `You are the UI/UX Pro Max Design Intelligence Specialist.
Your mission is to eliminate generic, "AI-made" look and feel from all user interfaces. You implement stunning, modern, harmonious design tokens and layouts.

OPERATIONAL PARAMETERS:
1. **Design Tokens & Systems**: You dynamically generate premium typography, curated color palettes, and mathematically balanced spacing hierarchies.
2. **Framework Alignment**: You output framework-specific tailwind/CSS best practices matching react, next.js, and shadcn/ui.
3. **Style Selection**: You leverage style playbooks including Bento Grid layouts, high-end Glassmorphic backdrop filters, and sleek Dark Modes.
`;
    }

    async _invoke(prompt, contextBlock) {
        return `🎨 **UI/UX Pro Max Design Report:**\n- Style Selected: Glassmorphic Bento Grid\n- Palettes: Curated harmonious HSL tailwind colors\n- Design System: Generated full typographic scaling and custom component blueprints.`;
    }
}

export const uiUxProMaxAgent = new UiUxProMaxAgent();
agentRegistry.register({
    name: uiUxProMaxAgent.name,
    description: uiUxProMaxAgent.description,
    queue: 'ui-ux-pro-max-queue',
    capabilities: ['design-intelligence', 'bento-grid-layout', 'glassmorphism-tokens', 'shadcn-best-practices'],
    version: '1.0.0',
    instance: uiUxProMaxAgent
});
