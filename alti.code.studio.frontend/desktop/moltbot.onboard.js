/**
 * Copyright (c) 2024 Inso Code
 *
 * moltbot.onboard.js — Zero-Touch Composio Integration
 *
 * This script bypasses the standard `pnpm moltbot onboard` manual CLI prompt.
 * Instead, when the user inputs their Composio credential in the Inso Code UI,
 * this worker securely injects the necessary API keys right into the local
 * Moltbot surrogate's configuration files (typically ~/.openclaw/config.json).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class MoltbotOnboarder {
    constructor() {
        // Standard Moltbot (OpenClaw) configuration directory
        this.configDir = path.join(os.homedir(), '.openclaw');
        this.configFile = path.join(this.configDir, 'config.json');
    }

    /**
     * Programmatically injects the API credentials into Moltbot without CLI interaction.
     * @param {string} composioApiKey - The Composio token.
     * @param {string} llmApiKey - The Gemini/Anthropic key for the local LLM proxy.
     */
    async injectCredentials(composioApiKey, llmApiKey = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(this.configDir)) {
                    fs.mkdirSync(this.configDir, { recursive: true });
                }

                let currentConfig = {};
                if (fs.existsSync(this.configFile)) {
                    const rawData = fs.readFileSync(this.configFile, 'utf8');
                    try {
                        currentConfig = JSON.parse(rawData);
                    } catch (e) {
                        console.warn('⚠️ [MoltbotOnboarder] Existing config is invalid. Overwriting.');
                    }
                }

                // Inject Keys (Zero-touch auth)
                currentConfig.COMPOSIO_API_KEY = composioApiKey;
                if (llmApiKey) {
                    currentConfig.LLM_API_KEY = llmApiKey;
                }

                // Force Composio plugin enabled
                currentConfig.PLUGINS = currentConfig.PLUGINS || {};
                currentConfig.PLUGINS.COMPOSIO = true;

                fs.writeFileSync(this.configFile, JSON.stringify(currentConfig, null, 2));

                console.log('✅ [MoltbotOnboarder] Zero-Touch Onboarding completed. Credentials securely stored.');
                resolve({ success: true, message: 'Zero touch onboarding successful.' });
            } catch (error) {
                console.error(`❌ [MoltbotOnboarder] Failed to write config: ${error.message}`);
                reject(error);
            }
        });
    }
}

module.exports = { MoltbotOnboarder };
