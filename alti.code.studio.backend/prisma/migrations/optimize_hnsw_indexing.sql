-- Enable pgvector if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Optimize AgentMemory table embedding index with HNSW
DROP INDEX IF EXISTS "AgentMemory_embedding_idx";
CREATE INDEX IF NOT EXISTS "AgentMemory_embedding_hnsw_idx" 
ON "AgentMemory" 
USING hnsw (embedding vector_cosine_ops);

-- 2. Optimize OkfConcept table embedding index with HNSW
DROP INDEX IF EXISTS "OkfConcept_embedding_idx";
CREATE INDEX IF NOT EXISTS "OkfConcept_embedding_hnsw_idx" 
ON "OkfConcept" 
USING hnsw (embedding vector_cosine_ops);
