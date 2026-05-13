/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * AI Provider — "The Eternal Core"
 * Model-agnostic AI provider. Swap any model (Gemini, GPT-5, Claude, Llama, etc.)
 * and the entire system instantly benefits without changing a single agent.
 * 
 * Architecture:
 *   Agent → AIProvider.reason() → Current Best Model
 *   Agent → AIProvider.generate() → Current Best Model  
 *   Agent → AIProvider.embed() → Current Best Embedding Model
 * 
 * When models improve, swap one config line. 10,000,000 years of evolution.
 */

import { logger } from '../../../shared/logger.js';

// ALL SUPPORTED PROVIDERS
const PROVIDERS = {
    gemini: {
        name: 'Google Gemini',
        initialize: async () => {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        },
        reason: async (client, prompt, options = {}) => {
            const model = client.getGenerativeModel({ model: options.model || 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        },
        generate: async (client, prompt, options = {}) => {
            const model = client.getGenerativeModel({ model: options.model || 'gemini-2.0-flash' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    },
    openai: {
        name: 'OpenAI',
        initialize: async () => {
            const { default: OpenAI } = await import('openai');
            return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        },
        reason: async (client, prompt, options = {}) => {
            const response = await client.chat.completions.create({
                model: options.model || 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature || 0.3
            });
            return response.choices[0].message.content;
        },
        generate: async (client, prompt, options = {}) => {
            const response = await client.chat.completions.create({
                model: options.model || 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature || 0.7
            });
            return response.choices[0].message.content;
        }
    },
    anthropic: {
        name: 'Anthropic Claude',
        initialize: async () => {
            const { default: Anthropic } = await import('@anthropic-ai/sdk');
            return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        },
        reason: async (client, prompt, options = {}) => {
            const response = await client.messages.create({
                model: options.model || 'claude-sonnet-4-20250514',
                max_tokens: options.maxTokens || 4096,
                messages: [{ role: 'user', content: prompt }]
            });
            return response.content[0].text;
        },
        generate: async (client, prompt, options = {}) => {
            const response = await client.messages.create({
                model: options.model || 'claude-sonnet-4-20250514',
                max_tokens: options.maxTokens || 8192,
                messages: [{ role: 'user', content: prompt }]
            });
            return response.content[0].text;
        }
    },
    local: {
        name: 'Local / Ollama',
        initialize: async () => {
            // Ollama runs on localhost:11434
            return { baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434' };
        },
        reason: async (client, prompt, options = {}) => {
            const response = await fetch(`${client.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: options.model || 'llama3', prompt, stream: false })
            });
            const data = await response.json();
            return data.response;
        },
        generate: async (client, prompt, options = {}) => {
            const response = await fetch(`${client.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: options.model || 'llama3', prompt, stream: false })
            });
            const data = await response.json();
            return data.response;
        }
    }
};

class AIProvider {
    constructor() {
        this.activeProvider = process.env.AI_PROVIDER || 'gemini';
        this.client = null;
        this.providers = PROVIDERS;
        this.fallbackOrder = ['gemini', 'openai', 'anthropic', 'local'];
    }

    async init() {
        const provider = this.providers[this.activeProvider];
        if (!provider) {
            logger.error(`❌ AIProvider: Unknown provider "${this.activeProvider}"`);
            return;
        }
        try {
            this.client = await provider.initialize();
            logger.info(`🧠 AIProvider: Initialized [${provider.name}]`);
        } catch (err) {
            logger.warn(`⚠️ AIProvider: Failed to init [${provider.name}]: ${err.message}. Trying fallback...`);
            await this._initFallback();
        }
    }

    async _initFallback() {
        for (const name of this.fallbackOrder) {
            if (name === this.activeProvider) continue;
            const provider = this.providers[name];
            try {
                this.client = await provider.initialize();
                this.activeProvider = name;
                logger.info(`🧠 AIProvider: Fallback to [${provider.name}]`);
                return;
            } catch { /* continue */ }
        }
        logger.error('❌ AIProvider: All providers failed.');
    }

    /**
     * Reason — low temperature, analytical thinking.
     * Used by SecurityWorker, MonitoringWorker, QAWorker.
     */
    async reason(prompt, options = {}) {
        const provider = this.providers[this.activeProvider];
        return provider.reason(this.client, prompt, { ...options, temperature: 0.2 });
    }

    /**
     * Generate — higher temperature, creative generation.
     * Used by RefactorWorker, IacWorker, CiCdWorker.
     */
    async generate(prompt, options = {}) {
        const provider = this.providers[this.activeProvider];
        return provider.generate(this.client, prompt, { ...options, temperature: 0.7 });
    }

    /**
     * Register a new provider at runtime. 
     * Future models → just call aiProvider.register('newModel', { ... })
     */
    register(name, providerConfig) {
        this.providers[name] = providerConfig;
        logger.info(`🧠 AIProvider: Registered new provider [${name}]`);
    }

    /** Switch active provider */
    async switchTo(providerName) {
        if (!this.providers[providerName]) {
            throw new Error(`Unknown provider: ${providerName}`);
        }
        this.activeProvider = providerName;
        this.client = await this.providers[providerName].initialize();
        logger.info(`🧠 AIProvider: Switched to [${this.providers[providerName].name}]`);
    }

    /** Get current provider info */
    getInfo() {
        return {
            active: this.activeProvider,
            name: this.providers[this.activeProvider]?.name,
            available: Object.keys(this.providers)
        };
    }
}

export const aiProvider = new AIProvider();
