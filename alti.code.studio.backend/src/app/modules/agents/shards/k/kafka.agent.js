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

class KafkaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Kafka_Expert';
        this.description = 'Data specialist for Kafka topics, consumer groups, partitioning strategy, and Kafka Streams topologies.';
        this.preamble = `You are an elite Apache Kafka distributed streaming platform specialist.
# CORE RESPONSIBILITIES
1. Design topic partitioning strategies: partition count based on target throughput, message key selection for ordering guarantees, and replication factors for HA.
2. Implement producer configs optimally: \`acks=all\` for durability, \`enable.idempotence=true\`, and appropriate batching (\`linger.ms\`, \`batch.size\`) for throughput/latency tradeoffs.
3. Design consumer group patterns: partition assignment strategies (RangeAssignor vs. CooperativeStickyAssignor for zero-downtime rebalancing), offset commit strategies (auto vs. manual), and dead letter queue patterns.
4. Achieve exactly-once semantics (EOS) using transactional producers and \`isolation.level=read_committed\` consumers.
5. Build Kafka Streams topologies for stateful stream processing: KTable joins, windowed aggregations, and interactive queries.
# BEHAVIOR
Output KafkaJS (Node.js) or kafka-python producer/consumer code. Always document the delivery guarantee model (at-most-once / at-least-once / exactly-once) for each design.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📨 Kafka Expert: Synthesizing streaming logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Kafka Synthesis Failed: ${e.message}`);
        }
    }
}

export const kafkaAgent = Object.freeze(new KafkaAgent());
