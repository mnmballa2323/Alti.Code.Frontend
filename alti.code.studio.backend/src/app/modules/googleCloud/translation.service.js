import { TranslationServiceClient } from '@google-cloud/translate';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Translation Service.
 * Provides Neural Machine Translation capabilities to the Swarm,
 * allowing it to autonomously translate codebases, comments, and PRs.
 */
class GoogleTranslationService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.location = config.gcp.location || 'global';
        
        try {
            this.client = new TranslationServiceClient();
        } catch (error) {
            logger.warn('⚠️ [Translation] Could not initialize TranslationServiceClient.');
        }
    }

    /**
     * Translates text into the target language.
     * @param {string[]} contents - Array of strings to translate
     * @param {string} targetLanguageCode - e.g. 'es', 'ja', 'fr'
     * @returns {Promise<string[]>}
     */
    async translateText(contents, targetLanguageCode) {
        logger.info(`🌍 [Translation] Translating ${contents.length} text blocks to ${targetLanguageCode}...`);
        
        try {
            const request = {
                parent: `projects/${this.projectId}/locations/${this.location}`,
                contents: contents,
                mimeType: 'text/plain', // Can also be text/html
                targetLanguageCode: targetLanguageCode,
            };

            const [response] = await this.client.translateText(request);
            logger.info('✅ [Translation] Translation complete.');

            return response.translations.map(t => t.translatedText);
        } catch (error) {
            logger.error(`❌ [Translation] Translation failed:`, error.message);
            // Non-fatal fallback
            return contents;
        }
    }

    /**
     * Detects the language of a given text block.
     */
    async detectLanguage(content) {
        try {
            const request = {
                parent: `projects/${this.projectId}/locations/${this.location}`,
                content: content,
            };

            const [response] = await this.client.detectLanguage(request);
            return response.languages[0].languageCode;
        } catch (error) {
            logger.error(`❌ [Translation] Detection failed:`, error.message);
            return 'en';
        }
    }
}

export const translationService = new GoogleTranslationService();
