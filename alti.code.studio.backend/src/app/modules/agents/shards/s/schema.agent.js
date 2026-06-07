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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

/** Shared JSON cleaner — strips markdown fences and parses. */
const parseAgentJson = (raw) => {
    const cleaned = raw
        .replace(/^```json\n?/m, '')
        .replace(/^```\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
    return JSON.parse(cleaned);
};

export class SchemaAgent {
    constructor() {
        this.name = 'schema';
        this.description = 'Dynamic Ontology Architect and Knowledge Graph Maintainer';
        this.capabilities = [
            'Parse database definitions, GraphQL types, and OpenAPI schemas',
            'Synchronize raw code abstractions into a centralized semantic Ontology JSON',
            'Act as the memory namespace librarian for the broader AI Swarm',
        ];
    }

    /**
     * Extracts semantic conceptual nodes (Ontology objects) from raw schema definitions.
     * Falls back to a safe error object on JSON parse failure instead of throwing.
     *
     * @param {string} rawSchema       - Raw schema definitions (Prisma, GraphQL, SQL, OpenAPI…)
     * @param {string} [boundedContext='Core'] - The domain namespace for this schema
     * @returns {Promise<object>}
     */
    async mapOntology(rawSchema, boundedContext = 'Core') {
        if (!rawSchema || typeof rawSchema !== 'string' || rawSchema.trim().length === 0) {
            throw new Error('SchemaAgent: rawSchema must be a non-empty string.');
        }

        logger.info(`🕸️ Schema Agent: Traversing '${boundedContext}' domain — Initiating Ontology extraction.`);

        try {
            const prompt = `
            You are a Data Architect managing the enterprise Knowledge Graph (Ontology).
            Analyze the following raw schema definition and extract the core conceptual entities, their properties, and relationships.

            Schema Context:
            \`\`\`
            ${rawSchema.substring(0, 6000)}
            \`\`\`

            Return your findings as a strict JSON object (no markdown fences):
            {
                "extractedEntities": ["Array of core domain objects (e.g. 'User', 'Account')"],
                "relationships": ["Array of textual relationships (e.g. 'User -> HAS_MANY -> Preferences')"],
                "ontologyGraphNode": {
                    "domain": "${boundedContext}",
                    "nodes": [
                        { "name": "...", "attributes": ["id", "status"] }
                    ]
                }
            }
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);

            let ontologyReport;
            try {
                ontologyReport = parseAgentJson(rawResponse);
            } catch (parseErr) {
                logger.warn(`🕸️ Schema Agent: JSON parse failed — returning partial result.`);
                ontologyReport = {
                    extractedEntities: [],
                    relationships: [],
                    ontologyGraphNode: { domain: boundedContext, nodes: [] },
                    _parseError: parseErr.message,
                    _rawResponse: rawResponse.substring(0, 200),
                };
            }

            const entityCount = ontologyReport.extractedEntities?.length ?? 0;
            logger.info(`🕸️ Schema Agent: Ontology extraction complete. Bound [${entityCount}] entities.`);
            if (ontologyReport.relationships?.length > 0) {
                logger.info(`   First relation: ${ontologyReport.relationships[0]}`);
            }

            return ontologyReport;

        } catch (err) {
            logger.error(`❌ Schema Agent Extraction Failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * Graph-compatible process() — catches errors and returns a failed-step object
     * instead of propagating an uncaught exception that would crash the graph.
     *
     * @param {object} state
     * @returns {Promise<object>}
     */
    async process(state) {
        const schemaString = state.data?.content || state.goal || '';
        const context = state.data?.context || 'Global Graph';

        if (!schemaString) {
            return {
                ...state,
                status: 'failed',
                error: 'No schema content provided in state.data.content or state.goal',
                results: [...(state.results ?? []), '❌ FAILED SchemaAgent: No schema content provided'],
            };
        }

        try {
            const report = await this.mapOntology(schemaString, context);
            const entityCount = report.extractedEntities?.length ?? 0;
            return {
                ...state,
                status: 'success',
                results: [
                    ...(state.results ?? []),
                    `Ontology Synced: Extracted ${entityCount} conceptual entities.`,
                ],
            };
        } catch (err) {
            logger.error(`🕸️ SchemaAgent.process() failed: ${err.message}`);
            return {
                ...state,
                status: 'failed',
                error: err.message,
                results: [...(state.results ?? []), `❌ FAILED SchemaAgent: ${err.message}`],
            };
        }
    }
}

export const schemaAgent = Object.freeze(new SchemaAgent());
