/**
 * Session Sync Service
 * 
 * Keeps Admin (web), Owner (web), and Desktop (Electron) in sync:
 * - Session state broadcasting via Pub/Sub
 * - Active session tracking per user
 * - Multi-device presence
 * - Session handoff (desktop <-> web)
 * - Conflict resolution (last-write-wins with vector clocks)
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { EventEmitter } from 'events';

class SessionSync extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map(); // userId -> Map<deviceId, session>
    this.pubsub = null;
  }

  async init() {
    try {
      const { PubSub } = await import('@google-cloud/pubsub');
      this.pubsub = new PubSub();
      logger.info('[SessionSync] Initialized with Cloud Pub/Sub');
    } catch (err) {
      logger.warn('[SessionSync] Pub/Sub not available, using local events:', err.message);
    }
  }

  async registerSession(userId, deviceInfo) {
    const { deviceId, deviceType, appVersion, platform } = deviceInfo;
    const session = {
      userId,
      deviceId,
      deviceType, // 'web-admin' | 'web-owner' | 'desktop' | 'mobile'
      appVersion,
      platform,
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      status: 'active',
      vectorClock: 0,
    };

    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, new Map());
    }
    this.sessions.get(userId).set(deviceId, session);

    metrics.incrementCounter('sessions_active', 1, { type: deviceType });
    this.emit('session:registered', session);
    await this._broadcast(userId, 'session.registered', session);

    logger.info(`[SessionSync] Session registered: ${userId}@${deviceType} (${deviceId})`);
    return session;
  }

  async removeSession(userId, deviceId) {
    const userSessions = this.sessions.get(userId);
    if (userSessions) {
      userSessions.delete(deviceId);
      if (userSessions.size === 0) this.sessions.delete(userId);
    }
    this.emit('session:removed', { userId, deviceId });
    await this._broadcast(userId, 'session.removed', { userId, deviceId });
  }

  async syncState(userId, deviceId, state) {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || !userSessions.has(deviceId)) return;

    const session = userSessions.get(deviceId);
    session.lastActivity = new Date().toISOString();
    session.vectorClock++;
    session.lastState = state;

    // Broadcast to other devices
    await this._broadcast(userId, 'state.sync', {
      deviceId,
      state,
      vectorClock: session.vectorClock,
    });
  }

  async handoff(userId, fromDeviceId, toDeviceId) {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) return null;

    const fromSession = userSessions.get(fromDeviceId);
    if (!fromSession?.lastState) return null;

    logger.info(`[SessionSync] Handoff: ${fromDeviceId} → ${toDeviceId}`);
    return {
      state: fromSession.lastState,
      fromDevice: fromDeviceId,
      timestamp: new Date().toISOString(),
    };
  }

  getActiveSessions(userId) {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) return [];
    return Array.from(userSessions.values());
  }

  getPresence() {
    const presence = {
      totalUsers: this.sessions.size,
      totalSessions: 0,
      byType: { 'web-admin': 0, 'web-owner': 0, 'desktop': 0, 'mobile': 0 },
    };
    for (const userSessions of this.sessions.values()) {
      for (const session of userSessions.values()) {
        presence.totalSessions++;
        presence.byType[session.deviceType] = (presence.byType[session.deviceType] || 0) + 1;
      }
    }
    return presence;
  }

  async _broadcast(userId, event, payload) {
    if (this.pubsub) {
      try {
        const topic = this.pubsub.topic('session-sync');
        await topic.publishMessage({
          json: { userId, event, payload, timestamp: Date.now() },
        });
      } catch (err) {
        logger.warn('[SessionSync] Pub/Sub broadcast failed:', err.message);
      }
    }
    this.emit(event, { userId, payload });
  }
}

export const sessionSync = new SessionSync();
