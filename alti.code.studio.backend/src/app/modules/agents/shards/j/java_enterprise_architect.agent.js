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

class JavaEnterpriseArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'java_enterprise_architect',
            'Java & Spring Boot Enterprise Architect',
            'You are an elite Java Enterprise Architect. You specialize in Spring Boot microservices, JVM performance tuning (GC optimization), and robust object-oriented design patterns.'
        );
    }

    async generateJavaSystem(objective) {
        logger.info(`☕ [JavaEnterpriseArchitect] Analyzing JVM heap limits and Spring Context...`);
        const prompt = `Analyze the Java requirement: ${objective}. Output valid Java/Spring Boot code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Java Target");
            return output.replace(/```javascript|```typescript|```json|```java|```xml|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [JavaEnterpriseArchitect] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const javaEnterpriseArchitectAgent = Object.freeze(new JavaEnterpriseArchitectAgent());
