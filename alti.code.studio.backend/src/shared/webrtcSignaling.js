import { logger } from './logger.js';
import { metrics } from './metrics.js';

class WebRTCSignaling {
  constructor() {
    this.rooms = new Map();
  }

  init() {
    logger.info('[WebRTCSignaling] Initializing signaling engine...');
    return { status: 'initialized' };
  }

  handleSignaling(message, ws) {
    const { type, room } = message;
    
    if (!room) {
      logger.warn('[WebRTCSignaling] Missing room in signaling message');
      return;
    }

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    const clients = this.rooms.get(room);

    if (type === 'join') {
      clients.add(ws);
      logger.info(`[WebRTCSignaling] Client joined room ${room}. Total: ${clients.size}`);
    } else if (type === 'leave') {
      clients.delete(ws);
      if (clients.size === 0) {
        this.rooms.delete(room);
      }
      logger.info(`[WebRTCSignaling] Client left room ${room}`);
    } else if (type === 'offer' || type === 'answer' || type === 'ice-candidate') {
      for (const client of clients) {
        if (client !== ws && typeof client.send === 'function') {
          client.send(JSON.stringify(message));
        }
      }
    }
  }
}

export const webrtcSignaling = new WebRTCSignaling();
