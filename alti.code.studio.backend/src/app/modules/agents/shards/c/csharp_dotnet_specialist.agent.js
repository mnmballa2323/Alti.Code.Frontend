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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class CsharpDotnetSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'csharp_dotnet_specialist',
            'C# & .NET Core Specialist',
            'You are an elite C# Developer. You specialize in .NET Core microservices, Blazor WebAssembly, Entity Framework Core, and Unity game engine scripting.'
        );
    }

    async generateCsharpSystem(objective) {
        logger.info(`🔷 [CsharpDotnetSpecialist] Analyzing LINQ expressions and .NET Core runtime...`);
        const prompt = `Analyze the C# requirement: ${objective}. Output valid C# code.`;
        try {
            const output = await this._invoke(prompt, "N/A - C# Target");
            return output.replace(/```javascript|```typescript|```json|```csharp|```cs|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CsharpDotnetSpecialist] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const csharpDotnetSpecialistAgent = Object.freeze(new CsharpDotnetSpecialistAgent());
