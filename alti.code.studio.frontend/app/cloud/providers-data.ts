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
      name: "Google Compute Engine",
      functionName: "Compute & Virtual Servers",
      agentName: "GCP GCE Specialist (Tier 14)",
      agentId: "gcp_gce_specialist",
      status: "ACTIVE",
      capabilities: ["instance-scaling", "sole-tenant", "shielded-vms"],
      description:
        "Optimizes Google Compute Engine instance templates, autoscaling policies, and sole-tenant node groups.",
      icon: "Server",
    },
    {
      name: "Google Cloud Storage",
      functionName: "Object & Cold Storage",
      agentName: "GCP GCS Specialist (Tier 14)",
      agentId: "gcp_gcs_specialist",
      status: "ACTIVE",
      capabilities: ["lifecycle-management", "retention-policies", "signed-urls"],
      description:
        "Configures Signed URLs, storage classes (Standard/Nearline/Coldline/Archive), and object lifecycle policies.",
      icon: "Database",
    },
    {
      name: "Google Cloud Functions",
      functionName: "Serverless Operations",
      agentName: "GCP Cloud Functions Specialist (Tier 14)",
      agentId: "gcp_functions_specialist",
      status: "OPTIMIZING",
      capabilities: [
        "event-triggering",
        "concurrency-tuning",
        "min-instances",
      ],
      description:
        "Tunes 2nd gen Cloud Functions, event-driven triggers via Eventarc, and runtime execution scaling.",
      icon: "Cpu",
    },
    {
      name: "Cloud Spanner",
      functionName: "Global Relational Database",
      agentName: "GCP Spanner Specialist (Tier 14)",
      agentId: "gcp_spanner_specialist",
      status: "ACTIVE",
      capabilities: [
        "multi-region-replication",
        "spanner-graph",
        "ddl-migrations",
      ],
      description:
        "Tunes database split-points, query optimization, and Spanner Graph schemas.",
      icon: "Database",
    },
    {
      name: "Google Cloud IAM",
      functionName: "Identity & Access Control",
      agentName: "GCP IAM Guardian (Tier 14)",
      agentId: "gcp_iam_guardian",
      status: "SWARMING",
      capabilities: [
        "workload-identity",
        "vpc-service-controls",
        "iam-roles",
      ],
      description:
        "Audits VPC Service Controls boundaries, workload identity pools, and custom least-privilege IAM roles.",
      icon: "Lock",
    },
    {
      name: "Deployment Manager & Terraform",
      functionName: "Infrastructure as Code",
      agentName: "GCP IaC Specialist (Tier 14)",
      agentId: "gcp_iac_specialist",
      status: "IDLE",
      capabilities: [
        "terraform-compilation",
        "gcloud-deployments",
        "compliance-guardrails",
      ],
      description:
        "Compiles declarative Terraform files, manages GCP Organization Policy compliance, and runs validation gates.",
      icon: "Activity",
    },
  ]
};
