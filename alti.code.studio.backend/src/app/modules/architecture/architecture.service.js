import { architectureQueue } from './architecture.worker.js';
import { ArchitectureNode, ArchitectureEdge } from './architecture.model.js';
import path from 'path';

// This service acts as the core orchestrator for the architecture microservice pipeline.

export const startIngestionJob = async (repoUrl, token) => {
  // In a real environment, repoUrl might be a GitHub URL to clone.
  // For local platform usage, repoUrl acts as the local path.
  const repoId = Buffer.from(repoUrl).toString('base64').substring(0, 16);
  
  const job = await architectureQueue.add('ingestRepo', {
    repoId,
    repoPath: repoUrl, // local path for now
  });

  return {
    jobId: job.id,
    status: 'pending',
    repoId,
  };
};

export const processUploadedFiles = async (files) => {
  return {
    jobId: 'job_67890',
    status: 'pending',
  };
};

export const getJobStatus = async (id) => {
  const job = await architectureQueue.getJob(id);
  if (!job) {
    return { status: 'unknown' };
  }
  const state = await job.getState();
  const progress = job.progress || 0;
  return {
    jobId: id,
    status: state,
    progress,
    result: job.returnvalue
  };
};

export const getGraph = async (repoId) => {
  // Fetch real nodes and edges from Database
  const dbNodes = await ArchitectureNode.find({ repoId }).lean();
  const dbEdges = await ArchitectureEdge.find({ repoId }).lean();

  if (dbNodes.length > 0) {
    const nodes = dbNodes.map(node => ({
      id: node._id.toString(),
      type: node.type,
      name: node.name,
      layer: node.layer,
      path: node.path
    }));

    const edges = dbEdges.map(edge => ({
      id: edge._id.toString(),
      source: edge.source.toString(),
      target: edge.target.toString(),
      relationship_type: edge.relationship_type
    }));

    return { nodes, edges };
  }

  // Fallback dynamic topography of alti.code.studio backend if DB is not populated yet
  return {
    nodes: [
      { id: "1", type: "file", name: "API Gateway (Next.js)", layer: "api", path: "src/app/routes/index.js", summary: "Handles incoming requests from frontend clients." },
      { id: "2", type: "file", name: "Auth Service", layer: "backend", path: "src/app/middlewares/auth.middleware.js", summary: "Manages authentication and JWT validation." },
      { id: "3", type: "file", name: "Architecture Engine", layer: "backend", path: "src/app/modules/architecture/architecture.service.js", summary: "Calculates AST topography and blast radius." },
      { id: "4", type: "file", name: "Vector Database (Qdrant)", layer: "database", path: "src/app/modules/memory/rag.service.js", summary: "Stores code node embeddings for RAG." },
      { id: "5", type: "file", name: "Workflow Orchestrator", layer: "backend", path: "src/app/modules/workflow/workflow.service.js", summary: "Compiles natural language into execution DAGs." },
      { id: "6", type: "file", name: "Autonomous QA Swarm", layer: "backend", path: "src/app/modules/qa/qa.service.js", summary: "Self-healing test loops and execution." },
      { id: "7", type: "file", name: "AgentMemory Kernel", layer: "database", path: "src/app/modules/memory/agentmemory.service.js", summary: "Persistent, cross-session AI storage." },
      { id: "8", type: "file", name: "Deep Research Service", layer: "backend", path: "src/app/modules/research/research.service.js", summary: "Google Search grounded synthesis." },
      { id: "9", type: "file", name: "Cloud Deployer", layer: "api", path: "src/app/modules/deployments/cloudRun.route.js", summary: "Provisions Google Cloud Run containers." },
      { id: "10", type: "file", name: "DLP Security Scanner", layer: "backend", path: "src/app/modules/security/dlp.service.js", summary: "Zero-trust PII sanitization." }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", relationship_type: "auth" },
      { id: "e1-3", source: "1", target: "3", relationship_type: "routes" },
      { id: "e3-4", source: "3", target: "4", relationship_type: "stores" },
      { id: "e1-5", source: "1", target: "5", relationship_type: "routes" },
      { id: "e5-6", source: "5", target: "6", relationship_type: "triggers" },
      { id: "e5-7", source: "5", target: "7", relationship_type: "reads" },
      { id: "e1-8", source: "1", target: "8", relationship_type: "routes" },
      { id: "e8-7", source: "8", target: "7", relationship_type: "writes" },
      { id: "e1-10", source: "1", target: "10", relationship_type: "validates" },
      { id: "e10-9", source: "10", target: "9", relationship_type: "secures" }
    ]
  };
};

export const getNodeDetails = async (id) => {
  const node = await ArchitectureNode.findById(id).lean();
  if (!node) throw new Error('Node not found');

  return {
    id: node._id.toString(),
    name: node.name,
    path: node.path,
    layer: node.layer,
    metadata: node.metadata,
    aiEnrichment: node.aiEnrichment || {
      summary: 'Auto-generated node.',
      purpose: 'Part of the system graph.',
      role: 'Code Component',
    },
  };
};

export const getClusterDetails = async (layer) => {
  const nodeCount = await ArchitectureNode.countDocuments({ layer });
  return {
    layer,
    nodeCount,
    summary: `This is the ${layer} layer handling core logic.`,
  };
};

export const askQuestion = async (query, repoId) => {
  // TODO: Convert query to embedding, perform RAG against the Graph/Vector DB, and call LLM
  return {
    answer: `Based on the architecture, the part handling ${query.includes('auth') ? 'authentication is the AuthService.' : 'this request is found in the core services.'}`,
    references: [],
  };
};
