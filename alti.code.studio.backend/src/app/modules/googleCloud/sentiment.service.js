import language from '@google-cloud/language';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Natural Language Service (Emotional Triage).
 * Grants the Swarm emotional intelligence by mathematically analyzing the sentiment
 * and frustration of incoming GitHub Issues, Slack messages, and Jira tickets.
 */
class GoogleSentimentService {
    constructor() {
        try {
            this.client = new language.LanguageServiceClient();
            logger.info('🧠 [Sentiment] Google Cloud Natural Language Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Sentiment] Could not initialize Natural Language Client.');
        }
    }

    /**
     * Analyzes the sentiment of a bug report to determine user frustration.
     * @param {string} text - The content of the bug report or message
     */
    async analyzeFrustration(text) {
        logger.info(`🧠 [Sentiment] Swarm is analyzing emotional state of bug report...`);
        
        try {
            const document = {
                content: text,
                type: 'PLAIN_TEXT',
            };

            const [result] = await this.client.analyzeSentiment({ document: document });
            const sentiment = result.documentSentiment;
            
            // Score ranges from -1.0 (highly negative/frustrated) to 1.0 (positive)
            // Magnitude indicates the absolute strength of the emotion
            logger.info(`✅ [Sentiment] Analysis complete. Score: ${sentiment.score}, Magnitude: ${sentiment.magnitude}`);
            
            const isHighFrustration = sentiment.score <= -0.5 && sentiment.magnitude >= 2.0;
            
            return {
                score: sentiment.score,
                magnitude: sentiment.magnitude,
                isHighFrustration: isHighFrustration
            };
        } catch (error) {
            logger.error(`❌ [Sentiment] Sentiment analysis failed:`, error.message);
            return { score: 0, magnitude: 0, isHighFrustration: false };
        }
    }
}

export const sentimentService = new GoogleSentimentService();
