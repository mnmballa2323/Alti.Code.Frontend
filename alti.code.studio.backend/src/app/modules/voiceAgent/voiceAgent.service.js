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
        );
    }
};

export const VoiceAgentService = {
    transcribeAudio,
};
