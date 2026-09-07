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
      name: "Azure Kubernetes Service & VMs",
      functionName: "Compute & Confidential Containers",
      agentName: "Azure AKS Specialist (Tier 14)",
      agentId: "azure_aks_specialist",
      status: "ACTIVE",
      capabilities: ["aks-scaling", "confidential-computing", "azure-cni"],
      description:
        "Optimizes Azure Kubernetes Service node pools, Intel SGX confidential enclaves, and Azure CNI networking.",
      icon: "Server",
    },
    {
      name: "Azure Blob Storage",
      functionName: "Object & Data Lake Storage",
      agentName: "Azure Blob Specialist (Tier 14)",
      agentId: "azure_blob_specialist",
      status: "ACTIVE",
      capabilities: [
        "lifecycle-management",
        "immutable-storage",
        "private-endpoints",
      ],
      description:
        "Configures Private Endpoints, Hot/Cool/Archive tiers, and immutable WORM storage policies.",
      icon: "Database",
    },
    {
      name: "Azure Functions",
      functionName: "Serverless Operations",
      agentName: "Azure Functions Specialist (Tier 14)",
      agentId: "azure_functions_specialist",
      status: "OPTIMIZING",
      capabilities: [
        "event-grid-triggers",
        "premium-plan",
        "virtual-network-integration",
      ],
      description:
        "Tunes Linux Consumption and Elastic Premium Functions, Event Grid triggers, and VNet integration.",
      icon: "Cpu",
    },
    {
      name: "Azure Cosmos DB",
      functionName: "Global Distributed Database",
      agentName: "Azure Cosmos DB Specialist (Tier 14)",
      agentId: "azure_cosmos_specialist",
      status: "ACTIVE",
      capabilities: [
        "multi-region-writes",
        "autoscale-throughput",
        "vector-indexing",
      ],
      description:
        "Tunes Cosmos DB partition keys, multi-master replication, and integrated vector indexing.",
      icon: "Database",
    },
    {
      name: "Microsoft Entra ID",
      functionName: "Identity & Zero-Trust Access",
      agentName: "Azure Entra Guardian (Tier 14)",
      agentId: "azure_entra_guardian",
      status: "SWARMING",
      capabilities: [
        "managed-identities",
        "conditional-access",
        "rbac-policies",
      ],
      description:
        "Audits Azure Managed Identities, Conditional Access policies, and fine-grained Azure RBAC role assignments.",
      icon: "Lock",
    },
    {
      name: "Azure Resource Manager & Terraform",
      functionName: "Infrastructure as Code",
      agentName: "Azure IaC Specialist (Tier 14)",
      agentId: "azure_iac_specialist",
      status: "IDLE",
      capabilities: [
        "azurerm-compilation",
        "azure-bicep",
        "azure-policy-guardrails",
      ],
      description:
        "Compiles declarative Terraform azurerm modules, validates Azure Policy compliance, and enforces deployment gates.",
      icon: "Activity",
    },
  ],
};
