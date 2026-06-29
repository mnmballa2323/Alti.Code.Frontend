import { SpeechClient } from '@google-cloud/speech';
import { logger } from '../../../shared/logger.js';

class GcpSpeechService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.client = new SpeechClient();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Speech initialization failed, falling back to mock recognition: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Transcribe audio using Google Cloud Speech-to-Text
   */
  async recognize(request) {
    if (this.isInitialized && this.client) {
      try {
        logger.info(
          '🎙️ Google Cloud Speech Services: Transcribing audio command...',
        );
        const [response] = await this.client.recognize(request);
        return [response];
      } catch (e) {
        logger.error(`❌ Google Cloud Speech recognition failed: ${e.message}`);
      }
    }

    logger.info(
      '🎙️ Google Cloud Speech Services Mock: Transcribing audio command...',
    );
    return [
      {
        results: [
          {
            alternatives: [
              { transcript: 'run diagnostics on sovereign deployment' },
            ],
          },
        ],
      },
    ];
  }
}

export const gcpSpeechService = new GcpSpeechService();
export const speechClient = gcpSpeechService;
export const azureSpeechService = gcpSpeechService;
