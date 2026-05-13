/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Server } from 'socket.io';
import { logger } from '../../shared/logger.js';

class SocketService {
    constructor() {
        this.io = null;
    }

    init(httpServer) {
        if (this.io) return;

        logger.info('🔌 Socket.io: Initializing...');

        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            logger.info(`🔌 Socket.io: Client connected ${socket.id}`);

            socket.on('disconnect', () => {
                logger.info(`🔌 Socket.io: Client disconnected ${socket.id}`);
            });
        });

        logger.info('🔌 Socket.io: Ready.');
    }

    /**
     * Broadcast an agent event to all connected clients.
     * @param {string} agent - Agent name (e.g., 'security', 'refactor')
     * @param {string} type - Event type ('thought', 'working', 'success', 'error')
     * @param {object} payload - Data to send
     */
    broadcast(agent, type, payload) {
        if (!this.io) return;

        const packet = {
            agent,
            type,
            timestamp: new Date().toISOString(),
            ...payload
        };

        this.io.emit(`agent:${agent}:${type}`, packet);
        this.io.emit('agent:stream', { agent, type, timestamp: packet.timestamp, data: payload });
    }
}

export const socketService = new SocketService();
