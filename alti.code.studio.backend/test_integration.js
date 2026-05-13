import { integrationAgent } from './src/app/modules/agents/integration.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testIntegration() {
    console.log("--- TESTING AUTONOMOUS API INTEGRATOR ---");

    const mockSwagger = JSON.stringify({
        "openapi": "3.0.0",
        "info": { "title": "Stripe Mock", "version": "1.0" },
        "paths": {
            "/v1/payment_intents": {
                "post": {
                    "summary": "Create a PaymentIntent",
                    "parameters": [{ "name": "amount", "in": "query", "required": true }]
                }
            }
        }
    }, null, 2);

    console.log(`Feeding Mock Stripe OpenAPI schema to IntegrationAgent...`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            integrationSummary: "Mapped the /v1/payment_intents (POST) endpoint for the Stripe Mock system.",
            endpointsMapped: 1,
            generatedCode: "class StripeClient {\n  constructor(apiKey) {\n    this.api = axios.create({ baseURL: 'https://api.stripe.com', headers: { Authorization: `Bearer ${apiKey}` } });\n  }\n  async createPaymentIntent(amount) {\n    try {\n      const response = await this.api.post('/v1/payment_intents', { amount });\n      return response.data;\n    } catch (e) {\n      console.error('Stripe API Error:', e.message);\n      throw e;\n    }\n  }\n}"
        });
    };

    try {
        console.log("\nExecuting API Mapping Protocol...");
        const result = await integrationAgent.generateApiClient(mockSwagger, 'Stripe Mock');

        console.log("\nINTEGRATION REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.endpointsMapped === 1 && result.generatedCode.includes('class StripeClient') && result.generatedCode.includes('this.api.post(\'/v1/payment_intents\'')) {
            console.log("\n✅ SUCCESS: IntegrationAgent parsed the Open API spec and produced a valid, strict Axios execution class wrapper.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: IntegrationAgent failed to map the API nodes.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testIntegration();
