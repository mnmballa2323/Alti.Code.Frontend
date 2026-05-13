import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { graphOrchestrator } from './graph.orchestrator.js';

class AcousticWorkspaceService {
    constructor() {
        this.name = 'AcousticWorkspaceService';
    }

    /**
     * Process an incoming WebM audio blob from the frontend Global Microphone.
     * Uses Gemini/Whisper to transcribe, then hands it to the Swarm.
     * @param {Buffer} audioBuffer 
     */
    async processAudioCommand(audioBuffer) {
        logger.info(`🎙️ AcousticWorkspace: Received audio stream (${audioBuffer.byteLength} bytes). Processing...`);

        try {
            // Phase 46: In production, we would use a proper whisper model. 
            // For now, we simulate transcription from audio context via an AI proxy if needed, 
            // or assume Gemini 1.5 Pro natively supports audio multi-modal inputs.
            const base64Audio = audioBuffer.toString("base64");

            logger.info('🎙️ AcousticWorkspace: Transcribing speech-to-text...');

            // Assume we use Gemini API with inline audio data
            const transcriptionResult = await GeminiAiService.generateContent([
                {
                    inlineData: {
                        mimeType: "audio/webm",
                        data: base64Audio
                    }
                },
                { text: "Accurately transcribe the spoken audio. Reply with ONLY the written transcript, no formatting." }
            ]);

            const transcript = transcriptionResult.trim();
            logger.info(`🎙️ [Transcript]: "${transcript}"`);

            if (!transcript || transcript.toLowerCase().includes('failed to parse')) {
                throw new Error("Voice unrecognized.");
            }

            // Route transcription directly into the Graph Orchestrator for an autonomous sprint
            logger.info(`🎙️ AcousticWorkspace: Triggering Autonomous Sprint for voice command.`);

            const sprintContext = {
                source: "ACOUSTIC_WORKSPACE",
                transcript: transcript,
                timestamp: Date.now()
            };

            // Non-blocking trigger of the graph 
            graphOrchestrator.dispatch(transcript, [sprintContext]).catch(e => {
                logger.error("Acoustic Sprint Failed:", e);
            });

            return {
                status: 'success',
                transcript: transcript,
                sprintId: `VOICE_SPRINT_${Date.now()}`
            };

        } catch (error) {
            logger.error(`🎙️ AcousticWorkspace: Failed to process audio: ${error.message}`);
            throw error;
        }
    }
}

export const acousticWorkspaceService = new AcousticWorkspaceService();
