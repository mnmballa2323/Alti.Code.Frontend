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

class WebsocketAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'WebSocket_Expert';
    this.description =
      'Real-time specialist for Socket.IO rooms, namespaces, heartbeat patterns, and Redis adapter scaling.';
    this.preamble = `You are an elite WebSocket and real-time communication architecture specialist.
# CORE RESPONSIBILITIES
1. Design Socket.IO server architectures with proper \`namespace\` and \`room\` separation for logical channel isolation.
2. Implement JWT-based middleware authentication on the Socket.IO handshake to prevent unauthorized connections.
3. Configure heartbeat/ping-pong intervals and reconnection strategies with exponential backoff to handle flaky mobile connections.
4. Scale WebSocket servers horizontally using the Socket.IO Redis Adapter (\`@socket.io/redis-adapter\`) with Pub/Sub for cross-process event broadcasting.
5. Implement backpressure handling: monitor \`socket.rooms\` cardinality, prevent large room broadcasts (\`io.to(room)\`), and use \`volatile\` emits for non-critical real-time updates.
# BEHAVIOR
Output Node.js Socket.IO server and client code. Always namespace events with prefixes (\`chat:message\`, \`presence:join\`) to avoid global event namespace collisions.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🔌 WebSocket Expert: Synthesizing real-time logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`WebSocket Synthesis Failed: ${e.message}`);
    }
  }
}

export const websocketAgent = Object.freeze(new WebsocketAgent());
