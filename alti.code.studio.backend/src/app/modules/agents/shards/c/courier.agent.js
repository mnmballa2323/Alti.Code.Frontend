// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { logger } from '../../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class CourierAgent {
    constructor() {
        this.name = "The Courier";
        this.outboxDir = path.join(process.cwd(), 'outbox');
    }

    /**
     * Deliver a message to an external channel
     * @param {string} message - Content
     * @param {string} channel - 'console' | 'file' | 'slack' (mock)
     */
    async deliver(message, channel = 'console') {
        logger.info(`📨 Courier: Delivering message via [${channel}]...`);

        try {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] ${message}`;

            switch (channel.toLowerCase()) {
                case 'file':
                    await this._deliverToFile(formattedMessage);
                    break;
                case 'console':
                default:
                    logger.info(`\n📨 [COURIER MESSAGE]: ${message}\n`);
                    break;
            }

            return { status: 'DELIVERED', channel, timestamp };

        } catch (error) {
            logger.error(`❌ Courier Failed:`, error);
            throw error;
        }
    }

    async _deliverToFile(message) {
        await fs.mkdir(this.outboxDir, { recursive: true });
        const filename = `msg_${Date.now()}.txt`;
        await fs.writeFile(path.join(this.outboxDir, filename), message);
        logger.info(`📨 Courier: Saved to ${path.join(this.outboxDir, filename)}`);
    }
}

export const courierAgent = Object.freeze(new CourierAgent());
