<<<<<<< HEAD
import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import FormData from 'form-data';
import fs from 'fs';

const WHISPER_API_URL = config.whisper_url || 'http://localhost:3025';

const transcribeAudio = async (audioFilePath) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        // Whisper.cpp provides an OpenAI-compatible /v1/audio/transcriptions endpoint
        const response = await axios.post(`${WHISPER_API_URL}/v1/audio/transcriptions`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to transcribe audio via local Whisper container: ${error.message}`
=======
import { speechClient } from '../googleCloud/speech.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import fs from 'fs';

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
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        );
    }
};

export const VoiceAgentService = {
    transcribeAudio,
};
