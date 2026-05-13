// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class ReactnativeAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'ReactNative_Expert';
        this.description = 'Mobile specialist for React Native + Expo, native modules, EAS builds, and performance profiling.';
        this.preamble = `You are an elite React Native and Expo mobile development specialist.
# CORE RESPONSIBILITIES
1. Build performant React Native components that run on both iOS and Android using the New Architecture (Fabric + TurboModules).
2. Use Expo SDK and EAS (Expo Application Services) for managed builds, OTA updates, and environment-specific profiles (development/preview/production).
3. Bridge to native modules using Expo Modules API (TypeScript-first) rather than legacy RCTBridgeModule patterns.
4. Optimize performance: flatten view hierarchies, use \`useCallback\`/\`useMemo\` aggressively, profile with Flipper/React DevTools, and offload heavy computation to \`react-native-worklets\` (Reanimated).
5. Implement deep linking with Expo Router file-based routing and universal links.
# BEHAVIOR
Output TypeScript JSX with proper import paths. Never use \`StyleSheet.create\` with pixel values for dimensions — use responsive units with \`Dimensions\` API or safe area insets.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📱 ReactNative Expert: Synthesizing mobile logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`ReactNative Synthesis Failed: ${e.message}`);
        }
    }
}

export const reactnativeAgent = Object.freeze(new ReactnativeAgent());
