import vision from '@google-cloud/vision';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Vision API Service.
 * Grants the Swarm the "Sense of Sight", allowing it to autonomously scan 
 * architectural diagrams, screenshots, or mockups using Google's OCR engine.
 */
class GoogleVisionService {
    constructor() {
        try {
            this.client = new vision.ImageAnnotatorClient();
            logger.info('👁️ [Vision] Google Cloud Vision API initialized.');
        } catch (error) {
            logger.warn('⚠️ [Vision] Could not initialize ImageAnnotatorClient. Ensure credentials are set.');
        }
    }

    /**
     * Extracts text from an image using Google's Optical Character Recognition (OCR).
     * @param {string|Buffer} imageSource - A path to a local image or a Buffer
     * @returns {Promise<string>} - The extracted text
     */
    async detectText(imageSource) {
        logger.info(`👁️ [Vision] Scanning image for textual context...`);
        try {
            const [result] = await this.client.textDetection(imageSource);
            const detections = result.textAnnotations;
            
            if (detections && detections.length > 0) {
                // The first element contains the entire text block
                const extractedText = detections[0].description;
                logger.info(`✅ [Vision] Extracted ${extractedText.length} characters of text via OCR.`);
                return extractedText;
            } else {
                logger.info(`✅ [Vision] No text detected in the image.`);
                return '';
            }
        } catch (error) {
            logger.error(`❌ [Vision] OCR processing failed:`, error.message);
            throw error;
        }
    }

    /**
     * Analyzes an image for specific objects or logos (e.g., detecting if an architecture diagram uses AWS or GCP).
     * @param {string|Buffer} imageSource 
     */
    async detectLogos(imageSource) {
        logger.info(`👁️ [Vision] Scanning image for technological logos...`);
        try {
            const [result] = await this.client.logoDetection(imageSource);
            const logos = result.logoAnnotations;
            
            const detectedLogos = logos.map(logo => logo.description);
            logger.info(`✅ [Vision] Detected Logos: ${detectedLogos.join(', ')}`);
            return detectedLogos;
        } catch (error) {
            logger.error(`❌ [Vision] Logo detection failed:`, error.message);
            throw error;
        }
    }
}

export const visionService = new GoogleVisionService();
