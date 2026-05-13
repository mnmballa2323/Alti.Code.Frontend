/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Broadcaster" - Unified Notification Agent
 * Responsible for sending alerts to external channels (Slack, Discord, Email).
 */
import { logger } from '../../../shared/logger.js';
import axios from 'axios';

class BroadcasterAgent {
    constructor() {
        // In a real app, these would come from env vars
        this.config = {
            slackWebhook: process.env.SLACK_WEBHOOK_URL,
            discordWebhook: process.env.DISCORD_WEBHOOK_URL,
            smtpConfig: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        };
    }

    /**
     * Send a message to Slack
     * @param {string} message 
     * @param {string} channel Optional override
     */
    async sendSlack(message, channel) {
        logger.info(`📢 Broadcaster: Sending to Slack... "${message}"`);

        if (!this.config.slackWebhook) {
            logger.warn('📢 Broadcaster: No Slack Webhook configured. Mocking success.');
            return { status: 'mocked', platform: 'slack', message };
        }

        try {
            await axios.post(this.config.slackWebhook, { text: message });
            return { status: 'sent', platform: 'slack' };
        } catch (error) {
            logger.error('📢 Broadcaster: Slack delivery failed', error.message);
            return { status: 'failed', error: error.message };
        }
    }

    /**
     * Send a message to Discord
     * @param {string} message 
     */
    async sendDiscord(message) {
        logger.info(`📢 Broadcaster: Sending to Discord... "${message}"`);

        if (!this.config.discordWebhook) {
            logger.warn('📢 Broadcaster: No Discord Webhook configured. Mocking success.');
            return { status: 'mocked', platform: 'discord', message };
        }

        try {
            await axios.post(this.config.discordWebhook, { content: message });
            return { status: 'sent', platform: 'discord' };
        } catch (error) {
            logger.error('📢 Broadcaster: Discord delivery failed', error.message);
            return { status: 'failed', error: error.message };
        }
    }

    /**
     * Send an email
     * @param {string} to 
     * @param {string} subject 
     * @param {string} body 
     */
    async sendEmail(to, subject, body) {
        logger.info(`📢 Broadcaster: Sending Email to ${to}... Subject: "${subject}"`);

        // Mock email sending for now
        return { status: 'mocked', platform: 'email', to, subject };
    }

    /**
     * Broadcast a critical alert to all channels
     * @param {string} alert 
     */
    async broadcastAlert(alert) {
        logger.info(`📢 Broadcaster: 🚨 BROADCASTING ALERT 🚨`);
        const results = await Promise.all([
            this.sendSlack(`🚨 ALERT: ${alert}`),
            this.sendDiscord(`🚨 **ALERT**: ${alert}`),
            this.sendEmail('admin@alti.com', 'CRITICAL ALERT', alert)
        ]);
        return results;
    }
}

export const broadcasterAgent = new BroadcasterAgent();
