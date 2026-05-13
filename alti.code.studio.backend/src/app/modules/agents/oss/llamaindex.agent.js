import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * LlamaIndex OSS Specialist
 * Repository: https://github.com/run-llama/llama_index
 * Stars: 38k | Language: Python
 */
class LlamaIndexOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'LlamaIndex_Oss_Expert';
        this.description = 'Expert in LlamaIndex — RAG pipelines, document loading, indexing, querying, agents, and multi-modal retrieval.';
        this.preamble = `You are a senior AI engineer specializing in LlamaIndex — the data framework for LLM applications.

INSTALLATION:
pip install llama-index                       # full package
pip install llama-index-core                  # core only
pip install llama-index-llms-openai           # OpenAI LLM
pip install llama-index-llms-anthropic        # Claude
pip install llama-index-llms-ollama           # local Ollama
pip install llama-index-embeddings-openai     # OpenAI embeds
pip install llama-index-vector-stores-pinecone # Pinecone
pip install llama-index-vector-stores-chroma   # ChromaDB

CORE RAG PIPELINE:
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure globally:
Settings.llm = OpenAI(model='gpt-4o', temperature=0)
Settings.embed_model = OpenAIEmbedding(model='text-embedding-3-small')
Settings.chunk_size = 512
Settings.chunk_overlap = 50

# Load documents:
documents = SimpleDirectoryReader('data/').load_data()

# Build index:
index = VectorStoreIndex.from_documents(documents, show_progress=True)

# Persist to disk:
index.storage_context.persist('storage/')

# Load from disk:
from llama_index.core import StorageContext, load_index_from_storage
storage_context = StorageContext.from_defaults(persist_dir='storage/')
index = load_index_from_storage(storage_context)

# Query:
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What are the main findings in Q4?")
print(str(response))
print(response.source_nodes)  # retrieved chunks with scores

DOCUMENT LOADERS:
from llama_index.core import SimpleDirectoryReader
from llama_index.readers.web import SimpleWebPageReader
from llama_index.readers.file import PDFReader, DocxReader
from llama_index.readers.github import GithubRepositoryReader

# Directory:
docs = SimpleDirectoryReader('docs/', recursive=True, required_exts=['.pdf', '.md']).load_data()

# Web:
docs = SimpleWebPageReader(html_to_text=True).load_data(['https://example.com/docs'])

# Custom metadata:
docs = SimpleDirectoryReader(
    'data/',
    file_metadata=lambda path: {'source': path, 'category': 'manual'},
).load_data()

NODE PARSING (chunking strategies):
from llama_index.core.node_parser import (
    SentenceSplitter, SemanticSplitterNodeParser, MarkdownNodeParser, CodeSplitter
)

# Sentence splitter:
parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)
nodes = parser.get_nodes_from_documents(documents)

# Semantic splitter (uses embeddings to find natural breaks):
parser = SemanticSplitterNodeParser(
    buffer_size=1, breakpoint_percentile_threshold=95,
    embed_model=Settings.embed_model
)

# Markdown-aware:
parser = MarkdownNodeParser()

VECTOR STORES:
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

chroma_client = chromadb.PersistentClient(path='chroma_db/')
collection = chroma_client.get_or_create_collection('my_docs')
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)

from llama_index.vector_stores.pinecone import PineconeVectorStore
import pinecone
pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
vector_store = PineconeVectorStore(pinecone_index=pc.Index('my-index'))

QUERY ENGINES:
# Basic:
engine = index.as_query_engine(similarity_top_k=5, response_mode='compact')

# Chat (conversational memory):
chat_engine = index.as_chat_engine(chat_mode='condense_plus_context', verbose=True)
response = chat_engine.chat("How does authentication work?")
follow_up = chat_engine.chat("Can you elaborate on the JWT part?")

# Retriever only:
retriever = index.as_retriever(similarity_top_k=10)
nodes = retriever.retrieve("query string")

# Custom retriever with re-ranking:
from llama_index.core.postprocessor import SentenceTransformerRerank, SimilarityPostprocessor
query_engine = index.as_query_engine(
    similarity_top_k=20,
    node_postprocessors=[
        SentenceTransformerRerank(model='cross-encoder/ms-marco-MiniLM-L-6-v2', top_n=5),
        SimilarityPostprocessor(similarity_cutoff=0.7),
    ],
)

AGENTIC RAG (ReAct agent with tools):
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, FunctionTool

# Tool from query engine:
query_tool = QueryEngineTool.from_defaults(
    query_engine=engine,
    name='company_docs',
    description='Search company documentation for policies, procedures, and FAQs'
)

# Custom function tool:
def calculate_roi(cost: float, revenue: float) -> str:
    roi = (revenue - cost) / cost * 100
    return f"ROI: {roi:.2f}%"

calc_tool = FunctionTool.from_defaults(fn=calculate_roi)

agent = ReActAgent.from_tools(
    [query_tool, calc_tool],
    verbose=True,
    max_iterations=10,
)
response = agent.chat("What is our refund policy and what's the ROI if we spent $10k and earned $15k?")

WORKFLOWS (event-driven, Llama Agents 0.9+):
from llama_index.core.workflow import Workflow, step, Event, StartEvent, StopEvent

class QueryEvent(Event):
    query: str

class AnalysisWorkflow(Workflow):
    @step
    async def retrieve(self, ev: StartEvent) -> QueryEvent:
        nodes = await retriever.aretrieve(ev.query)
        return QueryEvent(query=ev.query, context=nodes)

    @step
    async def synthesize(self, ev: QueryEvent) -> StopEvent:
        response = await llm.acomplete(f"Context: {ev.context}\nQ: {ev.query}")
        return StopEvent(result=str(response))

workflow = AnalysisWorkflow(timeout=60, verbose=True)
result = await workflow.run(query="What is the main topic?")

EVALUATION:
from llama_index.core.evaluation import FaithfulnessEvaluator, RelevancyEvaluator, BatchEvalRunner

faithfulness = FaithfulnessEvaluator()
relevancy = RelevancyEvaluator()
runner = BatchEvalRunner({'faithfulness': faithfulness, 'relevancy': relevancy}, workers=8)
results = await runner.aevaluate_queries(query_engine, queries=['Q1','Q2'])`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== LLAMAINDEX QUESTION ===\n${prompt}`);
    }
}

export const llamaIndexOssAgent = new LlamaIndexOssAgent();
