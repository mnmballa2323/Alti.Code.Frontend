/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import say from 'say';
import { logger } from '../../../shared/logger.js';

class SirenAgent {
    constructor() {
        this.isSpeaking = false;
    }

    /**
     * Speak the provided text
     * @param {string} text 
     */
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!text) {
                logger.warn('🗣️ Siren: No text to speak.');
                return resolve();
            }

            logger.info(`🗣️ Siren: Speaking... "${text.substring(0, 50)}..."`);
            this.isSpeaking = true;

            say.speak(text, null, 1.0, (err) => {
                this.isSpeaking = false;
                if (err) {
                    logger.error('🗣️ Siren Error:', err);
                    return reject(err);
                }
                logger.info('🗣️ Siren: Finished speaking.');
                resolve();
            });
        });
    }

    /**
     * Stop speaking immediately
     */
    stop() {
        say.stop();
        this.isSpeaking = false;
    }
}

export const sirenAgent = new SirenAgent();
