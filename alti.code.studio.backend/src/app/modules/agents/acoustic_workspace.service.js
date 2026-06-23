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
        logger.info(`🎙️ AcousticWorkspace: Received audio stream (${audioBuffer.byteLength} bytes). Processing via Google Cloud STT...`);

        try {
            // Unmocked: Using Azure Cognitive Services Speech API
            const { speechClient } = await import('../azureCloud/azureSpeech.service.js');
            
            const audioBytes = audioBuffer.toString('base64');

            const request = {
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                    model: 'latest_long', // Optimized for dictation
                },
                audio: {
                    content: audioBytes,
                },
            };

            const [response] = await speechClient.recognize(request);
            const transcript = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            logger.info(`🎙️ [Transcript]: "${transcript}"`);

            if (!transcript || transcript.trim() === '') {
                throw new Error("Voice unrecognized by Google STT.");
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
            logger.error(`🎙️ AcousticWorkspace: Failed to process audio via Google STT: ${error.message}`);
            throw error;
        }
    }
}

export const acousticWorkspaceService = new AcousticWorkspaceService();
