import { logger } from '../../../shared/logger.js';

class GcpNaturalLanguageService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const language = await import('@google-cloud/language');
        const { LanguageServiceClient } = language.default || language;
        this.client = new LanguageServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Natural Language: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Natural Language init failed: ${e.message}`);
    }
  }

  /**
   * Analyze sentiment of text (code reviews, PR descriptions, user feedback).
   * @param {string} text - Text to analyze
   * @returns {Promise<object>} Sentiment analysis result
   */
  async analyzeSentiment(text) {
    if (this.isInitialized && this.client) {
      try {
        const [result] = await this.client.analyzeSentiment({
          document: { content: text, type: 'PLAIN_TEXT' },
        });

        const sentiment = result.documentSentiment;
        logger.info(`🧠 NLP Sentiment: score=${sentiment.score}, magnitude=${sentiment.magnitude}`);

        return {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          label: sentiment.score > 0.25 ? 'POSITIVE' : sentiment.score < -0.25 ? 'NEGATIVE' : 'NEUTRAL',
          sentences: result.sentences?.map((s) => ({
            text: s.text?.content,
            score: s.sentiment?.score,
            magnitude: s.sentiment?.magnitude,
          })),
        };
      } catch (e) {
        logger.error(`❌ NLP analyzeSentiment failed: ${e.message}`);
      }
    }

    return { score: 0, magnitude: 0, label: 'NEUTRAL', sentences: [] };
  }

  /**
   * Extract entities from text (identify tech terms, people, organizations).
   */
  async analyzeEntities(text) {
    if (this.isInitialized && this.client) {
      try {
        const [result] = await this.client.analyzeEntities({
          document: { content: text, type: 'PLAIN_TEXT' },
        });

        return result.entities?.map((entity) => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience,
          metadata: entity.metadata,
          mentions: entity.mentions?.length || 0,
        })) || [];
      } catch (e) {
        logger.error(`❌ NLP analyzeEntities failed: ${e.message}`);
      }
    }

    return [];
  }

  /**
   * Classify text content into categories.
   */
  async classifyContent(text) {
    if (this.isInitialized && this.client) {
      try {
        const [result] = await this.client.classifyText({
          document: { content: text, type: 'PLAIN_TEXT' },
          classificationModelOptions: {
            v2Model: { contentCategoriesVersion: 'V2' },
          },
        });

        return result.categories?.map((c) => ({
          name: c.name,
          confidence: c.confidence,
        })) || [];
      } catch (e) {
        logger.error(`❌ NLP classifyContent failed: ${e.message}`);
      }
    }

    return [];
  }

  /**
   * Analyze syntax and POS (part-of-speech) tags.
   */
  async analyzeSyntax(text) {
    if (this.isInitialized && this.client) {
      try {
        const [result] = await this.client.analyzeSyntax({
          document: { content: text, type: 'PLAIN_TEXT' },
          encodingType: 'UTF8',
        });

        return {
          language: result.language,
          sentences: result.sentences?.length || 0,
          tokens: result.tokens?.map((t) => ({
            text: t.text?.content,
            partOfSpeech: t.partOfSpeech?.tag,
            lemma: t.lemma,
          })),
        };
      } catch (e) {
        logger.error(`❌ NLP analyzeSyntax failed: ${e.message}`);
      }
    }

    return { language: 'en', sentences: 0, tokens: [] };
  }
}

export const gcpNaturalLanguageService = new GcpNaturalLanguageService();
