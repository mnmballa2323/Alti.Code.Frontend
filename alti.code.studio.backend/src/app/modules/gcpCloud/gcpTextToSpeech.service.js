import { logger } from '../../../shared/logger.js';

class GcpTextToSpeechService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const tts = await import('@google-cloud/text-to-speech');
        const { TextToSpeechClient } = tts.default || tts;
        this.client = new TextToSpeechClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Text-to-Speech: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Text-to-Speech init failed: ${e.message}`);
    }
  }

  /**
   * Synthesize text into speech audio.
   * @param {string} text - Text to convert to speech
   * @param {string} [languageCode='en-US'] - BCP-47 language code
   * @param {string} [voiceName='en-US-Journey-F'] - Voice name from Google's voice library
   * @param {string} [encoding='MP3'] - Audio encoding (MP3, LINEAR16, OGG_OPUS)
   * @returns {Promise<Buffer|null>} Audio content as Buffer, or null on failure
   */
  async synthesizeSpeech(text, languageCode = 'en-US', voiceName = 'en-US-Journey-F', encoding = 'MP3') {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.synthesizeSpeech({
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: encoding,
            speakingRate: 1.0,
            pitch: 0,
            effectsProfileId: ['small-bluetooth-speaker-class-device'],
          },
        });

        logger.info(`🔊 Text-to-Speech: Synthesized ${text.length} chars → ${encoding}`);
        return response.audioContent;
      } catch (e) {
        logger.error(`❌ Text-to-Speech synthesis failed: ${e.message}`);
      }
    }

    logger.info(`🔊 Text-to-Speech Mock: Would synthesize ${text.length} chars`);
    return null;
  }

  /**
   * Synthesize SSML (Speech Synthesis Markup Language) content.
   */
  async synthesizeSsml(ssml, languageCode = 'en-US', voiceName = 'en-US-Journey-F', encoding = 'MP3') {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.synthesizeSpeech({
          input: { ssml },
          voice: { languageCode, name: voiceName },
          audioConfig: { audioEncoding: encoding },
        });

        logger.info(`🔊 Text-to-Speech: Synthesized SSML → ${encoding}`);
        return response.audioContent;
      } catch (e) {
        logger.error(`❌ Text-to-Speech SSML synthesis failed: ${e.message}`);
      }
    }

    return null;
  }

  /**
   * List available voices for a given language.
   */
  async listVoices(languageCode) {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.listVoices({
          languageCode: languageCode || undefined,
        });

        return response.voices?.map((v) => ({
          name: v.name,
          languageCodes: v.languageCodes,
          gender: v.ssmlGender,
          sampleRateHertz: v.naturalSampleRateHertz,
        })) || [];
      } catch (e) {
        logger.error(`❌ Text-to-Speech listVoices failed: ${e.message}`);
      }
    }

    return [];
  }
}

export const gcpTextToSpeechService = new GcpTextToSpeechService();
