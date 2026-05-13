import admin from 'firebase-admin';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Firebase Cloud Messaging (FCM) (Apache 2.0 SDK) Service.
 * Empowers the Swarm to autonomously dispatch real-time, cross-platform 
 * Push Notifications (iOS, Android, Web) to engineering stakeholders 
 * upon completing massive architectural deployments.
 */
class FirebaseCloudMessagingService {
    constructor() {
        try {
            // Check if Firebase app is already initialized to prevent duplicate app errors
            if (!admin.apps.length) {
                // Autonomously uses GOOGLE_APPLICATION_CREDENTIALS for zero-config init
                admin.initializeApp({
                    credential: admin.credential.applicationDefault()
                });
            }
            this.messaging = admin.messaging();
            logger.info('📲 [FCM] Google Firebase Cloud Messaging initialized.');
        } catch (error) {
            logger.warn('⚠️ [FCM] Could not initialize Firebase Admin SDK.');
        }
    }

    /**
     * Autonomously sends a multi-platform push notification.
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {string} topic - The pub/sub topic to broadcast to (e.g. 'engineering-alerts')
     */
    async broadcastPushNotification(title, body, topic = 'engineering-alerts') {
        if (!this.messaging) return;

        logger.info(`📲 [FCM] Broadcasting push notification to topic: ${topic}`);
        
        try {
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                topic: topic,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'high_priority_channel'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default'
                        }
                    }
                }
            };

            const messageId = await this.messaging.send(message);
            logger.info(`✅ [FCM] Push Notification broadcasted successfully. Message ID: ${messageId}`);
            
            return messageId;
        } catch (error) {
            logger.error(`❌ [FCM] Failed to send push notification:`, error.message);
            return null;
        }
    }
}

export const fcmService = new FirebaseCloudMessagingService();
