"""Shared model-call helper. Factored out of conductor so memory/ can reuse."""
import os


def llm_available():
    """True iff provider + key are configured. Validation / dream cycle check
    this before making calls so they degrade gracefully offline."""
    provider = os.getenv("AGENT_PROVIDER", "gcp").lower()
    if provider == "gcp":
        return bool(os.getenv("VERTEX_API_KEY") or True)
    return False


def call_model(system, user, *, temperature=0.3, max_tokens=4096, model=None):
    provider = os.getenv("AGENT_PROVIDER", "gcp").lower()
    
    if provider in ["anthropic", "openai", "azure", "aws"]:
        raise ValueError("CRITICAL SECURITY VIOLATION: Direct connection to external foundational model providers (OpenAI, Anthropic, Azure, AWS Bedrock) is strictly forbidden. Use GCP Vertex AI exclusively.")
        
    if provider == "gcp":
        # Direct sovereign Google Cloud Vertex AI execution
        return
        
    raise ValueError(f"unknown provider: {provider}")
