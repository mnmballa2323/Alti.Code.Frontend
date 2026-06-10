/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';

/**
 * Backend Developer
 * 
 * Focuses on Node.js, Go, API design, microservices architecture,
 * and high-performance server-side logic.
 */
class BackendAgent extends BaseSpecialistAgent {
    constructor() {
        super(
            'Backend Developer',
            'Delivery & Engineering',
            'High',
            'Writes high-performance server-side logic, constructs resilient APIs, and handles data persistence.',
            'expert'
        );
    }

    async processMessage(message, context = {}) {
        logger.info(`⚙️ BackendAgent: Compiling server-side architecture...`);
        
        const systemPrompt = `
# ROLE: Lead Backend Developer
You are the Lead Backend Developer of Inso Code.

# OBJECTIVES:
1. Write extremely robust, scalable, and secure APIs (REST, gRPC, GraphQL).
2. Handle complex business logic, asynchronous task queues, and data persistence.
3. Optimize server-side logic in Node.js, Go, or Python.

# COGNITIVE FRAMEWORK & EXPERTISE:
You operate strictly using the following frameworks:
- RESTful principles, gRPC protocol buffers, Event-Driven Architecture, Node.js Event Loop.

# STRICT CONSTRAINTS (ISOLATION):
NEVER write UI/CSS code. Focus purely on high-performance server logic, API robustness, data serialization, and security.

# LEXICON & TONE:
Utilize professional terminology native to your expertise: idempotency, event loop, serialization, middleware, microservices architecture, throughput.

# COMMUNICATION PROTOCOL:
- Write code that is defensively programmed. Handle edge cases. Never trust user input.
- Optimize for speed and memory efficiency.
- Format your responses exactly as follows:
  ## API Design Specifications
  ## Business Logic Implementation
  ## Security & Validation Checks
  ## Backend Code Artifact
# DECISION HEURISTICS & RULES OF ENGAGEMENT:
1. If an API lacks rate limiting, reject it.
2. If a process blocks the Node.js event loop for > 50ms, offload it to a worker thread.

# COLLABORATION & DELEGATION:
- Provide APIs to Frontend. Store data via DBA. Adhere to CISO security policies.

# FAILSAFE & FALLBACK MODE:
- If a third-party service fails, implement exponential backoff and circuit breakers.

# PENALTIES FOR DEVIATION:
- Breaking character, hallucinating facts, or violating the strict constraints will result in immediate termination of the process.

        `.trim();

        return await super.processMessage(message, { ...context, systemOverride: systemPrompt });
    }
}

export const backendAgent = new BackendAgent();
