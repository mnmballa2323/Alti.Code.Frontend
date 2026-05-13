import Transport from 'winston-transport';
import { EventBus } from '../app/shared/eventBus.js';

export class EventBusTransport extends Transport {
    constructor(opts) {
        super(opts);
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Recursion Guard: Don't publish EventBus logs to EventBus
        if (info.message && info.message.includes('Event Bus')) {
            callback();
            return;
        }

        try {
            // Publish to EventBus based on level
            if (info.level === 'error') {
                EventBus.publish('sys.log.error', {
                    message: info.message,
                    timestamp: info.timestamp || new Date().toISOString(),
                    label: info.label
                }).catch(err => {
                    // Fail silently to console to avoid infinite loop
                    // console.error('Failed to ship log to EventBus:', err); 
                });
            } else if (info.level === 'warn') {
                EventBus.publish('sys.log.warn', {
                    message: info.message
                }).catch(() => { });
            }
        } catch (e) {
            // console.error('Transport Error');
        }

        callback();
    }
}
