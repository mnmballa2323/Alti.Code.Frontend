/**
 * Notification Service
 * 
 * Multi-channel notification delivery:
 * - In-app (WebSocket push to all surfaces)
 * - Desktop (Electron native notifications)
 * - Email (via SendGrid/GCP-native)
 * - Webhook (via webhookEngine)
 * 
 * Priority levels: critical, high, normal, low
 * Categories: security, billing, usage, agent, system
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { webhookEngine } from './webhookEngine.js';
import { EventEmitter } from 'events';

const CHANNELS = ['in_app', 'desktop', 'email', 'webhook'];
const PRIORITIES = ['critical', 'high', 'normal', 'low'];
const CATEGORIES = ['security', 'billing', 'usage', 'agent', 'system', 'deployment'];

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.notifications = new Map(); // userId -> notification[]
    this.preferences = new Map(); // userId -> channel preferences
    this.maxPerUser = 500;
  }

  async send(notification) {
    const {
      userId,
      tenantId,
      title,
      message,
      priority = 'normal',
      category = 'system',
      channels = ['in_app'],
      actionUrl = null,
      metadata = {},
    } = notification;

    const entry = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      tenantId,
      title,
      message,
      priority,
      category,
      actionUrl,
      metadata,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Store for in-app retrieval
    this._store(userId, entry);

    // Deliver to channels
    for (const channel of channels) {
      await this._deliver(channel, entry);
    }

    metrics.incrementCounter('notifications_sent', 1, { priority, category });
    return entry;
  }

  async sendBulk(userIds, notification) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.send({ ...notification, userId }))
    );
    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    };
  }

  getNotifications(userId, options = {}) {
    const { unreadOnly = false, category = null, limit = 50 } = options;
    let notifs = this.notifications.get(userId) || [];
    if (unreadOnly) notifs = notifs.filter(n => !n.read);
    if (category) notifs = notifs.filter(n => n.category === category);
    return notifs.slice(-limit);
  }

  getUnreadCount(userId) {
    const notifs = this.notifications.get(userId) || [];
    return notifs.filter(n => !n.read).length;
  }

  markRead(userId, notificationId) {
    const notifs = this.notifications.get(userId) || [];
    const notif = notifs.find(n => n.id === notificationId);
    if (notif) notif.read = true;
  }

  markAllRead(userId) {
    const notifs = this.notifications.get(userId) || [];
    notifs.forEach(n => { n.read = true; });
  }

  async _deliver(channel, entry) {
    switch (channel) {
      case 'in_app':
        this.emit('notification:new', entry);
        break;
      case 'desktop':
        this.emit('notification:desktop', entry);
        break;
      case 'email':
        logger.info(`[Notification] Email queued: ${entry.title} → ${entry.userId}`);
        break;
      case 'webhook':
        if (entry.tenantId) {
          await webhookEngine.emit(entry.tenantId, `notification.${entry.category}`, entry);
        }
        break;
    }
  }

  _store(userId, entry) {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    const list = this.notifications.get(userId);
    list.push(entry);
    if (list.length > this.maxPerUser) {
      this.notifications.set(userId, list.slice(-this.maxPerUser));
    }
  }

  setPreferences(userId, prefs) {
    this.preferences.set(userId, prefs);
  }
}

export const notificationService = new NotificationService();
