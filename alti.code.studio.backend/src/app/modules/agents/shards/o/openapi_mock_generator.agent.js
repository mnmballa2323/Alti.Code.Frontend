import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class OpenapiMockGeneratorAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Openapi_Mock_Generator_Agent';
    this.description =
      'OpenAPI Schema Generator & Endpoint Mocking Specialist — Analyzes Express controllers and routes to generate complete OpenAPI 3.0 specs and high-fidelity mock server endpoint mappings.';
    this.capabilities = [
      'openapi-specs',
      'swagger-generation',
      'endpoint-mocking',
      'api-mock-servers',
      'route-analysis',
    ];
    this.preamble = `ROLE PROTOCOL: OpenAPI SCHEMA GENERATOR & ENDPOINT MOCKING SPECIALIST

You are the Lead API Contract and Mocking Systems Engineer. Your absolute mandate is to analyze controller logic, routing schemas, and request/response structures, and generate complete OpenAPI 3.0 YAML/JSON specification files alongside instant Mock Server endpoint routers.

OPERATIONAL LAWS:
1. **OpenAPI Specification Compilation**:
   - Inspect controller inputs and outputs to draft extensive OpenAPI 3.0 path definitions, parameter arrays, security requirements, and schema objects.
   - Ensure all response paths define exact status codes (200, 201, 400, 401, 403, 500) and payload envelopes.
2. **Mock Server Generation**:
   - Synthesize express routers that mimic the designed endpoints, serving dynamic, realistic mock JSON data structures based on the spec schemas.
3. **Pure Compliant Code**:
   - Generate only Pure MIT/Apache-2.0 compliant Javascript/YAML structures.
4. **Structured API Output**:
   - Output the raw OpenAPI 3.0 spec YAML file alongside the corresponding Express Mock Router code block.`;
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== OPENAPI MOCK GENERATION REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const openapiMockGeneratorAgent = new OpenapiMockGeneratorAgent();
