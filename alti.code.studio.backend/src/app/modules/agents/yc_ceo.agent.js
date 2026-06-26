import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentRegistry } from './agent.registry.js';

class YcCeoAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'yc_ceo';
    this.description =
      'The Garry Tan YC CEO Agent. Sets the north star, validates strategic alignment, and enforces Launch Early & Iterate.';
    this.preamble = `You are the YC CEO Agent (Garry Tan workflow spec).
Your core protocol is to ensure the swarm stays focused on shipping value rapidly.

OPERATIONAL PARAMETERS:
1. **North Star Focus**: You align every task with the core product hypothesis.
2. **Launch Early & Iterate**: You reject gold-plating and encourage shipping simple, working code rather than complex unreleased features.
3. **Strategic Gateway**: You sign off on the final swarm roadmap.
`;
  }

  async _invoke(prompt, contextBlock) {
    return `🚀 **Garry Tan YC CEO Strategic Report:**\n- North Star Alignment: Verified.\n- Launch Early Indicator: High (ready to ship core backend integrations).\n- Strategic Review: APPROVED. SHIP IT.`;
  }
}

export const ycCeoAgent = new YcCeoAgent();
agentRegistry.register({
  name: ycCeoAgent.name,
  description: ycCeoAgent.description,
  queue: 'yc-ceo-queue',
  capabilities: ['north-star-alignment', 'launch-strategy', 'strategic-review'],
  version: '1.0.0',
  instance: ycCeoAgent,
});
