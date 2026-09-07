export interface CloudFunctionAgent {
  name: string;
  functionName: string;
  agentName: string;
  agentId: string;
  status: "ACTIVE" | "IDLE" | "OPTIMIZING" | "SWARMING";
  capabilities: string[];
  description: string;
  icon: "Server" | "Database" | "Network" | "Lock" | "Activity" | "Cpu";
}

export const PROVIDER_SPECIALIZATIONS: Record<string, CloudFunctionAgent[]> = {
  "Google Cloud Platform": [
    {
      name: "Google Cloud Run & GKE",
      functionName: "Serverless Containers & Kubernetes",
      agentName: "GCP Cloud Run Specialist (Tier 14)",
      agentId: "gcp_cloud_run_specialist",
      status: "ACTIVE",
      capabilities: ["cloud-run-scaling", "gke-autopilot", "vpc-connector"],
      description:
        "Orchestrates Google Cloud Run serverless microservices and GKE Autopilot clusters with automated scaling.",
      icon: "Server",
    },
    {
      name: "Google Cloud Storage",
      functionName: "High-Throughput Object & Artifact Storage",
      agentName: "GCS Storage Specialist (Tier 14)",
      agentId: "gcp_storage_specialist",
      status: "ACTIVE",
      capabilities: [
        "uniform-bucket-level-access",
        "lifecycle-management",
        "cmek-encryption",
      ],
      description:
        "Manages Google Cloud Storage buckets, versioning, customer-managed encryption, and global CDN delivery.",
      icon: "Database",
    },
    {
      name: "Vertex AI & Gemini Engine",
      functionName: "Foundation Models & Vector Search",
      agentName: "Vertex AI Specialist (Tier 14)",
      agentId: "gcp_vertex_ai_specialist",
      status: "SWARMING",
      capabilities: [
        "gemini-2.5-pro",
        "vector-search-hnsw",
        "grounded-rag",
      ],
      description:
        "Drives multimodal code intelligence with Gemini 2.5 Pro, high-speed subagent inference, and Vertex Vector Search.",
      icon: "Cpu",
    },
    {
      name: "Google Cloud SQL & Spanner",
      functionName: "Distributed & Relational Databases",
      agentName: "GCP Cloud SQL Specialist (Tier 14)",
      agentId: "gcp_cloud_sql_specialist",
      status: "ACTIVE",
      capabilities: ["postgres-ha", "spanner-graph", "private-service-access"],
      description:
        "Optimizes Google Cloud SQL PostgreSQL high availability and Google Cloud Spanner global graph schemas.",
      icon: "Database",
    },
    {
      name: "Google Cloud Secret Manager & KMS",
      functionName: "Hardware Security & Key Management",
      agentName: "GCP Cloud KMS Specialist (Tier 14)",
      agentId: "gcp_kms_specialist",
      status: "ACTIVE",
      capabilities: ["secret-manager", "cloud-kms", "iam-workload-identity"],
      description:
        "Automates rotation of secrets in Google Cloud Secret Manager and enforces Google Cloud Workload Identity Federation.",
      icon: "Lock",
    },
    {
      name: "Google Cloud Pub/Sub",
      functionName: "Event Streaming & Agent Swarm Bus",
      agentName: "GCP Pub/Sub Specialist (Tier 14)",
      agentId: "gcp_pubsub_specialist",
      status: "OPTIMIZING",
      capabilities: ["realtime-telemetry", "dead-letter-queues", "ordered-delivery"],
      description:
        "Routes high-throughput agent swarm messages and asynchronous lifecycle events across Google Cloud Platform.",
      icon: "Activity",
    },
  ],
};
