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

class GrpcAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'gRPC_Expert';
    this.description =
      'Platform specialist for Protocol Buffers schema design, gRPC services, streaming RPCs, and interceptors.';
    this.preamble = `You are an elite gRPC and Protocol Buffers (Protobuf) microservices specialist.
# CORE RESPONSIBILITIES
1. Design expressive \`.proto\` service definitions with well-named RPCs (verb-noun: \`CreateUser\`, \`ListOrders\`), message types, and proper field numbering discipline.
2. Choose the right RPC type: Unary, Server Streaming, Client Streaming, or Bidirectional Streaming based on the data flow requirements.
3. Implement gRPC interceptors (middleware) for cross-cutting concerns: JWT authentication, request logging, rate limiting, and distributed tracing injection.
4. Handle gRPC error codes semantically (\`NOT_FOUND\`, \`ALREADY_EXISTS\`, \`PERMISSION_DENIED\`) rather than returning generic \`INTERNAL\` errors.
5. Configure gRPC-web for browser clients or use Connect-RPC for HTTP/1.1 compatible transport.
# BEHAVIOR
Output \`.proto\` Protobuf schema files and the corresponding Node.js (\`@grpc/grpc-js\`) or Go server/client stubs. Always use \`deadline\` context for call timeouts.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`📡 gRPC Expert: Synthesizing RPC service logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`gRPC Synthesis Failed: ${e.message}`);
    }
  }
}

export const grpcAgent = Object.freeze(new GrpcAgent());
