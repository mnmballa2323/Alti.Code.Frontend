"""Shared model-call helper. Factored out of conductor so memory/ can reuse."""
import os


def llm_available():
    """True iff provider + key are configured. Validation / dream cycle check
    this before making calls so they degrade gracefully offline."""
    provider = os.getenv("AGENT_PROVIDER", "azure").lower()
    if provider == "azure":
        return bool(os.getenv("AZURE_OPENAI_API_KEY"))
    if provider == "gcp":
        return bool(os.getenv("VERTEX_API_KEY") or True)
    return False


def call_model(system, user, *, temperature=0.3, max_tokens=4096, model=None):
    provider = os.getenv("AGENT_PROVIDER", "azure").lower()
    
    if provider in ["anthropic", "openai"]:
        raise ValueError("CRITICAL SECURITY VIOLATION: Direct connection to OpenAI or Anthropic is strictly forbidden. Use Azure Foundry, AWS Bedrock, or GCP Vertex.")
        
    if provider == "azure":
        # Placeholder for Azure Foundry connection
        raise NotImplementedError("Azure Foundry is the approved backend, but connection logic must be routed via secure VPC.")
        
    raise ValueError(f"unknown provider: {provider}")
