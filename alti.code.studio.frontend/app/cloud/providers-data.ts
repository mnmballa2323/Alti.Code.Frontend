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
  "Microsoft Azure": [
    {
      name: "Azure Virtual Machines",
      functionName: "Compute & Virtual Servers",
      agentName: "Azure VM Specialist (Tier 14)",
      agentId: "azure_vm_specialist",
      status: "ACTIVE",
      capabilities: ["vm-scaling", "hybrid-benefit", "disk-encryption"],
      description:
        "Optimizes Azure Hybrid Benefit licenses, VM scale sets, and premium disk configurations.",
      icon: "Server",
    },
    {
      name: "Blob Storage",
      functionName: "Object & Cold Storage",
      agentName: "Azure Blob Specialist (Tier 14)",
      agentId: "azure_blob_specialist",
      status: "ACTIVE",
      capabilities: ["lifecycle-management", "immutable-blobs", "sas-tokens"],
      description:
        "Configures Shared Access Signatures, access tiers (Hot/Cool/Archive), and blob triggers.",
      icon: "Database",
    },
    {
      name: "Azure Functions",
      functionName: "Serverless Operations",
      agentName: "Azure Functions Specialist (Tier 14)",
      agentId: "azure_functions_specialist",
      status: "OPTIMIZING",
      capabilities: [
        "premium-plan-scaling",
        "trigger-bindings",
        "durable-workflows",
      ],
      description:
        "Tunes Durable Functions orchestration, serverless bindings, and startup execution times.",
      icon: "Cpu",
    },
    {
      name: "Cosmos DB",
      functionName: "Global NoSQL Database",
      agentName: "Azure Cosmos Specialist (Tier 14)",
      agentId: "azure_cosmos_specialist",
      status: "ACTIVE",
      capabilities: [
        "multi-region-writes",
        "ru-allocation",
        "consistency-levels",
      ],
      description:
        "Tunes Request Units (RUs), consistency parameters, and multi-region read/write replication.",
      icon: "Database",
    },
    {
      name: "Entra ID (Active Directory)",
      functionName: "Identity & Access Control",
      agentName: "Azure Entra Guardian (Tier 14)",
      agentId: "azure_entra_guardian",
      status: "SWARMING",
      capabilities: [
        "conditional-access",
        "managed-identities",
        "app-registrations",
      ],
      description:
        "Audits conditional access policies, configures system-assigned managed identities, and registers APIs.",
      icon: "Lock",
    },
    {
      name: "ARM Templates & Bicep",
      functionName: "Infrastructure as Code",
      agentName: "Azure IaC Specialist (Tier 14)",
      agentId: "azure_iac_specialist",
      status: "IDLE",
      capabilities: [
        "bicep-compilation",
        "arm-deployments",
        "blueprint-compliance",
      ],
      description:
        "Compiles declarative Bicep files, manages Azure Blueprints compliance, and runs validation gates.",
      icon: "Activity",
    },
  ]
};
