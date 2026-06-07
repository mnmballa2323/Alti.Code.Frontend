/**
 * Copyright (c) 2024 Inso Code
 *
 * The Ambassador: Slack Integration Service
 * Listens for plain English requirements from non-technical stakeholders,
 * translates them using Gemini into Sprint Goals, and injects them into
 * the autonomous Sprint Scheduler backlog.
 */

import { App } from '@slack/bolt';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';
import { logger } from '../../../shared/logger.js';

class SlackAmbassadorService {
    constructor() {
        this.app = null;
        this.isInitialized = false;
    }

    async init() {
        if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
            logger.warn('👔 The Ambassador: Slack tokens missing. Slack Bot disabled.');
            return;
        }

        try {
            this.app = new App({
                token: process.env.SLACK_BOT_TOKEN,
                signingSecret: process.env.SLACK_SIGNING_SECRET,
                appToken: process.env.SLACK_APP_TOKEN,
                socketMode: !!process.env.SLACK_APP_TOKEN, // Use Socket Mode if APP_TOKEN is provided (no public IP needed)
            });

            this.registerListeners();

            await this.app.start(process.env.SLACK_PORT || 3005);
            this.isInitialized = true;
            logger.info('👔 The Ambassador: Slack Bot connected and listening for requirements.');
        } catch (error) {
            logger.error(`❌ The Ambassador: Slack Bot failed to start: ${error.message}`);
        }
    }

    registerListeners() {
        // Listen for when the bot is @mentioned in a channel
        this.app.event('app_mention', async ({ event, context, client, say }) => {
            try {
                const rawText = event.text.replace(/<@[^>]+>/g, '').trim(); // Remove the @bot mention part

                await say(`_Good day <@${event.user}>. The Ambassador is processing your request into technical specifications..._`);

                const prompt = `You are The Ambassador, the technical interface between product stakeholders and the Autonomous AI Engineering Swarm.
Your job is to read the raw, plain English request from a stakeholder and translate it into a highly actionable, technical "Sprint Goal".
Do NOT write code. Write a 1-3 sentence declarative technical requirement.

Stakeholder Request: "${rawText}"

Synthesize a precise Sprint Goal:`;

                const translatedGoal = await GeminiAiService.generateContent(prompt);
                const cleanGoal = translatedGoal.replace(/^["'\`]+|["'\`]+$/g, '').trim();

                // Inject into the Autonomous Scheduler Backlog as Priority 1 (High)
                await sprintSchedulerService.addGoalToBacklog(cleanGoal, 1, {
                    source: 'slack',
                    author: event.user,
                    channel: event.channel
                });

                await say(`✅ *New Sprint Goal Added to Backlog*\n> ${cleanGoal}\n\nThe Swarm will autonomously plan and execute this in the upcoming cycle.`);
                logger.info(`👔 The Ambassador: Converted Slack request from ${event.user} into backlog goal.`);
            } catch (error) {
                logger.error(`❌ The Ambassador: Failed to process mention: ${error.message}`);
                await say(`⚠️ I apologize, <@${event.user}>, but I encountered an error translating your request: ${error.message}`);
            }
        });
    }
}

export const slackAmbassadorService = new SlackAmbassadorService();
