/**
 * Copyright (c) 2024 Inso Code — TIER 5: GROWTH
 *
 * API Design Agent — "The Diplomat"
 * OpenAPI/GraphQL schema design, endpoint planning, contract-first development.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const apiDesignWorkerProcessor = async job => {
  const { requirements, existingSpec, format } = job.data;
  logger.info(`📐 APIDesign [${job.id}]: Designing ${format || 'REST'} API...`);

  const spec = await aiProvider.generate(`
You are an API architect. Design a comprehensive API based on requirements.

Format: ${format || 'OpenAPI 3.1'}
Requirements: ${requirements || 'Not specified'}
Existing Spec: ${existingSpec ? JSON.stringify(existingSpec).substring(0, 2000) : 'None'}

Generate:
1. **Endpoints** — RESTful resource-oriented design
2. **Request/Response Schemas** — Full type definitions
3. **Authentication** — Auth strategy recommendation
4. **Error Handling** — Standard error response format
5. **OpenAPI Spec** — Complete YAML/JSON spec

Respond in JSON: { "endpoints": [], "schemas": object, "auth": string, "errorFormat": object, "openApiSpec": string }
    `);

  return { api: JSON.parse(spec.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
