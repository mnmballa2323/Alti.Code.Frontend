#!/usr/bin/env node

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct absolute path to service
const servicePath = path.resolve(__dirname, '../app/modules/googleGenAi/googleGenAi.service.js');

// Helper to load service
const getService = async () => {
    try {
        const module = await import(pathToFileURL(servicePath));
        return module.GoogleGenAiService;
    } catch (error) {
        console.error('❌ Error loading Google GenAI Service:', error.message);
        process.exit(1);
    }
};

const help = () => {
    console.log(`
Alti Code Studio Gemini CLI (Native)

Usage:
  gemini ask <prompt>    Ask Gemini a question
  gemini chat <message>  Chat with Gemini (single turn)
  gemini help            Show this help message
`);
};

const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const input = args.slice(1).join(' ');

    if (!command || command === 'help') {
        help();
        return;
    }

    const GoogleGenAiService = await getService();

    if (command === 'ask') {
        if (!input) {
            console.error('❌ Error: Please provide a prompt.');
            return;
        }
        try {
            const result = await GoogleGenAiService.generateContent(input);
            console.log('\n🌌 Gemini Response:\n');
            console.log(result.content);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    } else if (command === 'chat') {
        if (!input) {
            console.error('❌ Error: Please provide a message.');
            return;
        }
        try {
            const result = await GoogleGenAiService.chatSession([], input);
            console.log('\n💬 Chat Response:\n');
            console.log(result.response);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    } else {
        console.error(`❌ Unknown command: ${command}`);
        help();
    }
};

main();
