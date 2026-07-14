# GEMINI Instructions

> **MASTER PROTOCOL**: Read `docs/LLM_INSTRUCTIONS.md` first. It is the single source of truth.

## Model-Specific Nuances
-   **Context Window**: Leverage your massive context window to analyze the entire repository structure at once.
-   **Performance**: Focus on "The Sentinel" and "The Auditor" tasks—analyzing logs, security, and performance bottlenecks across thousands of files.
-   **Submodules**: You are the primary agent for ensuring submodule synchronization and cross-repo consistency.

## MULTI-CLOUD INFERENCE STRATEGY
**CRITICAL GUARDRAIL - DO NOT VIOLATE UNDER ANY CIRCUMSTANCES**
This platform is running on a multi-cloud strategy for model inference. There are absolutely NO EXCEPTIONS to this rule. Direct SDK connections to other foundational model providers (e.g., local/air-gapped models) are blocked and forbidden for security reasons.
Furthermore, it is a HARD LAW to ALWAYS use the absolute latest, state-of-the-art hosted models on approved enterprise cloud platforms to ensure absolute compliance and data sovereignty.

### Allowed Providers (NOTHING ELSE IS ALLOWED):
1. **Google Cloud Vertex AI** (for platform operations and general model inference)
2. **AWS Bedrock** (specifically for Anthropic Claude models)
3. **Azure AI Foundry / OpenAI** (specifically for OpenAI GPT models)

