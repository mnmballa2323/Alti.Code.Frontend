import admin from 'firebase-admin';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Firebase Admin SDK Service.
 * Replaces fragile local WebSocket (socket.io) connections with Google's 
 * ultra-low latency, globally distributed push infrastructure (Cloud Messaging & Realtime DB).
 */
class GoogleFirebaseService {
    constructor() {
        try {
            // Assumes GOOGLE_APPLICATION_CREDENTIALS points to a valid service account
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                databaseURL: `https://${config.gcp.project_id}.firebaseio.com`
            });
            this.db = admin.database();
            this.messaging = admin.messaging();
            logger.info('🔥 [Firebase] Admin SDK initialized successfully.');
        } catch (error) {
            logger.warn('⚠️ [Firebase] Could not initialize Admin SDK. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.');
        }
    }

    /**
     * Publishes a real-time event to the frontend via Firebase Realtime Database.
     * @param {string} channel - The data channel (e.g., 'agent_streams/123')
     * @param {object} payload - The JSON payload to push
     */
    async streamEvent(channel, payload) {
        try {
            const ref = this.db.ref(channel);
            // Push generates a unique timestamp-based key
            await ref.push({
                timestamp: admin.database.ServerValue.TIMESTAMP,
                ...payload
            });
        } catch (error) {
            logger.error(`❌ [Firebase] Realtime DB stream failed:`, error.message);
        }
    }

    /**
     * Sends a high-priority push notification directly to a developer's desktop/mobile device via FCM.
     * @param {string} deviceToken - The FCM registration token
     * @param {string} title 
     * @param {string} body 
     */
    async sendPushNotification(deviceToken, title, body) {
        try {
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                token: deviceToken
            };

            const response = await this.messaging.send(message);
            logger.info(`📲 [Firebase] Push notification sent successfully: ${response}`);
            return response;
        } catch (error) {
            logger.error(`❌ [Firebase] FCM Push failed:`, error.message);
        }
    }
}

export const firebaseService = new GoogleFirebaseService();
