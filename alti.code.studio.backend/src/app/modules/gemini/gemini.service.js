import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { GeminiAiService as BaseGeminiAiService } from '../geminiOpenMemory/geminiOpenMemo.service.js';

export const GeminiAiService = {
    ...BaseGeminiAiService,
    generateContent: GoogleGenAiService.generateContent,
};
