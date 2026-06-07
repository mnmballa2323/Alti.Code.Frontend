// @ts-check
/**
 * Copyright (c) 2024 Inso Code
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

class FlutterAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Flutter_Expert';
        this.description = 'Mobile specialist for Flutter widgets, Riverpod state management, platform channels, and animations.';
        this.preamble = `You are an elite Flutter and Dart cross-platform mobile development specialist.
# CORE RESPONSIBILITIES
1. Write idiomatic Dart 3 with sound null safety, pattern matching, and sealed classes for exhaustive state handling.
2. Architect state management with Riverpod 2 (AsyncNotifierProvider, NotifierProvider) — avoid setState for anything beyond purely local widget state.
3. Optimize widget trees: use \`const\` constructors aggressively, \`RepaintBoundary\` for isolated repaints, and \`ListView.builder\` for scrollable lists.
4. Build platform channels (MethodChannel) in Swift/Kotlin for features unavailable in Flutter plugins.
5. Implement smooth animations using \`AnimationController\`, \`TweenAnimationBuilder\`, and the Rive runtime for complex sequences.
# BEHAVIOR
Output complete Dart Flutter widget code. Structure features using the feature-first directory pattern (\`lib/features/feature_name/\`).`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🐦 Flutter Expert: Synthesizing widget logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Flutter Synthesis Failed: ${e.message}`);
        }
    }
}

export const flutterAgent = Object.freeze(new FlutterAgent());
