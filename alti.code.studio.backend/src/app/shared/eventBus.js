/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createClient } from 'redis';
import config from '../../../config/index.js';
import { EventEmitter } from 'events';

class AntigravityEventBus {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
        this.isConnected = false;
        this.isMock = false;
        this.localBus = new EventEmitter();
    }

    async connect() {
        if (this.isConnected) return;

        if (process.env.DISABLE_REDIS === 'true') {
            console.warn('⚠️ Redis disabled via env. Switching to local Nervous System (Mock Mode).');
            this.isMock = true;
            this.isConnected = true;
            return;
        }

        try {
            const redisUrl = config.redis_url || 'redis://localhost:6379';

            this.publisher = createClient({ url: redisUrl });
            this.subscriber = createClient({ url: redisUrl });

            this.publisher.on('error', (err) => {
                // console.error('Redis Publisher Error', err); // Quiet down
            });
            this.subscriber.on('error', (err) => {
                // console.error('Redis Subscriber Error', err);
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Redis Connection Timeout')), 2000);
            });

            await Promise.race([
                Promise.all([this.publisher.connect(), this.subscriber.connect()]),
                timeoutPromise
            ]);

            console.info('🧠 Nervous System (Event Bus) Connected [REDIS]');
            this.isConnected = true;
        } catch (error) {
            console.warn('⚠️ Redis unreachable. Switching to local Nervous System (Mock Mode).');
            try {
                if (this.publisher) this.publisher.disconnect();
            } catch (e) {}
            try {
                if (this.subscriber) this.subscriber.disconnect();
            } catch (e) {}
            this.isMock = true;
            this.isConnected = true;
        }
    }

    async publish(event, data) {
        if (!this.isConnected) {
            // console.warn(`Event Bus Disconnected. Dropping event: ${event}`);
            return;
        }

        try {
            const payload = {
                timestamp: new Date().toISOString(),
                event,
                data
            };

            if (this.isMock) {
                this.localBus.emit(event, payload);
                if (!event.includes('sys.log')) {
                    console.debug(`⚡ [MOCK BUS] Published: ${event}`);
                }
            } else {
                await this.publisher.publish(event, JSON.stringify(payload));
                if (!event.includes('sys.log')) {
                    console.debug(`⚡ [BUS] Published: ${event}`);
                }
            }
        } catch (error) {
            console.error(`Failed to publish event: ${event}`, error);
        }
    }

    async subscribe(event, callback) {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            if (this.isMock) {
                this.localBus.on(event, (payload) => {
                    callback(payload.data || {});
                });
                console.info(`👂 [MOCK BUS] Subscribed to: ${event}`);
            } else {
                // Redis v4 subscribe
                await this.subscriber.subscribe(event, (message) => {
                    try {
                        const parsed = JSON.parse(message);
                        // Unwrap validation: ensure data exists
                        callback(parsed.data || {});
                    } catch (e) {
                        console.error(`Failed to handle message for ${event}`, e);
                    }
                });
                console.info(`👂 [BUS] Subscribed to: ${event}`);
            }
        } catch (error) {
            console.error(`Failed to subscribe to: ${event}`, error);
        }
    }
}

export const EventBus = new AntigravityEventBus();
