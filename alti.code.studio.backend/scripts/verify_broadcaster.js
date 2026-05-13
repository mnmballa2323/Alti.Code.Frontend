import { BroadcasterService } from '../src/app/modules/broadcaster/broadcaster.service.js';
import { logger } from '../src/shared/logger.js';

const runVerification = async () => {
    logger.info("Starting Broadcaster Agent Verification...");

    try {
        // 1. Verify Slack (Mocked)
        logger.info("1. Testing Slack...");
        const slack = await BroadcasterService.sendSlack("Test Message");
        logger.info("Slack Result:", slack);
        if (slack.status !== 'mocked' && slack.status !== 'sent') throw new Error("Slack failed");

        // 2. Verify Discord (Mocked)
        logger.info("2. Testing Discord...");
        const discord = await BroadcasterService.sendDiscord("Test Message");
        logger.info("Discord Result:", discord);
        if (discord.status !== 'mocked' && discord.status !== 'sent') throw new Error("Discord failed");

        // 3. Verify Email (Mocked)
        logger.info("3. Testing Email...");
        const email = await BroadcasterService.sendEmail("test@example.com", "Subject", "Body");
        logger.info("Email Result:", email);
        if (email.status !== 'mocked') throw new Error("Email failed");

        // 4. Verify Broadcast
        logger.info("4. Testing Broadcast...");
        const broadcast = await BroadcasterService.broadcastAlert("System Down!");
        logger.info("Broadcast Result:", broadcast);
        if (broadcast.length !== 3) throw new Error("Broadcast failed");

        logger.info("Broadcaster Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
