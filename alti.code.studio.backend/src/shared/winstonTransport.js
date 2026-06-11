/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Transport from 'winston-transport';
// import { EventBus } from '../app/shared/eventBus.js'; // REMOVED: Circular dependency breaker

export class EventBusTransport extends Transport {
    constructor(opts) {
        super(opts);
    }

    async log(info, callback) {
        setImmediate(async () => {
            this.emit('logged', info);

            // Recursion Guard: Don't publish EventBus logs to EventBus
            if (info.message && info.message.includes('Event Bus')) {
                return;
            }

            try {
                // Dynamically import EventBus
                const { EventBus } = await import('../app/shared/eventBus.js');

                // Publish to EventBus based on level
                if (info.level === 'error') {
                    EventBus.publish('sys.log.error', {
                        message: info.message,
                        timestamp: info.timestamp || new Date().toISOString(),
                        label: info.label
                    }).catch(() => { });
                } else if (info.level === 'warn') {
                    EventBus.publish('sys.log.warn', {
                        message: info.message
                    }).catch(() => { });
                }
            } catch (e) {
                // console.error('Transport Error');
            }
        });

        if (callback) callback();
    }
}

export class LokiTransport extends Transport {
    constructor(opts) {
        super(opts);
        this.lokiUrl = opts?.lokiUrl || process.env.LOKI_URL;
        this.env = process.env.NODE_ENV || 'development';
    }

    async log(info, callback) {
        setImmediate(async () => {
            if (!this.lokiUrl) {
                return;
            }

            // Prevent recursion by avoiding LOKI log loops
            if (info.message && info.message.includes('[LOKI]')) {
                return;
            }

            const timestampNs = (Date.now() * 1000000).toString();
            const logLine = `${info.timestamp || new Date().toISOString()} [${info.label || 'INSO Code'}] ${info.level.toUpperCase()}: ${info.message}`;

            const payload = {
                streams: [
                    {
                        stream: {
                            job: 'alti-code-studio',
                            level: info.level,
                            environment: this.env
                        },
                        values: [
                            [timestampNs, logLine]
                        ]
                    }
                ]
            };

            try {
                const axios = (await import('axios')).default;
                await axios.post(this.lokiUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                // Fail silently to avoid crash loops
            }
        });

        if (callback) callback();
    }
}
