import speech from '@google-cloud/speech';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Speech-to-Text Service (The Swarm's Ear).
 * Allows the developer to completely bypass the keyboard, dictating complex
 * architectural commands directly into the V8 engine using Google's Neural Speech models.
 */
class GoogleEarService {
    constructor() {
        try {
            this.client = new speech.SpeechClient();
            logger.info('👂 [Ear] Google Cloud Speech-to-Text Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Ear] Could not initialize Speech-to-Text Client.');
        }
    }

    /**
     * Transcribes an audio file or stream containing a developer's vocal command.
     * @param {Buffer} audioBuffer - The audio buffer containing the spoken command
     */
    async transcribeCommand(audioBuffer) {
        logger.info(`👂 [Ear] Swarm is processing auditory input...`);
        
        try {
            const audio = {
                content: audioBuffer.toString('base64'),
            };
            const config = {
                encoding: 'LINEAR16', // Usually from browser MediaRecorder
                sampleRateHertz: 16000,
                languageCode: 'en-US',
                // Use the latest, most advanced medical/video models if required
                model: 'latest_long',
                enableAutomaticPunctuation: true,
            };
            const request = {
                audio: audio,
                config: config,
            };

            const [response] = await this.client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
                
            logger.info(`✅ [Ear] Vocal command decoded: "${transcription}"`);
            return transcription;
        } catch (error) {
            logger.error(`❌ [Ear] Auditory processing failed:`, error.message);
            return null;
        }
    }
}

export const earService = new GoogleEarService();
