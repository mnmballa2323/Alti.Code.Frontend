/**
 * Copyright (c) 2024 Inso Code
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
                origin: process.env.CLIENT_URL || "http://localhost:3001",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            logger.info(`🔌 Socket.io: Client connected ${socket.id}`);

            // --- Multiplayer Presence Engine ---
            socket.on('join_presence', (data) => {
                const { userId, username, avatar } = data || {};
                socket.userId = userId || socket.id;
                socket.username = username || 'Anonymous';
                socket.avatar = avatar;
                socket.join('live_studio_presence');

                // Broadcast that a new user joined
                socket.to('live_studio_presence').emit('user_joined', {
                    id: socket.id,
                    userId: socket.userId,
                    username: socket.username,
                    avatar: socket.avatar
                });
                logger.info(`👥 Multiplayer: User ${socket.username} joined Presence Channel.`);
            });

            // Handle real-time cursor movement 
            socket.on('cursor_move', (data) => {
                // data = { x, y, pathname }
                socket.to('live_studio_presence').emit('remote_cursor', {
                    id: socket.id,
                    userId: socket.userId,
                    username: socket.username,
                    avatar: socket.avatar,
                    x: data.x,
                    y: data.y,
                    pathname: data.pathname
                });
            });

            // Handle shared sprint state overrides (pause/resume/context)
            socket.on('sprint_action', (data) => {
                logger.info(`🕹️ Multiplayer: Sprint action ${data.action} by ${socket.username}`);
                // Broadcast to all other clients to sync UI
                socket.to('live_studio_presence').emit('sprint_sync', {
                    action: data.action,
                    payload: data.payload,
                    by: socket.username
                });
            });

            socket.on('disconnect', () => {
                logger.info(`🔌 Socket.io: Client disconnected ${socket.id}`);
                // Notify others that cursor/presence left
                this.io.to('live_studio_presence').emit('user_left', {
                    id: socket.id,
                    userId: socket.userId
                });
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
