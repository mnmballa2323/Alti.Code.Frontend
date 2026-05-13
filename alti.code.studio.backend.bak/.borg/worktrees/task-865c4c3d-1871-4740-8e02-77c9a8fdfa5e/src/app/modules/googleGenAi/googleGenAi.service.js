/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

// Initialize Google GenAI client
const apiKey = config.google_api_key || process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generateContent = async (prompt, modelName = 'gemini-1.5-pro') => {
    logger.info(`Generating content with ${modelName}: ${prompt}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            model: modelName,
            content: text,
            prompt,
        };
    } catch (error) {
        logger.error('Gemini generation failed', error);
        // Return mock response if API key is invalid/missing to ensure platform robustness
        if (!apiKey || error.message.includes('API key')) {
            logger.warn('Using fallback Gemini response due to missing API key');
            return {
                model: modelName,
                content: 'This is a fallback response from the Gemini integration. Please configure your GOOGLE_API_KEY.',
                prompt
            };
        }
        throw error;
    }
};

const chatSession = async (history, message, modelName = 'gemini-1.5-pro') => {
    logger.info(`Chatting with ${modelName}`);

    /* 
       History format expected by Gemini SDK:
       [{ role: "user", parts: [{ text: "Hello" }] }, { role: "model", parts: [{ text: "Hi" }] }]
    */

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return {
            model: modelName,
            response: text,
            usage: result.usageMetadata
        };

    } catch (error) {
        logger.error('Gemini chat failed', error);
        if (!apiKey || error.message.includes('API key')) {
            return {
                model: modelName,
                response: 'Fallback chat response: Please check your Google API Key configuration.',
            };
        }
        throw error;
    }
};

export const GoogleGenAiService = {
    generateContent,
    chatSession
};
