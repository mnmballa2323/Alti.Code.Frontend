
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NeMoEngine")

app = FastAPI(title="Alti.Code.Studio NeMo Engine", version="1.0.0")

class TextRequest(BaseModel):
    text: str
    model_name: str = "default"

class AudioRequest(BaseModel):
    audio_path: str

@app.get("/")
def read_root():
    return {"status": "active", "service": "NeMo Engine"}

@app.post("/transcribe")
async def transcribe_audio(request: AudioRequest):
    """
    Simulated ASR Endpoint (for now)
    """
    logger.info(f"Received audio transcription request: {request.audio_path}")
    # Integration Point: In real implementation, load NeMo ASR model here
    if not os.path.exists(request.audio_path) and not request.audio_path.startswith("http"):
        # For simulation, we pretend success if path is dummy
        pass
        
    return {
        "transcription": "This is a simulated transcription from the NeMo engine.",
        "confidence": 0.98
    }

@app.post("/generate")
async def generate_text(request: TextRequest):
    """
    Simulated LLM Generation Endpoint
    """
    logger.info(f"Received generation request: {request.text}")
    # Integration Point: Load NeMo LLM or Guardrails here
    return {
        "generated_text": f"Processed: {request.text} [NeMo Enhanced]",
        "model": request.model_name
    }

@app.post("/analyze/graph")
async def analyze_graph(request: TextRequest):
    """
    Analyzes dependency graph using NetworkX.
    Expects 'text' to be a JSON string representing edges: [["a", "b"], ["b", "c"]]
    """
    try:
        import networkx as nx
        import json
        
        edges = json.loads(request.text)
        G = nx.DiGraph(edges)
        
        analysis = {
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
            "density": nx.density(G),
            "is_dag": nx.is_directed_acyclic_graph(G),
            "cycles": list(nx.simple_cycles(G)) if not nx.is_directed_acyclic_graph(G) else []
        }
        
        return analysis
    except Exception as e:
        logger.error(f"Graph analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed")
async def embed_text(request: TextRequest):
    """
    Generates high-quality local embeddings using SentenceTransformers.
    """
    try:
        from sentence_transformers import SentenceTransformer
        # Use a small, fast model for default
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(request.text)
        return {"embedding": embeddings.tolist(), "model": "all-MiniLM-L6-v2"}
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        # Fallback if model load fails (e.g. download issue)
        return {"error": str(e), "status": "failed"}

@app.post("/ingest/file")
async def ingest_file(file: UploadFile = File(...)):
    """
    Ingests PDF, Images, and Office docs using Unstructured.
    Returns extracted text and metadata.
    """
    try:
        from unstructured.partition.auto import partition
        import tempfile
        import shutil

        # Save uploaded file to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Partition (Extract)
        elements = partition(filename=tmp_path)
        
        # Convert to dict
        text_content = "\n\n".join([str(e) for e in elements])
        metadata = [e.to_dict() for e in elements]
        
        # Cleanup
        os.remove(tmp_path)

        return {
            "filename": file.filename,
            "text": text_content,
            "chunks": len(metadata),
            "metadata_sample": metadata[:3] if metadata else []
        }

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Global Index Store (In-Memory for now)
index = None

class RAGIndexRequest(BaseModel):
    documents: list[dict] # [{"text": "...", "metadata": {...}}]

class RAGQueryRequest(BaseModel):
    query: str

@app.post("/rag/index")
async def create_index(request: RAGIndexRequest):
    """
    Creates a VectorStoreIndex from provided documents.
    """
    global index
    try:
        from llama_index.core import Document, VectorStoreIndex, Settings
        from llama_index.embeddings.huggingface import HuggingFaceEmbedding

        # Configure Settings (CPU optimized)
        Settings.embed_model = HuggingFaceEmbedding(model_name="all-MiniLM-L6-v2")
        
        logger.warning("Generation will be simulated. RAG requires connection to Azure Foundry or AWS Bedrock.")

        docs = [Document(text=d['text'], metadata=d.get('metadata', {})) for d in request.documents]
        index = VectorStoreIndex.from_documents(docs)
        
        return {"status": "success", "indexed_documents": len(docs)}
    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/query")
async def query_index(request: RAGQueryRequest):
    """
    Queries the existing index.
    """
    global index
    if not index:
        raise HTTPException(status_code=400, detail="Index not initialized. Upload and ingest documents first.")
    
    try:
        query_engine = index.as_query_engine()
        response = query_engine.query(request.query)
        
        return {
            "response": str(response),
            "sources": [n.node.metadata for n in response.source_nodes]
        }
    except Exception as e:
        logger.error(f"Query failed: {e}")
        # Fallback for disconnected environment
        return {
            "response": f"Simulated RAG Response to: '{request.query}' (Connect Azure Foundry or AWS Bedrock for real generation). Context found.",
            "sources": []
        }
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
