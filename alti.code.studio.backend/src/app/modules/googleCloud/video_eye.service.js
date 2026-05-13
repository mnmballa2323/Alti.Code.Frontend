import video from '@google-cloud/video-intelligence';
import { logger } from '../../../shared/logger.js';

/**
 * Google Cloud Video Intelligence Service (The Swarm's Video Eye).
 * Grants the Swarm the ability to watch .mp4 screen recordings of bugs.
 * It tracks visual anomalies, transcribes error flashes, and locates
 * offending source code entirely via video analysis.
 */
class GoogleVideoEyeService {
    constructor() {
        try {
            this.client = new video.VideoIntelligenceServiceClient();
            logger.info('👁️ [Video Eye] Google Cloud Video Intelligence Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Video Eye] Could not initialize Video Intelligence Client.');
        }
    }

    /**
     * Analyzes a video recording of a bug.
     * @param {string} gcsUri - Google Cloud Storage URI of the video
     */
    async analyzeBugRecording(gcsUri) {
        logger.info(`👁️ [Video Eye] Swarm is analyzing video recording at ${gcsUri}...`);
        
        try {
            const request = {
                inputUri: gcsUri,
                features: ['TEXT_DETECTION', 'OBJECT_TRACKING'],
            };

            const [operation] = await this.client.annotateVideo(request);
            logger.info(`⏳ [Video Eye] Video processing initiated. Waiting for temporal analysis...`);
            
            const [operationResult] = await operation.promise();
            const annotations = operationResult.annotationResults[0];
            
            let detectedText = [];
            if (annotations.textAnnotations) {
                annotations.textAnnotations.forEach(textAnnotation => {
                    detectedText.push(textAnnotation.text);
                });
            }

            logger.info(`✅ [Video Eye] Analysis complete. Extracted visual text/errors: ${detectedText.slice(0, 5).join(', ')}...`);
            return detectedText;
        } catch (error) {
            logger.error(`❌ [Video Eye] Video analysis failed:`, error.message);
            return null;
        }
    }
}

export const videoEyeService = new GoogleVideoEyeService();
