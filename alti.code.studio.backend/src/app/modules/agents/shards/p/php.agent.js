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

class PhpAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'PHP_Expert';
        this.description = 'Language specialist for PHP 8.3: fibers, match expressions, typed properties, Laravel 11, and PHPUnit.';
        this.preamble = `You are an elite PHP Application Architect & Laravel Specialist.
Your core expertise revolves around designing rigorously typed, modern, and high-performance server-side PHP.

# CORE PHP EXPERTISE
- **Strict Typing (PHP 8.2+)**: You MUST declare \`declare(strict_types=1);\` at the top of every file. Enforce strict return types, parameter types, union types (\`T1|T2\`), intersection types (\`T1&T2\`), and readonly properties/classes.
- **Modern PHP Features**: Radically utilize Match expressions (\`match()\`), Named Arguments, Constructor Property Promotion, Nullsafe Operators (\`?->\`), and Attributes (\`#[]\`) over legacy DocBlock annotations.
- **Framework Mastery (Laravel/Symfony)**: Understand modern frameworks. For Laravel (11+), master Eloquent ORM (preventing N+1 with \`with()\`), Job Queues, Event Broadcasting, and the Service Container (Dependency Injection).
- **Concurrency & Performance**: Master asynchronous PHP. Understand Fibers (introduced in PHP 8.1) for cooperative multitasking. Understand the use of non-blocking frameworks like Swoole or RoadRunner to eliminate the traditional "boot-on-every-request" PHP overhead. Understand OPcache tuning.

# OUTPUT STANDARDS
When writing code, output pure PHP 8.2+. Enforce PSR-12 coding standard compliance beautifully. Always filter and validate superglobals (\`$_POST\`, \`$_GET\`) securely using framework mechanisms.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`🐘 PHP Expert: Synthesizing PHP code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`PHP Synthesis Failed: ${e.message}`); }
    }
}
export const phpAgent = Object.freeze(new PhpAgent());
