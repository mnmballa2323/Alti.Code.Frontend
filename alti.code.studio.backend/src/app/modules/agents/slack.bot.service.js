import { App } from '@slack/bolt';
import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from './capability.router.js';

class SlackBotService {
    constructor() {
        this.name = 'SlackBotService';
        this.app = null;
        this.isActive = false;
    }

    init() {
        if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
            logger.warn('⚠️ [SlackBotService] Disabling ChatOps. Missing SLACK_BOT_TOKEN or SLACK_SIGNING_SECRET in environment.');
            return;
        }

        try {
            this.app = new App({
                token: process.env.SLACK_BOT_TOKEN,
                appToken: process.env.SLACK_APP_TOKEN,
                socketMode: true, // Use Socket Mode so we don't need a public IP to receive events
                logLevel: 'INFO'
            });

            this._registerListeners();

            this.app.start().then(() => {
                this.isActive = true;
                logger.info('⚡ SlackBotService (Socket Mode) is running! Swarm is listening on Slack...');
            });
        } catch (e) {
            logger.error(`❌ [SlackBotService] Failed to initialize: ${e.message}`);
        }
    }

    _registerListeners() {
        // Listen for direct app mentions
        this.app.event('app_mention', async ({ event, context, client, say }) => {
            try {
                // Strip the bot mention from the text
                const query = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

                logger.info(`💬 Slack Mentions Swarm: "${query.substring(0, 50)}..."`);
                await say({
                    text: `*Swarm Acknowledged*. Dispatching Phase 47 capability router for: _"${query}"_...`,
                    thread_ts: event.ts
                });

                // Prepare a context object including Slack metadata
                const slackContext = {
                    source: "SLACK_ENTERPRISE",
                    channelId: event.channel,
                    threadTs: event.ts,
                    userId: event.user,
                    timestamp: Date.now()
                };

                // Phase 47: Route to best agent or trigger an autonomous sprint
                const result = await capabilityRouter.dispatch(query, [slackContext]);

                await say({
                    text: `✅ *Swarm Response:*\n\n${result}`,
                    thread_ts: event.ts
                });

            } catch (error) {
                logger.error(`❌ [SlackBotService] Error handling mention: ${error.message}`);
                await say({
                    text: `🛑 *Swarm Neural Fault:* \n\`\`\`${error.message}\`\`\``,
                    thread_ts: event.ts
                });
            }
        });
    }

    async broadcast(channelId, message) {
        if (!this.isActive || !this.app) return;
        try {
            await this.app.client.chat.postMessage({
                channel: channelId,
                text: message
            });
        } catch (e) {
            logger.error(`❌ [SlackBotService] Broadcast failed: ${e.message}`);
        }
    }
}

export const slackBotService = new SlackBotService();
