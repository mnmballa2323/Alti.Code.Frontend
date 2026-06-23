/**
 * Copyright (c) 2026 Inso Code
 *
 * mastra_agent.service.js — Mastra Agent Service Wrapper.
 * Provides hooks for defining and invoking Mastra autonomous agents.
 */

import { Agent } from '@mastra/core';
import config from '../../../../config/index.js';
import { azureSovereignCompatService } from '../ai/azureSovereignCompat.service.js';

export class MastraAgentService {
    /**
     * Creates a new Mastra Agent instance.
     * @param {object} options 
     * @returns {Agent} Mastra Agent
     */
    static createAgent(options = {}) {
        const modelName = options.model || config.azure.model_name || 'gpt-5.5';
        
        return new Agent({
            id: options.id || 'mastra-agent',
            name: options.name || 'Mastra Agent',
            instructions: options.instructions || 'You are a helpful assistant.',
            model: {
                provider: 'google',
                name: modelName
            }
        });
    }

    /**
     * Invokes the agent with a prompt.
     * @param {Agent} agent 
     * @param {string} prompt 
     * @returns {Promise<{text: string}>} Response text
     */
    static async generate(agent, prompt) {
        if (azureSovereignCompatService.isMockMode || process.env.NODE_ENV === 'test') {
            return {
                text: `[Mastra Agent Mock] Response for prompt: "${prompt.substring(0, 40)}" using agent ${agent.name}`
            };
        }

        try {
            const result = await agent.generate(prompt);
            return {
                text: result?.text || String(result)
            };
        } catch (error) {
            console.error('MastraAgentService.generate failed:', error);
            return {
                text: `[Mastra Agent Fallback] I received your request: "${prompt}". Mastra execution encountered error: ${error.message}`
            };
        }
    }
}

export default MastraAgentService;
