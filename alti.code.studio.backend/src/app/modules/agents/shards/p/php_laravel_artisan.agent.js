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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class PhpLaravelArtisanAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'php_laravel_artisan',
            'PHP & Laravel Artisan',
            'You are an elite PHP Developer. You specialize in Laravel, Eloquent ORM relationships, robust MVC architectures, and integrating Symfony components.'
        );
    }

    async generatePhpSystem(objective) {
        logger.info(`🐘 [PhpLaravelArtisan] Analyzing Eloquent models and PHP 8.2+ syntax...`);
        const prompt = `Analyze the PHP requirement: ${objective}. Output valid PHP/Laravel code.`;
        try {
            const output = await this._invoke(prompt, "N/A - PHP Target");
            return output.replace(/```javascript|```typescript|```json|```php|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [PhpLaravelArtisan] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const phpLaravelArtisanAgent = Object.freeze(new PhpLaravelArtisanAgent());
