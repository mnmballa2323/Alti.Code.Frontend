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
<<<<<<< HEAD
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
=======
        logger.info(`🎙️ AcousticWorkspace: Received audio stream (${audioBuffer.byteLength} bytes). Processing via Google Cloud STT...`);

        try {
            // Unmocked: Using Google Cloud Speech-to-Text V2 API
            const { speechClient } = await import('../googleCloud/speech.service.js');
            
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
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
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
<<<<<<< HEAD
            logger.error(`🎙️ AcousticWorkspace: Failed to process audio: ${error.message}`);
=======
            logger.error(`🎙️ AcousticWorkspace: Failed to process audio via Google STT: ${error.message}`);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            throw error;
        }
    }
}

export const acousticWorkspaceService = new AcousticWorkspaceService();
