# HARD LAW: AI PROVIDER INFERENCE STRATEGY

**CRITICAL GUARDRAIL - DO NOT VIOLATE UNDER ANY CIRCUMSTANCES**

The entire system MUST strictly adhere to the following Tri-Cloud Inference Strategy. There are absolutely NO EXCEPTIONS to this rule. Direct SDK connections to foundational models are blocked and forbidden for security reasons.
Furthermore, it is a HARD LAW to ALWAYS use the absolute latest, state-of-the-art models available on the Tri-Cloud solution (e.g., Gemini 3.1 Pro). Never use deprecated or older model versions.

## Allowed Providers:
1. **AWS Bedrock** -> ONLY for Claude models
2. **GCP Vertex AI** -> ONLY for Gemini models
3. **Azure OpenAI Foundry** -> ONLY for GPT models

## Forbidden Implementations:
- **NO** direct Anthropic integration (`@anthropic-ai/sdk`)
- **NO** direct Google Generative AI integration (`@google/generative-ai`)
- **NO** direct OpenAI API (`api.openai.com`) integration (must be Azure OpenAI endpoint)
- **NO** OpenRouter or other third-party proxy aggregators

Nothing else is allowed, at all. Always use the internal unified Gateway Service which enforces these sovereign cloud endpoints.
