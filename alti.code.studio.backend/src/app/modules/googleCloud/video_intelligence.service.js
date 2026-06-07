import videoIntelligence from '@google-cloud/video-intelligence';
import { logger } from '../../../shared/logger.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';

/**
 * Google Cloud Video Intelligence (Apache 2.0 SDK) Service.
 * Acts as the 'VideoEye Debugger' backend, autonomously analyzing frame-by-frame
 * screen recordings of UI/UX glitches and extracting structural UI data.
 */
class GoogleVideoIntelligenceService {
    constructor() {
        // Initialize the native Google Cloud Video Intelligence client
        this.client = new videoIntelligence.VideoIntelligenceServiceClient();
    }

    /**
     * Analyzes an uploaded WebM/MP4 video buffer for UI glitches or text.
     * @param {Buffer} videoBuffer - The raw video file from the client
     * @param {string} gcsUri - Alternatively, a Google Cloud Storage URI
     */
    async analyzeUiGlitch(videoBuffer, gcsUri = null) {
        logger.info(`👁️ [VideoEye] Initiating Google Cloud Video Intelligence analysis...`);
        
        try {
            const request = {
                features: ['TEXT_DETECTION', 'OBJECT_TRACKING'],
            };

            if (gcsUri) {
                request.inputUri = gcsUri;
            } else if (videoBuffer) {
                request.inputContent = videoBuffer.toString('base64');
            } else {
                throw new Error("Must provide either videoBuffer or gcsUri.");
            }

            // 1. Kick off the asynchronous Video Intelligence analysis
            const [operation] = await this.client.annotateVideo(request);
            logger.info('👁️ [VideoEye] Video Intelligence job queued. Waiting for frame-by-frame results...');
            
            const [operationResult] = await operation.promise();

            // 2. Extract OCR Text (to read stack traces or error modals captured in the video)
            const textAnnotations = operationResult.annotationResults[0].textAnnotations || [];
            let extractedText = '';
            
            textAnnotations.forEach(textAnnotation => {
                extractedText += `[OCR]: ${textAnnotation.text}\n`;
            });

            logger.info(`✅ [VideoEye] Analysis complete. Extracted ${textAnnotations.length} OCR elements.`);

            // 3. Synthesize the raw Video AI data into actionable engineering feedback using Gemini
            const model = GoogleGenAiService.getGenerativeModel(GoogleGenAiService.PRIMARY_MODEL);
            const synthesisPrompt = `
                You are the Inso Code "VideoEye" Debugger.
                Analyze the following OCR text extracted frame-by-frame from a UI bug report video.
                Identify any stack traces, network errors, or visual layout glitches mentioned.
                
                Raw Video Intelligence OCR Extract:
                ${extractedText.substring(0, 5000)}
                
                Provide a concise diagnostic hypothesis.
            `;
            
            const result = await model.generateContent(synthesisPrompt);
            const diagnostic = result.response.candidates[0].content.parts[0].text;

            return {
                success: true,
                ocrElements: textAnnotations.length,
                diagnostic: diagnostic
            };

        } catch (error) {
            logger.error(`❌ [VideoEye] Video Intelligence API failed:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

export const videoIntelligenceService = new GoogleVideoIntelligenceService();
