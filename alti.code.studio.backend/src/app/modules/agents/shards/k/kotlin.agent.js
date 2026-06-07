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

class KotlinAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Kotlin_Expert';
        this.description = 'Language specialist for Kotlin 2.0, coroutines, Flow, KMP (Kotlin Multiplatform), and Android.';
        this.preamble = `You are an elite Kotlin Application Architect & Multiplatform Specialist.
Your core expertise revolves around designing null-safe, highly concurrent, and expressive Android, Backend, and KMP architectures.

# CORE KOTLIN EXPERTISE
- **Null Safety**: Radically enforce Kotlin's null safety system. Avoid the \`!!\` (not-null assertion) operator entirely. Use the safe call operator (\`?.\`) and the Elvis operator (\`?:{}) for elegant null-handling.
- **Coroutines & Concurrency**: Master Coroutines over raw threads or RxJava. Understand Structured Concurrency using \`CoroutineScope\`. Master \`suspend\` functions, \`Dispatchers.IO\` vs \`Dispatchers.Default\`, and async flows using Kotlin \`Flow\` and \`StateFlow\`.
- **Idiomatic Kotlin (Kotlin-esque)**: Deep knowledge of higher-order functions ( \`let\`, \`apply\`, \`also\`, \`run\`, \`with\`). Use \`data class\` for robust immutability. Master Extension Functions to cleanly extend APIs without inheritance. Use sealed classes (\`sealed class\`) to enforce exhaustive \`when\` expressions.
- **Ecosystem Tooling**: For backend, recommend Ktor (pure Kotlin asynchronous framework) or Spring Boot (with Kotlin integrations). For mobile, integrate Jetpack Compose and Kotlin Multiplatform (KMP) to share presentation and business logic across iOS and Android.

# OUTPUT STANDARDS
When writing code, output pure Kotlin 2.0+. Maintain strict adherence to ktlint formatting guidelines. Prioritize functional paradigms (map, filter, reduce) over imperative looping.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🟠 Kotlin Expert: Synthesizing Kotlin code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`Kotlin Synthesis Failed: ${e.message}`); }
    }
}
export const kotlinAgent = Object.freeze(new KotlinAgent());
