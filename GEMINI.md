# GEMINI Instructions

> **MASTER PROTOCOL**: Read `docs/LLM_INSTRUCTIONS.md` first. It is the single source of truth.

## Model-Specific Nuances
-   **Context Window**: Leverage your massive context window to analyze the entire repository structure at once.
-   **Performance**: Focus on "The Sentinel" and "The Auditor" tasks—analyzing logs, security, and performance bottlenecks across thousands of files.
-   **Submodules**: You are the primary agent for ensuring submodule synchronization and cross-repo consistency.

## HARD LAW: AI PROVIDER INFERENCE STRATEGY
**CRITICAL GUARDRAIL - DO NOT VIOLATE UNDER ANY CIRCUMSTANCES**
The entire system MUST strictly adhere to the following Tri-Cloud Inference Strategy. There are absolutely NO EXCEPTIONS to this rule. Direct SDK connections to foundational models are blocked and forbidden for security reasons.

### Allowed Providers (NOTHING ELSE IS ALLOWED):
1. **AWS Bedrock** (for Claude)
2. **GCP Vertex AI** (for Gemini)
3. **Azure OpenAI Foundry** (for GPT)
