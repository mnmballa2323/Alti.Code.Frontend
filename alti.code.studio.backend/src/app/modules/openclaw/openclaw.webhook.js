/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * The Omni-Channel Ambassador: OpenClaw Webhook Router
 * Listens for incoming POST requests forwarded from the Developer's personal
 * OpenClaw instance (which hooks into WhatsApp/Telegram/iMessage).
 * Translates raw intents into autonomous Sprint Goals.
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

class OpenClawWebhookService {

    /**
     * Primary webhook endpoint to be mounted in Express
     * POST /api/v1/openclaw/webhook
     */
    async handleIncomingMessage(req, res) {
        try {
            // 1. Authenticate the payload (HMAC from the OpenClaw Skill)
            if (!this._verifySignature(req)) {
                logger.warn('🛡️ OpenClaw Webhook: Invalid signature detected.');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const payload = req.body;
            /* Expected OpenClaw Payload:
             * {
             *   "source": "whatsapp", 
             *   "senderId": "+1234567890",
             *   "originalIntent": "Hey, start a new sprint to upgrade React to v19"
             * }
             */

            if (!payload || !payload.originalIntent) {
                return res.status(400).json({ error: 'Malformed OpenClaw payload. "originalIntent" is required.' });
            }

            logger.info(`📱 OpenClaw Ambassador: Received requirement via ${payload.source || 'Unknown Channel'}`);

            // 2. Synthesize the Sprint Goal using Gemini
            const prompt = `You are The Ambassador. A non-technical stakeholder just messaged the Alti.Code.Studio platform via their OpenClaw personal assistant.
Translate their raw English requirement into a strict, highly technical "Sprint Goal".
Do NOT write code. Write a 1-3 sentence declarative technical requirement.

Stakeholder Request (${payload.source}): "${payload.originalIntent}"

Synthesize a precise Sprint Goal:`;

            const translatedGoal = await GeminiAiService.generateContent(prompt);
            const cleanGoal = translatedGoal.replace(/^["'\`]+|["'\`]+$/g, '').trim();

            // 3. Inject into the Autonomous Scheduler Backlog directly
            await sprintSchedulerService.addGoalToBacklog(cleanGoal, 1, {
                source: `openclaw-${payload.source}`,
                sender: payload.senderId
            });

            logger.info(`✅ OpenClaw Ambassador: Converted ${payload.source} message into Sprint Goal: ${cleanGoal}`);

            // 4. Return the synthesis back to OpenClaw so it can text the user back
            return res.status(200).json({
                success: true,
                message: "Goal Sent to Swarm",
                sprintGoal: cleanGoal,
                replyText: `🤖 I've forwarded your request to the Alti.Code.Studio Swarm. They are scheduling a priority sprint for:\n> "${cleanGoal}"`
            });

        } catch (error) {
            logger.error(`❌ OpenClaw Ambassador: Webhook processing failed: ${error.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    _verifySignature(req) {
        if (!process.env.OPENCLAW_WEBHOOK_SECRET) return true; // Bypass if not configured

        const signature = req.headers['x-openclaw-signature'];
        if (!signature) return false;

        const hmac = crypto.createHmac('sha256', process.env.OPENCLAW_WEBHOOK_SECRET);
        const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

        return signature === digest;
    }

}

export const openclawWebhookService = new OpenClawWebhookService();
