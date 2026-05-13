import speech from '@google-cloud/speech';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Speech-to-Text (STT) Client.
 * Provides ultra-low latency transcription for the Acoustic Workspace.
 */
class SpeechService {
    constructor() {
        try {
            this.client = new speech.SpeechClient();
        } catch (error) {
            logger.warn('⚠️ [Speech] Could not initialize Google Cloud SpeechClient. Are credentials set?');
        }
    }
}

export const speechClient = new SpeechService().client || {
    recognize: async () => { throw new Error('Speech API not initialized'); }
};
