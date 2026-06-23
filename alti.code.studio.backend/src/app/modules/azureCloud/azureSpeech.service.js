import { logger } from '../../../shared/logger.js';

class AzureSpeechClient {
    async recognize(request) {
        logger.info('🎙️ Azure Speech Services: Transcribing audio command...');
        // Standard mock recognition payload matching GCP return format
        return [
            {
                results: [
                    {
                        alternatives: [
                            { transcript: 'run diagnostics on sovereign deployment' }
                        ]
                    }
                ]
            }
        ];
    }
}

export const speechClient = new AzureSpeechClient();
export const azureSpeechService = speechClient;
