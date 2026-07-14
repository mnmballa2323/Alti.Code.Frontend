/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { memorystoreService } from '../modules/gcpCloud/gcpCache.service.js';
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
        origin: process.env.CLIENT_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
      },
    });

    if (memorystoreService.publisher && memorystoreService.subscriber) {
      this.io.adapter(
        createAdapter(
          memorystoreService.publisher,
          memorystoreService.subscriber,
        ),
      );
      logger.info(
        '🔌 Socket.io: Connected to Redis Adapter for horizontal scaling.',
      );
    } else {
      logger.warn(
        '⚠️ Socket.io: Redis adapter not initialized. Running in single-node mode.',
      );
    }

    this.io.on('connection', socket => {
      logger.info(`🔌 Socket.io: Client connected ${socket.id}`);

      // --- Multiplayer Presence Engine ---
      socket.on('join_presence', data => {
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
          avatar: socket.avatar,
        });
        logger.info(
          `👥 Multiplayer: User ${socket.username} joined Presence Channel.`,
        );
      });

      // Handle real-time cursor movement
      socket.on('cursor_move', data => {
        // data = { x, y, pathname }
        socket.to('live_studio_presence').emit('remote_cursor', {
          id: socket.id,
          userId: socket.userId,
          username: socket.username,
          avatar: socket.avatar,
          x: data.x,
          y: data.y,
          pathname: data.pathname,
        });
      });

      // Handle shared sprint state overrides (pause/resume/context)
      socket.on('sprint_action', data => {
        logger.info(
          `🕹️ Multiplayer: Sprint action ${data.action} by ${socket.username}`,
        );
        // Broadcast to all other clients to sync UI
        socket.to('live_studio_presence').emit('sprint_sync', {
          action: data.action,
          payload: data.payload,
          by: socket.username,
        });
      });

      // --- Workspace Terminal Streaming ---
      socket.on('workspace_terminal_connect', async (data) => {
        const { workspaceId, command = '/bin/bash' } = data;
        logger.info(`🖥️ Terminal connect for workspace: ${workspaceId}`);
        
        try {
          // Dynamic import to avoid breaking environments without node-pty
          const pty = await import('node-pty');
          
          // Using docker exec with PTY. In a real environment, you'd fetch the containerId 
          // from the database, but this is the structural implementation.
          const term = pty.spawn('docker', ['exec', '-it', `workspace-${workspaceId}`, command], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
          });

          term.onData((output) => {
            socket.emit('workspace_terminal_data', { workspaceId, output });
          });

          socket.on(`workspace_terminal_input_${workspaceId}`, (input) => {
            term.write(input);
          });

          socket.on('disconnect', () => {
            term.kill();
          });
        } catch (error) {
          logger.error(`Failed to spawn PTY for workspace ${workspaceId}`, error);
          socket.emit('workspace_terminal_error', { workspaceId, error: 'PTY Spawn Failed' });
        }
      });

      // --- Workspace LSP Synchronization ---
      socket.on('workspace_lsp_sync', (data) => {
        const { workspaceId, rpcPayload } = data;
        // In production, this pipes JSON-RPC directly to the container's stdin for tsserver/pylsp
        logger.info(`🧠 LSP sync for workspace ${workspaceId}: ${rpcPayload.method}`);
        
        // Mock echoing back a response for architecture demonstration
        socket.emit('workspace_lsp_response', {
          workspaceId,
          rpcPayload: { jsonrpc: '2.0', id: rpcPayload.id, result: 'Acknowledged by backend LSP bridge' }
        });
      });

      socket.on('disconnect', () => {
        logger.info(`🔌 Socket.io: Client disconnected ${socket.id}`);
        // Notify others that cursor/presence left
        this.io.to('live_studio_presence').emit('user_left', {
          id: socket.id,
          userId: socket.userId,
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
      ...payload,
    };

    this.io.emit(`agent:${agent}:${type}`, packet);
    this.io.emit('agent:stream', {
      agent,
      type,
      timestamp: packet.timestamp,
      data: payload,
    });
  }
}

export const socketService = new SocketService();
