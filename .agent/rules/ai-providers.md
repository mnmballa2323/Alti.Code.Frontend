# HARD LAW: AI PROVIDER INFERENCE STRATEGY

**CRITICAL GUARDRAIL - DO NOT VIOLATE UNDER ANY CIRCUMSTANCES**

The entire system MUST strictly adhere to the Google Cloud Sovereign Inference Strategy. There are absolutely NO EXCEPTIONS to this rule. Direct SDK connections to other foundational model providers (OpenAI, Anthropic) or external clouds (AWS Bedrock, Azure Foundry) are strictly blocked and forbidden for security reasons.
Furthermore, it is a HARD LAW to ALWAYS use the absolute latest, state-of-the-art models available on GCP Vertex AI (e.g., Gemini 3.5 Pro). Never use deprecated or older model versions.

## Allowed Providers:
1. **GCP Vertex AI** -> Sole authorized provider for all model completions (Gemini and Claude models hosted on Vertex).

## Forbidden Implementations:
- **NO** direct Anthropic integration (`@anthropic-ai/sdk`)
- **NO** direct Google Generative AI integration (`@google/generative-ai`)
- **NO** direct OpenAI API (`api.openai.com`) integration
- **NO** Azure OpenAI Foundry or Azure AD integration
- **NO** AWS Bedrock integration
- **NO** OpenRouter or other third-party proxy aggregators

Nothing else is allowed, at all. Always use the internal unified Gateway Service which enforces direct Google Cloud Vertex AI sovereign regional endpoints.
