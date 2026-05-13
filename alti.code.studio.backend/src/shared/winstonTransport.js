/**
 * Copyright (c) 2024 Alti.Code.Studio
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
