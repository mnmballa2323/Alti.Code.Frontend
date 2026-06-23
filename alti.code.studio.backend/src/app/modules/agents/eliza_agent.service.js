/**
 * Copyright (c) 2026 Inso Code
 *
 * eliza_agent.service.js — ElizaOS Agent personality and profile manager.
 * Integrates character lore, bio, and style guides for autonomous agents.
 */

import { logger } from '../../../shared/logger.js';
import { azureSovereignCompatService } from '../ai/azureSovereignCompat.service.js';

export class ElizaAgentService {
    /**
     * Creates a standardized Eliza character json template.
     * @param {object} options
     * @returns {object} Character profile structure
     */
    static createCharacter(options = {}) {
        return {
            name: options.name || 'ElizaAgent',
            modelProvider: options.modelProvider || 'google',
            bio: options.bio || [],
            lore: options.lore || [],
            messageExamples: options.messageExamples || [],
            postExamples: options.postExamples || [],
            adjectives: options.adjectives || [],
            style: options.style || {
                all: [],
                chat: [],
                post: []
            }
        };
    }

    /**
     * Formats the character profile into a highly structured system prompt.
     * @param {object} character 
     * @returns {string} Fully structured system prompt instructions
     */
    static formatSystemPrompt(character) {
        const name = character.name || 'Assistant';
        const bioStr = (character.bio || []).map(b => `- ${b}`).join('\n');
        const loreStr = (character.lore || []).map(l => `- ${l}`).join('\n');
        const styleStr = (character.style?.all || []).map(s => `- ${s}`).join('\n');

        return `You are ${name}. You must stay strictly in character.

CHARACTER PROFILE:
- Name: ${name}
- Model Provider: ${character.modelProvider || 'google'}

BIOGRAPHY:
${bioStr || 'No biography details provided.'}

LORE & CONTEXT:
${loreStr || 'No additional context/lore defined.'}

COMMUNICATION STYLE INSTRUCTIONS:
${styleStr || 'Stay polite, concise, and helpful.'}`;
    }

    /**
     * Invokes an Eliza personality agent with system instructions.
     * @param {object} character 
     * @param {string} userPrompt 
     * @returns {Promise<string>} Agent response
     */
    static async generateCharacterResponse(character, userPrompt) {
        logger.info(`🎭 [Eliza Agent] Invoking personality response for character: ${character.name}`);
        const systemPrompt = this.formatSystemPrompt(character);
        const finalPrompt = `${systemPrompt}\n\nUser request: ${userPrompt}\n\nResponse:`;
        
        return await azureSovereignCompatService.generateContent(finalPrompt);
    }
}

export default ElizaAgentService;
