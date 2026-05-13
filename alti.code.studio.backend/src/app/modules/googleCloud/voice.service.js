import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Text-to-Speech Service (The Swarm's Voice).
 * Translates the mathematical reasoning of the Agent Swarm into 
 * hyper-realistic Google WaveNet audio, granting the AI engineer a literal voice.
 */
class GoogleVoiceService {
    constructor() {
        try {
            this.client = new textToSpeech.TextToSpeechClient();
            logger.info('🗣️ [Voice] Google Cloud Text-to-Speech Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Voice] Could not initialize Text-to-Speech Client.');
        }
    }

    /**
     * Synthesizes text into a WaveNet audio file.
     * @param {string} text - The agent's thought process
     * @param {string} outputFilename - Optional specific filename
     */
    async synthesizeThought(text, outputFilename = null) {
        logger.info(`🗣️ [Voice] Swarm is speaking: "${text.substring(0, 30)}..."`);
        
        try {
            const request = {
                input: { text: text },
                // Select the premium WaveNet model (Journey voice for ultra-realism if available)
                voice: { languageCode: 'en-US', name: 'en-US-Journey-D' },
                audioConfig: { audioEncoding: 'MP3', speakingRate: 1.1 },
            };

            const [response] = await this.client.synthesizeSpeech(request);
            
            const filename = outputFilename || `swarm_thought_${Date.now()}.mp3`;
            const filepath = path.join(process.cwd(), 'public', 'audio', filename);
            
            // Ensure directory exists
            if (!fs.existsSync(path.dirname(filepath))) {
                fs.mkdirSync(path.dirname(filepath), { recursive: true });
            }

            const writeFile = util.promisify(fs.writeFile);
            await writeFile(filepath, response.audioContent, 'binary');
            
            logger.info(`✅ [Voice] Thought synthesized and saved to ${filepath}`);
            return `/audio/${filename}`;
        } catch (error) {
            logger.error(`❌ [Voice] Failed to synthesize thought:`, error.message);
            return null;
        }
    }
}

export const voiceService = new GoogleVoiceService();
