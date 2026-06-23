import { speechClient } from '../azureCloud/azureSpeech.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';

const transcribeAudio = async (audioFilePath) => {
    try {
        const audioBytes = fs.readFileSync(audioFilePath).toString('base64');
        const audio = { content: audioBytes };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            model: 'latest_long',
        };
        const request = { audio, config };

        logger.info(`[GCP STT] Transcribing audio natively via Google Cloud Speech-to-Text...`);
        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
            
        return { text: transcription };
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to transcribe audio via Google Cloud: ${error.message}`
        );
    }
};

export const VoiceAgentService = {
    transcribeAudio,
};
