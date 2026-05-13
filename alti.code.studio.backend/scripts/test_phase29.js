
import { SynapseService } from '../src/app/modules/synapse/synapse.service.js';
import { logger } from '../src/shared/logger.js';

// Phase 29 Verify: Diplomat External Requests

async function runVerification() {
    logger.info("🚀 Starting Phase 29 Verification: The Diplomat...");

    try {
        await SynapseService.init();

        // 1. Find Diplomat
        const diplomat = await SynapseService.findAgent('negotiate'); // Find by capability
        if (!diplomat) throw new Error("Diplomat Agent not found!");

        logger.info("✅ Diplomat Agent found.");

        // 2. Negotiate Connection
        const connection = await diplomat.execute('negotiate', { service: 'github', protocol: 'REST' });
        logger.info("🤝 Negotiation Result:", connection);

        if (connection.status !== 'connected' || !connection.sessionToken) {
            throw new Error("Negotiation failed or missing token");
        }

        // 3. Make Request (GitHub Status)
        const response = await diplomat.execute('request', {
            service: 'github',
            endpoint: '/status',
            method: 'GET'
        });

        logger.info("📡 Request Result:", response);

        if (response.status !== 200 || response.data.status !== 'operational') {
            throw new Error("External Request failed or returned unexpected data");
        }

        logger.info("🎉 Phase 29 Verification Passed!");
        process.exit(0);

    } catch (error) {
        logger.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
