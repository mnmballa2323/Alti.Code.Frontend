import textToSpeech from '@google-cloud/text-to-speech';
import { logger } from '../../../shared/logger.js';
import fs from 'fs';
import util from 'util';
import path from 'path';

/**
 * Google Cloud Text-to-Speech Service.
 * Gives the Agent Swarm the ability to synthesize human-like voice responses
 * using Google's neural WaveNet and Journey models.
 */
class GoogleTTSService {
    constructor() {
        try {
            this.client = new textToSpeech.TextToSpeechClient();
        } catch (error) {
            logger.warn('⚠️ [TTS] Could not initialize TextToSpeechClient.');
        }
    }

    /**
     * Synthesizes text into an MP3 audio buffer.
     * @param {string} text - The text to synthesize
     * @returns {Promise<Buffer>} - The audio buffer
     */
    async synthesizeSpeech(text) {
        logger.info(`🗣️ [TTS] Synthesizing speech for agent response...`);
        try {
            const request = {
                input: { text: text },
                // Select the Journey voice for hyper-realistic conversational tone
                voice: { languageCode: 'en-US', name: 'en-US-Journey-D' },
                audioConfig: { audioEncoding: 'MP3' },
            };

            const [response] = await this.client.synthesizeSpeech(request);
            logger.info('✅ [TTS] Speech synthesized successfully.');
            
            return response.audioContent;
        } catch (error) {
            logger.error(`❌ [TTS] Failed to synthesize speech:`, error.message);
            throw error;
        }
    }

    /**
     * Synthesizes and saves audio directly to disk.
     */
    async saveSpeechToFile(text, filename) {
        const audioBuffer = await this.synthesizeSpeech(text);
        const writeFile = util.promisify(fs.writeFile);
        const outputPath = path.join(process.cwd(), 'temp', filename);
        
        // Ensure temp dir exists
        if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'temp'));
        }
        
        await writeFile(outputPath, audioBuffer, 'binary');
        logger.info(`✅ [TTS] Audio saved to ${outputPath}`);
        return outputPath;
    }
}

export const ttsService = new GoogleTTSService();
