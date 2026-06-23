# GEMINI Instructions

> **MASTER PROTOCOL**: Read `docs/LLM_INSTRUCTIONS.md` first. It is the single source of truth.

## Model-Specific Nuances
-   **Context Window**: Leverage your massive context window to analyze the entire repository structure at once.
-   **Performance**: Focus on "The Sentinel" and "The Auditor" tasks—analyzing logs, security, and performance bottlenecks across thousands of files.
-   **Submodules**: You are the primary agent for ensuring submodule synchronization and cross-repo consistency.

## HARD LAW: SOVEREIGN AZURE INFERENCE STRATEGY
**CRITICAL GUARDRAIL - DO NOT VIOLATE UNDER ANY CIRCUMSTANCES**
The entire system MUST strictly adhere to the Azure Sovereign Inference Strategy. There are absolutely NO EXCEPTIONS to this rule. Direct SDK connections to other foundational model providers (AWS Bedrock, GCP Vertex AI) are blocked and forbidden for security reasons.
Furthermore, it is a HARD LAW to ALWAYS use the absolute latest, state-of-the-art Azure-hosted models (e.g., Azure OpenAI Foundry) to ensure absolute compliance and data sovereignty.

### Allowed Providers (NOTHING ELSE IS ALLOWED):
1. **Azure OpenAI Foundry** / **Azure AI Studio** (for GPT & sovereign models)
2. **Local/Air-Gapped Models** (for Classified/Air-Gapped deployments)
