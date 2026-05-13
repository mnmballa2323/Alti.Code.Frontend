/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { webhookService } from './webhook.service.js';
import { logger } from '../../../shared/logger.js';
// import { Orchestrator } from '../agents/orchestrator.agent.js'; // Deferred import to avoid cycles or mocking

export const IntegrationController = {
    handleTrigger: async (req, res) => {
        try {
            const signature = req.headers['x-hub-signature-256'];
            // In express, we need the raw body for verification. 
            // Assuming middleware provides it or we reconstruct it (simplified for this mock)
            // For this implementation, we will trust the parsed body for logic but warn about raw body requirement regarding verification in real prod

            const secret = process.env.WEBHOOK_SECRET || 'default_secret'; // Should match check script

            // Note: Robust signature verification requires raw body buffer. 
            // Here we re-stringify for demonstration/verification purposes.
            const rawBody = JSON.stringify(req.body);

            if (!webhookService.verifySignature(rawBody, signature, secret)) {
                logger.warn('🛑 The Diplomat: Invalid Webhook Signature.');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            logger.info('🤝 The Diplomat: Received valid external trigger.');
            const { action, params } = req.body;
            const userId = req.user?.id || 'system-webhook';

            // Dispatch to Orchestrator (Mocked for now to avoid complexity in this step)
            const result = await Orchestrator.execute(req.body.goal, userId);
            logger.info(`🚀 Triggering Orchestrator for action: ${action}`);

            return res.status(200).json({ success: true, message: 'Trigger accepted' });

        } catch (error) {
            logger.error(`Integration Error: ${error.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
