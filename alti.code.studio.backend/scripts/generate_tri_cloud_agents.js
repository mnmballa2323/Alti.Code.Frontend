import 'dotenv/config';
// Bootstrap patch for tink-crypto in Node.js
global.self = global;

import { selfExpandingSwarmService } from '../src/app/modules/agents/self_expanding_swarm.service.js';
import { logger } from '../src/shared/logger.js';

async function generate() {
    logger.info("🚀 Initiating generation of Tri-Cloud and Smart Routing specialized agents...");
    const targets = [
        "GCP Vertex AI Direct Connector Specialist",
        "AWS Bedrock Direct Connector Specialist",
        "Azure OpenAI Foundry Direct Connector Specialist",
        "Smart Routing Orchestration Optimizer"
    ];

    for (const target of targets) {
        logger.info(`🏭 Generating agent for: ${target}`);
        try {
            await selfExpandingSwarmService.synthesizeAgent(target, "Manual developer trigger");
            logger.info(`✅ Agent generated successfully for: ${target}`);
        } catch (error) {
            logger.error(`❌ Failed to generate agent for ${target}: ${error.message}`);
        }
    }
    logger.info("🎉 Generation of all specified agents completed!");
    process.exit(0);
}

generate();
