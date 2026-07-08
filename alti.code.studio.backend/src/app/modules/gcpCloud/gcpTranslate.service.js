import { logger } from '../../../shared/logger.js';

class GcpTranslateService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { TranslationServiceClient } = await import('@google-cloud/translate');
        this.client = new TranslationServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Translation: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Translation init failed: ${e.message}`);
    }
  }

  _parentPath() {
    return `projects/${this.projectId}/locations/global`;
  }

  /**
   * Translate text to a target language.
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
   * @param {string} [sourceLanguage] - Source language code (auto-detected if omitted)
   */
  async translateText(text, targetLanguage, sourceLanguage) {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.translateText({
          parent: this._parentPath(),
          contents: [text],
          targetLanguageCode: targetLanguage,
          sourceLanguageCode: sourceLanguage || undefined,
          mimeType: 'text/plain',
        });

        const translation = response.translations?.[0];
        logger.info(`🌐 Translation: ${sourceLanguage || 'auto'} → ${targetLanguage}`);

        return {
          translatedText: translation?.translatedText || text,
          detectedSourceLanguage: translation?.detectedLanguageCode || sourceLanguage,
          model: translation?.model,
        };
      } catch (e) {
        logger.error(`❌ Cloud Translation failed: ${e.message}`);
      }
    }

    logger.info(`🌐 Translation Mock: ${targetLanguage}`);
    return { translatedText: text, detectedSourceLanguage: 'en', model: 'mock' };
  }

  /**
   * Detect the language of input text.
   */
  async detectLanguage(text) {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.detectLanguage({
          parent: this._parentPath(),
          content: text,
          mimeType: 'text/plain',
        });

        const detection = response.languages?.[0];
        return {
          languageCode: detection?.languageCode || 'und',
          confidence: detection?.confidence || 0,
        };
      } catch (e) {
        logger.error(`❌ Cloud Language Detection failed: ${e.message}`);
      }
    }

    return { languageCode: 'en', confidence: 1.0 };
  }

  /**
   * Get list of supported languages.
   */
  async getSupportedLanguages(displayLanguageCode = 'en') {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.getSupportedLanguages({
          parent: this._parentPath(),
          displayLanguageCode,
        });

        return response.languages?.map((l) => ({
          code: l.languageCode,
          name: l.displayName,
          supportSource: l.supportSource,
          supportTarget: l.supportTarget,
        })) || [];
      } catch (e) {
        logger.error(`❌ Cloud getSupportedLanguages failed: ${e.message}`);
      }
    }

    return [];
  }
}

export const gcpTranslateService = new GcpTranslateService();
