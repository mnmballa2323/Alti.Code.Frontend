/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Liaison" - Protocol & Webhook Agent
 * Handles incoming events from external systems (GitHub, Stripe, etc.)
 * and dispatches them to the appropriate internal agents.
 */
import { logger } from '../../../shared/logger.js';
import { criticAgent } from '../critic/critic.agent.js';
import { scoutAgent } from '../scout/scout.agent.js';

class LiaisonAgent {
    constructor() {
        this.eventLog = [];
    }

    /**
     * Handle incoming webhooks
     * @param {string} source Source of the webhook (github, stripe)
     * @param {object} payload 
     */
    async handleWebhook(source, payload) {
        logger.info(`🤝 Liaison: Received webhook from ${source}`);
        this.eventLog.push({ source, timestamp: new Date(), payload });

        switch (source.toLowerCase()) {
            case 'github':
                return await this.handleGitHubEvent(payload);
            default:
                logger.warn(`🤝 Liaison: Unknown webhook source: ${source}`);
                return { status: 'ignored', reason: 'unknown source' };
        }
    }

    /**
     * Process GitHub Events
     * @param {object} payload 
     */
    async handleGitHubEvent(payload) {
        const eventType = payload.event || 'push'; // simplified
        logger.info(`🤝 Liaison: Processing GitHub ${eventType} event`);

        if (eventType === 'pull_request' && payload.action === 'opened') {
            // Trigger The Critic for code review
            logger.info('🤝 Liaison: Dispatching to The Critic (QA)...');
            // Assuming Critic has a reviewPR method or similar. 
            // For now, we'll just log the intent.
            // await criticAgent.reviewPR(payload.pull_request.url); 
            return { status: 'dispatched', target: 'The Critic', action: 'review' };
        }

        if (eventType === 'security_advisory') {
            // Trigger The Scout/Sentinel
            logger.info('🤝 Liaison: Dispatching to The Scout (Dependencies)...');
            // await scoutAgent.checkVulnerabilities();
            return { status: 'dispatched', target: 'The Scout', action: 'security_check' };
        }

        return { status: 'processed', message: 'Event logged but no action required' };
    }
}

export const liaisonAgent = new LiaisonAgent();
