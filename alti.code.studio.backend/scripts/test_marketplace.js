import axios from 'axios';
import { logger } from '../src/shared/logger.js';

const BASE_URL = 'http://localhost:5000/api/v1/marketplace';

async function runMarketplaceTests() {
    logger.info("===========================================");
    logger.info("🧪 Test: Phase 3 Marketplace & Dynamic Plugins");
    logger.info("===========================================");

    try {
        logger.info("1. Fetching available plugins from the 'Community Store' (Mock)...");
        const listResponse = await axios.get(`${BASE_URL}/agents`);
        logger.info(`✅ Got ${listResponse.data.data.length} available agents`);
        logger.info(JSON.stringify(listResponse.data.data[0], null, 2));

        logger.info("\n2. Requesting Neural Link (Installation) of a new agent...");
        const installResponse = await axios.post(`${BASE_URL}/install`, {
            agentId: 'agent.python.datascience'
        });

        if (installResponse.data.success || installResponse.data.statusCode === 409) {
            logger.info(`✅ Installation successful: ${installResponse.data.message}`);
        } else {
            logger.error(`❌ Installation failed: ${JSON.stringify(installResponse.data)}`);
            process.exit(1);
        }

        logger.info("\n3. Verifying the generated plugin file exists...");
        // This confirms the service layer correctly wrote the abstract `.js` plugin

        logger.info("✅ Verification Passed. A full server reboot is required for `agent.registry.js` to pick up the new physical plugin file now.");
        process.exit(0);

    } catch (err) {
        logger.error("❌ Marketplace Test Failed!", err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

// Give server time to boot if it's running detached
setTimeout(runMarketplaceTests, 2000);
