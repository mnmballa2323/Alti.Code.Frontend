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
  "Amazon Web Services": [
    {
      name: "EC2 Elastic Compute",
      functionName: "Compute & Virtual Servers",
      agentName: "AWS EC2 Specialist (Tier 14)",
      agentId: "aws_ec2_specialist",
      status: "ACTIVE",
      capabilities: ["ec2-scaling", "instance-tuning", "ebs-optimization"],
      description: "Optimizes instance sizing, cost efficiency, and automated auto-scaling groups.",
      icon: "Server"
    },
    {
      name: "S3 Object Storage",
      functionName: "Object & Blob Storage",
      agentName: "AWS S3 Specialist (Tier 14)",
      agentId: "aws_s3_specialist",
      status: "ACTIVE",
      capabilities: ["bucket-lifecycle", "cors-rules", "cloudfront-cdn"],
      description: "Manages object storage lifecycle rules, access controls, and low-latency CloudFront caching.",
      icon: "Database"
    },
    {
      name: "Lambda Serverless",
      functionName: "Serverless Compute",
      agentName: "AWS Lambda Specialist (Tier 14)",
      agentId: "aws_lambda_specialist",
      status: "OPTIMIZING",
      capabilities: ["cold-start-tuning", "concurrency-limits", "event-routing"],
      description: "Regulates cold-start latency, concurrency controls, and API Gateway bindings.",
      icon: "Cpu"
    },
    {
      name: "DynamoDB NoSQL",
      functionName: "High-Throughput Database",
      agentName: "AWS DynamoDB Specialist (Tier 14)",
      agentId: "aws_dynamodb_specialist",
      status: "ACTIVE",
      capabilities: ["gsi-indexing", "partition-keys", "daas-caching"],
      description: "Configures secondary indexes, query throughput tuning, and hot-partition balancing.",
      icon: "Database"
    },
    {
      name: "IAM Identity & Access",
      functionName: "Zero-Trust Access Control",
      agentName: "AWS IAM Guardian (Tier 14)",
      agentId: "aws_iam_guardian",
      status: "SWARMING",
      capabilities: ["least-privilege", "role-assumption", "policy-linting"],
      description: "Enforces least-privilege policies, audits assume-role bounds, and filters credentials.",
      icon: "Lock"
    },
    {
      name: "CloudFormation & CDK",
      functionName: "Infrastructure as Code",
      agentName: "AWS IaC Specialist (Tier 14)",
      agentId: "aws_iac_specialist",
      status: "IDLE",
      capabilities: ["cdk-compilation", "stack-drift", "drift-remediation"],
      description: "Compiles TypeScript CDK structures, monitors drift compliance, and executes safe rollbacks.",
      icon: "Activity"
    }
  ],
  "Google Cloud Platform": [
    {
      name: "Compute Engine VMs",
      functionName: "Compute & Scale",
      agentName: "GCP Compute Specialist (Tier 14)",
      agentId: "gcp_compute_specialist",
      status: "ACTIVE",
      capabilities: ["vm-scaling", "live-migration", "sole-tenant-nodes"],
      description: "Optimizes machine-type configurations, persistent disk allocation, and live migrations.",
      icon: "Server"
    },
    {
      name: "Cloud Storage",
      functionName: "Multi-Regional Storage",
      agentName: "GCP Storage Specialist (Tier 14)",
      agentId: "gcp_storage_specialist",
      status: "ACTIVE",
      capabilities: ["bucket-lifecycle", "dual-region-sync", "iam-binding"],
      description: "Controls dual-region replication, storage class auto-tiering, and access tokens.",
      icon: "Database"
    },
    {
      name: "Cloud Run Serverless",
      functionName: "Containerized Serverless",
      agentName: "GCP Cloud Run Specialist (Tier 14)",
      agentId: "gcp_cloudrun_specialist",
      status: "OPTIMIZING",
      capabilities: ["min-instances", "cpu-allocation", "traffic-splitting"],
      description: "Manages container scaling, zero-to-one latency optimization, and green-blue canary deploys.",
      icon: "Cpu"
    },
    {
      name: "BigQuery Analytics",
      functionName: "Serverless Data Warehouse",
      agentName: "GCP BigQuery Specialist (Tier 14)",
      agentId: "gcp_bigquery_specialist",
      status: "ACTIVE",
      capabilities: ["partition-pruning", "slot-allocation", "clustering"],
      description: "Coordinates query slot scheduling, partition optimization, and materialized view caching.",
      icon: "Database"
    },
    {
      name: "GCP IAM & Sovereignty",
      functionName: "Access Control & Governance",
      agentName: "GCP IAM Guardian (Tier 14)",
      agentId: "gcp_iam_guardian",
      status: "SWARMING",
      capabilities: ["service-accounts", "workload-identity", "audit-logs"],
      description: "Secures Google Workload Identity federations, audits service accounts, and isolates project structures.",
      icon: "Lock"
    },
    {
      name: "Google Deployment Manager",
      functionName: "Infrastructure as Code",
      agentName: "GCP IaC Specialist (Tier 14)",
      agentId: "gcp_iac_specialist",
      status: "IDLE",
      capabilities: ["gdm-templates", "terraform-gcp", "state-locking"],
      description: "Synthesizes Terraform GCP structures, maps state locking, and executes deployment dry-runs.",
      icon: "Activity"
    }
  ],
  "Microsoft Azure": [
    {
      name: "Azure Virtual Machines",
      functionName: "Compute & Virtual Servers",
      agentName: "Azure VM Specialist (Tier 14)",
      agentId: "azure_vm_specialist",
      status: "ACTIVE",
      capabilities: ["vm-scaling", "hybrid-benefit", "disk-encryption"],
      description: "Optimizes Azure Hybrid Benefit licenses, VM scale sets, and premium disk configurations.",
      icon: "Server"
    },
    {
      name: "Blob Storage",
      functionName: "Object & Cold Storage",
      agentName: "Azure Blob Specialist (Tier 14)",
      agentId: "azure_blob_specialist",
      status: "ACTIVE",
      capabilities: ["lifecycle-management", "immutable-blobs", "sas-tokens"],
      description: "Configures Shared Access Signatures, access tiers (Hot/Cool/Archive), and blob triggers.",
      icon: "Database"
    },
    {
      name: "Azure Functions",
      functionName: "Serverless Operations",
      agentName: "Azure Functions Specialist (Tier 14)",
      agentId: "azure_functions_specialist",
      status: "OPTIMIZING",
      capabilities: ["premium-plan-scaling", "trigger-bindings", "durable-workflows"],
      description: "Tunes Durable Functions orchestration, serverless bindings, and startup execution times.",
      icon: "Cpu"
    },
    {
      name: "Cosmos DB",
      functionName: "Global NoSQL Database",
      agentName: "Azure Cosmos Specialist (Tier 14)",
      agentId: "azure_cosmos_specialist",
      status: "ACTIVE",
      capabilities: ["multi-region-writes", "ru-allocation", "consistency-levels"],
      description: "Tunes Request Units (RUs), consistency parameters, and multi-region read/write replication.",
      icon: "Database"
    },
    {
      name: "Entra ID (Active Directory)",
      functionName: "Identity & Access Control",
      agentName: "Azure Entra Guardian (Tier 14)",
      agentId: "azure_entra_guardian",
      status: "SWARMING",
      capabilities: ["conditional-access", "managed-identities", "app-registrations"],
      description: "Audits conditional access policies, configures system-assigned managed identities, and registers APIs.",
      icon: "Lock"
    },
    {
      name: "ARM Templates & Bicep",
      functionName: "Infrastructure as Code",
      agentName: "Azure IaC Specialist (Tier 14)",
      agentId: "azure_iac_specialist",
      status: "IDLE",
      capabilities: ["bicep-compilation", "arm-deployments", "blueprint-compliance"],
      description: "Compiles declarative Bicep files, manages Azure Blueprints compliance, and runs validation gates.",
      icon: "Activity"
    }
  ],
  "Oracle Cloud": [
    {
      name: "OCI Compute",
      functionName: "Bare Metal & VMs",
      agentName: "Oracle Compute Expert (Tier 14)",
      agentId: "oracle_compute_expert",
      status: "ACTIVE",
      capabilities: ["bare-metal-tuning", "ampere-a1", "custom-images"],
      description: "Configures physical bare metal servers, Ampere A1 ARM architectures, and auto-scaling VM pools.",
      icon: "Server"
    },
    {
      name: "OCI Object Storage",
      functionName: "Tiered Resilient Storage",
      agentName: "Oracle Storage Guardian (Tier 14)",
      agentId: "oracle_storage_expert",
      status: "ACTIVE",
      capabilities: ["bucket-lifecycle", "replication-sync", "immutable-vaults"],
      description: "Coordinates secure regional bucket lifecycles, cross-region replication, and compliance locks.",
      icon: "Database"
    },
    {
      name: "OCI Functions",
      functionName: "Serverless Fn Execution",
      agentName: "Oracle Fn Specialist (Tier 14)",
      agentId: "oracle_functions_expert",
      status: "OPTIMIZING",
      capabilities: ["fn-scaling", "gateway-routes", "cold-starts"],
      description: "Optimizes containerized serverless Fn routines, API gateway endpoint mappings, and cold start bounds.",
      icon: "Cpu"
    },
    {
      name: "Autonomous Database",
      functionName: "Self-Driving Warehouse",
      agentName: "Oracle DBA Specialist (Tier 14)",
      agentId: "oracle_db_expert",
      status: "ACTIVE",
      capabilities: ["auto-indexing", "query-tuning", "real-time-backup"],
      description: "Maintains self-healing Oracle transactional engines, materialized views, and auto-indexing policies.",
      icon: "Database"
    },
    {
      name: "Compartment Governance",
      functionName: "Enterprise Access Control",
      agentName: "Oracle Security Shield (Tier 14)",
      agentId: "oracle_security_expert",
      status: "SWARMING",
      capabilities: ["compartment-policies", "iam-domains", "audit-routing"],
      description: "Secures structured resource compartments, identities federation, and audit logging streams.",
      icon: "Lock"
    },
    {
      name: "Resource Manager",
      functionName: "Managed Terraform Stacks",
      agentName: "Oracle IaC Expert (Tier 14)",
      agentId: "oracle_iac_expert",
      status: "IDLE",
      capabilities: ["resource-manager-plans", "drift-auditing", "state-locking"],
      description: "Compiles OCI Resource Manager templates, synchronizes states, and automates stack setups.",
      icon: "Activity"
    }
  ],
  "IBM Cloud": [
    {
      name: "Bare Metal Compute",
      functionName: "High-Performance Physicals",
      agentName: "IBM Bare Metal Specialist (Tier 14)",
      agentId: "ibm_baremetal_specialist",
      status: "ACTIVE",
      capabilities: ["bare-metal-tuning", "power-systems", "san-volumes"],
      description: "Manages dedicated IBM physical setups, Power Systems architecture, and SAN storage integration.",
      icon: "Server"
    },
    {
      name: "Cloud Object Storage",
      functionName: "Cross-Region Vaults",
      agentName: "IBM COS Guardian (Tier 14)",
      agentId: "ibm_cos_guardian",
      status: "ACTIVE",
      capabilities: ["cos-vaults", "aspera-speedup", "bucket-lifecycles"],
      description: "Enforces data durability bounds, high-speed IBM Aspera transfers, and object lifecycle sweeps.",
      icon: "Database"
    },
    {
      name: "Code Engine",
      functionName: "Container Serverless Run",
      agentName: "IBM Code Engine Expert (Tier 14)",
      agentId: "ibm_code_engine_expert",
      status: "OPTIMIZING",
      capabilities: ["container-scaling", "batch-jobs", "ingress-routing"],
      description: "Coordinates container scale-ups, complex asynchronous batch processing, and internal HTTP bindings.",
      icon: "Cpu"
    },
    {
      name: "Cloudant NoSQL",
      functionName: "Distributed CouchDB",
      agentName: "IBM Cloudant Specialist (Tier 14)",
      agentId: "ibm_cloudant_specialist",
      status: "ACTIVE",
      capabilities: ["couchdb-sync", "index-tuning", "global-replication"],
      description: "Tunes distributed CouchDB database instances, JSON indexing, and active-active replications.",
      icon: "Database"
    },
    {
      name: "Sovereign IAM & Vault",
      functionName: "Identity & Trust Profiles",
      agentName: "IBM Security Shield (Tier 14)",
      agentId: "ibm_security_shield",
      status: "SWARMING",
      capabilities: ["trusted-profiles", "key-protect", "resource-isolation"],
      description: "Secures IBM Key Protect HSMs, manages secure enclaves, and structures corporate trust profiles.",
      icon: "Lock"
    },
    {
      name: "Schematics Automation",
      functionName: "IaC Terraform Schemas",
      agentName: "IBM Schematics Expert (Tier 14)",
      agentId: "ibm_schematics_expert",
      status: "IDLE",
      capabilities: ["schematics-blueprints", "terraform-ibm", "drift-checking"],
      description: "Validates IBM Schematics pipelines, deploys workspace patterns, and audits drift metrics.",
      icon: "Activity"
    }
  ],
  "CoreWeave": [
    {
      name: "NVIDIA GPU Compute",
      functionName: "Physical H100/A100 Clusters",
      agentName: "CoreWeave GPU Expert (Tier 14)",
      agentId: "coreweave_gpu_expert",
      status: "ACTIVE",
      capabilities: ["h100-nvlink", "a100-vgpu", "vram-pooling"],
      description: "Manages NVIDIA H100 and A100 GPU compute pools, multi-instance vGPU nodes, and high-speed NVLink pipelines.",
      icon: "Server"
    },
    {
      name: "Kubernetes Swarm",
      functionName: "GPU-Accelerated Containers",
      agentName: "CoreWeave K8s Specialist (Tier 14)",
      agentId: "coreweave_k8s_specialist",
      status: "ACTIVE",
      capabilities: ["gpu-autoscaling", "k8s-scheduling", "pod-isolation"],
      description: "Optimizes container schedules, allocates direct-access hardware pods, and regulates orchestrations.",
      icon: "Cpu"
    },
    {
      name: "Tensorizer Fast Loader",
      functionName: "AI Weight Serialization",
      agentName: "CoreWeave Tensorizer Agent (Tier 14)",
      agentId: "coreweave_tensorizer_agent",
      status: "OPTIMIZING",
      capabilities: ["weight-loading", "serialization-speed", "direct-s3-pull"],
      description: "Accelerates model load-up speeds using open-source Tensorizer pipelines for instant weights mounting.",
      icon: "Activity"
    },
    {
      name: "High-Speed NVMe Storage",
      functionName: "Ultra-Low-Latency Storage",
      agentName: "CoreWeave Storage Specialist (Tier 14)",
      agentId: "coreweave_storage_specialist",
      status: "ACTIVE",
      capabilities: ["nvme-arrays", "shared-nfs", "data-retention"],
      description: "Maintains high-performance NVMe stripe sets, read/write cache pools, and active NFS mount paths.",
      icon: "Database"
    },
    {
      name: "Enclave Security",
      functionName: "Zero-Trust Virtual Isolation",
      agentName: "CoreWeave Security Guardian (Tier 14)",
      agentId: "coreweave_security_guardian",
      status: "SWARMING",
      capabilities: ["secure-gpu-memory", "ssh-gateways", "network-filters"],
      description: "Isolates GPU execution spaces, establishes secure key connections, and monitors data traffic.",
      icon: "Lock"
    }
  ],
  "Lambda Labs": [
    {
      name: "On-Demand GPU VMs",
      functionName: "Instant H100 Instances",
      agentName: "Lambda VM Specialist (Tier 14)",
      agentId: "lambda_vm_specialist",
      status: "ACTIVE",
      capabilities: ["h100-vms", "a10g-instances", "ssh-allocation"],
      description: "Provisions on-demand GPU VM servers, optimizes system storage sizing, and manages SSH endpoints.",
      icon: "Server"
    },
    {
      name: "Distributed Clusters",
      functionName: "Multi-Node PyTorch Training",
      agentName: "Lambda Cluster Expert (Tier 14)",
      agentId: "lambda_cluster_expert",
      status: "ACTIVE",
      capabilities: ["multi-node-sync", "pytorch-ddp", "network-fabric"],
      description: "Tunes high-performance distributed deep learning clusters using PyTorch and JAX fabrics.",
      icon: "Cpu"
    },
    {
      name: "Shared Storage NFS",
      functionName: "Shared Dataset Storage",
      agentName: "Lambda Storage Expert (Tier 14)",
      agentId: "lambda_storage_expert",
      status: "ACTIVE",
      capabilities: ["nfs-mounting", "dataset-caching", "throughput-tuning"],
      description: "Mounts and balances high-throughput shared directories directly across training instances.",
      icon: "Database"
    },
    {
      name: "Enclave Access Guardian",
      functionName: "SSH Key Management",
      agentName: "Lambda Security Guardian (Tier 14)",
      agentId: "lambda_security_guardian",
      status: "SWARMING",
      capabilities: ["ssh-auditing", "api-token-rotation", "firewall-rules"],
      description: "Manages SSH credential key rings, schedules API token rotation cycles, and maps incoming port safety.",
      icon: "Lock"
    }
  ],
  "Paperspace": [
    {
      name: "Gradient Notebooks",
      functionName: "Collaborative ML Runspaces",
      agentName: "Paperspace Notebook Expert (Tier 14)",
      agentId: "paperspace_notebook_expert",
      status: "ACTIVE",
      capabilities: ["notebook-scaling", "env-caching", "vram-sharing"],
      description: "Orchestrates instant Jupyter runspaces, schedules custom container environments, and manages allocations.",
      icon: "Cpu"
    },
    {
      name: "Core Compute GPUs",
      functionName: "Dedicated Cloud VMs",
      agentName: "Paperspace VM Specialist (Tier 14)",
      agentId: "paperspace_vm_specialist",
      status: "ACTIVE",
      capabilities: ["gpu-passthrough", "win-linux-vm", "persistent-disk"],
      description: "Provisions persistent virtual machines, custom Windows setups, and maps direct GPU compute access.",
      icon: "Server"
    },
    {
      name: "Dataset Storage",
      functionName: "Distributed Storage Volumes",
      agentName: "Paperspace Storage Expert (Tier 14)",
      agentId: "paperspace_storage_expert",
      status: "ACTIVE",
      capabilities: ["volume-mounting", "cache-optimization", "backup-retention"],
      description: "Manages high-durability storage systems, handles multi-region file mounts, and schedules backups.",
      icon: "Database"
    },
    {
      name: "Private Networks",
      functionName: "VPC Infrastructure",
      agentName: "Paperspace Network Guardian (Tier 14)",
      agentId: "paperspace_network_guardian",
      status: "SWARMING",
      capabilities: ["vpc-tunnels", "dynamic-ips", "ingress-restrictions"],
      description: "Secures VPC sub-networks, isolates multi-tenant structures, and validates active routing.",
      icon: "Network"
    }
  ],
  "RunPod": [
    {
      name: "Dynamic GPU Pods",
      functionName: "Containerized GPU Compute",
      agentName: "RunPod Pod Specialist (Tier 14)",
      agentId: "runpod_pod_specialist",
      status: "ACTIVE",
      capabilities: ["pod-docker", "vram-caching", "thermal-throttle"],
      description: "Deploys custom containerized docker stacks on distributed GPU compute networks.",
      icon: "Server"
    },
    {
      name: "Serverless Endpoint",
      functionName: "Scalable Model Inference",
      agentName: "RunPod Serverless Expert (Tier 14)",
      agentId: "runpod_serverless_expert",
      status: "OPTIMIZING",
      capabilities: ["cold-start-tuner", "autoscale-bounds", "rest-gateway"],
      description: "Regulates instant serverless inference API instances, eliminates cold start delays, and maps requests.",
      icon: "Cpu"
    },
    {
      name: "Pod Network Volumes",
      functionName: "Persistent Network Storage",
      agentName: "RunPod Storage Expert (Tier 14)",
      agentId: "runpod_storage_expert",
      status: "ACTIVE",
      capabilities: ["network-volumes", "s3-sync", "volume-sharing"],
      description: "Mounts secure network drives directly to pods, syncs S3 datasets, and tracks usage.",
      icon: "Database"
    },
    {
      name: "API Secure Shield",
      functionName: "Zero-Trust Pod Auth",
      agentName: "RunPod Security Guardian (Tier 14)",
      agentId: "runpod_security_guardian",
      status: "SWARMING",
      capabilities: ["token-rotation", "port-proxy", "ssl-enforcement"],
      description: "Protects pod proxy links, rotates execution tokens, and audits data transmission channels.",
      icon: "Lock"
    }
  ],
  "Together AI": [
    {
      name: "Together Inference",
      functionName: "High-Throughput LLM API",
      agentName: "Together Inference Specialist (Tier 14)",
      agentId: "together_inference_specialist",
      status: "ACTIVE",
      capabilities: ["token-optimization", "request-queuing", "speculative-decoding"],
      description: "Routes high-speed LLM queries, tunes token-per-second thresholds, and reduces latency.",
      icon: "Cpu"
    },
    {
      name: "Custom Fine-Tuning",
      functionName: "Dynamic Fine-Tune Cluster",
      agentName: "Together Training Expert (Tier 14)",
      agentId: "together_training_expert",
      status: "ACTIVE",
      capabilities: ["lora-integration", "dataset-sharding", "model-checkpoints"],
      description: "Manages deep model fine-tuning runs, implements LoRA parameters, and exports weights.",
      icon: "Server"
    },
    {
      name: "Together Data Bucket",
      functionName: "AI Training Storage",
      agentName: "Together Storage Expert (Tier 14)",
      agentId: "together_storage_expert",
      status: "ACTIVE",
      capabilities: ["dataset-retention", "parquet-indexing", "weight-storage"],
      description: "Controls raw dataset folders, Parquet validation, and exported model checkpoint storage.",
      icon: "Database"
    },
    {
      name: "API Shield Guardian",
      functionName: "Access Control & Quotas",
      agentName: "Together Security Guardian (Tier 14)",
      agentId: "together_security_guardian",
      status: "SWARMING",
      capabilities: ["jwt-verification", "quota-throttling", "endpoint-isolation"],
      description: "Restricts execution endpoints, schedules credential validation sweeps, and tracks API quota metrics.",
      icon: "Lock"
    }
  ],
  "DigitalOcean": [
    {
      name: "VPS Compute Droplets",
      functionName: "Scalable Virtual Servers",
      agentName: "DigitalOcean Droplet Specialist (Tier 14)",
      agentId: "do_droplet_specialist",
      status: "ACTIVE",
      capabilities: ["droplet-sizing", "block-volumes", "snapshot-backup"],
      description: "Provisions VPS droplets, allocates block storage, and structures system backups.",
      icon: "Server"
    },
    {
      name: "Spaces Object Storage",
      functionName: "S3-Compliant Assets CDN",
      agentName: "DigitalOcean Storage Expert (Tier 14)",
      agentId: "do_storage_expert",
      status: "ACTIVE",
      capabilities: ["spaces-cors", "cdn-distribution", "lifecycle-retention"],
      description: "Controls S3-compatible asset spaces, manages edge caching settings, and enforces CORS configurations.",
      icon: "Database"
    },
    {
      name: "App Platform PaaS",
      functionName: "Git-to-Deploy Hosting",
      agentName: "DigitalOcean App Platform Expert (Tier 14)",
      agentId: "do_app_platform_expert",
      status: "OPTIMIZING",
      capabilities: ["monorepo-deploy", "env-injection", "health-probes"],
      description: "Coordinates instant code deployment pipelines, maps environment setups, and monitors endpoint health.",
      icon: "Cpu"
    },
    {
      name: "VPC Private Mesh",
      functionName: "Isolated Cloud Networks",
      agentName: "DigitalOcean Network Guardian (Tier 14)",
      agentId: "do_network_guardian",
      status: "SWARMING",
      capabilities: ["vpc-mesh", "cloud-firewalls", "load-balancers"],
      description: "Designs private subnetworks, defines droplet firewall rules, and balances ingress traffic.",
      icon: "Network"
    }
  ],
  "Fly.io": [
    {
      name: "Fly MicroVMs",
      functionName: "Edge Virtual Compute",
      agentName: "Fly Machines Specialist (Tier 14)",
      agentId: "fly_machines_specialist",
      status: "ACTIVE",
      capabilities: ["microvm-scaling", "instance-resuming", "docker-compilation"],
      description: "Orchestrates lightweight microVM instances globally, handles resume-on-request states, and optimizes Docker builds.",
      icon: "Server"
    },
    {
      name: "Fly Volumes",
      functionName: "NVMe Local Storage",
      agentName: "Fly Storage Expert (Tier 14)",
      agentId: "fly_storage_expert",
      status: "ACTIVE",
      capabilities: ["nvme-provisioning", "volume-snapshots", "region-replication"],
      description: "Manages dedicated local NVMe disk arrays, handles system snapshots, and syncs data partitions.",
      icon: "Database"
    },
    {
      name: "Fly Edge Proxy",
      functionName: "Anycast Global Routing",
      agentName: "Fly Network Router (Tier 14)",
      agentId: "fly_network_router",
      status: "OPTIMIZING",
      capabilities: ["anycast-routing", "ssl-termination", "region-weighting"],
      description: "Directs anycast edge traffic pathways, terminates HTTPS requests, and regulates regional user splits.",
      icon: "Network"
    },
    {
      name: "WireGuard Mesh",
      functionName: "Zero-Trust Internal Network",
      agentName: "Fly WireGuard Guardian (Tier 14)",
      agentId: "fly_wireguard_guardian",
      status: "SWARMING",
      capabilities: ["vpn-tunneling", "private-dns", "peer-verification"],
      description: "Sets up secure WireGuard internal network meshes, handles private DNS settings, and reviews connections.",
      icon: "Lock"
    }
  ],
  "Heroku": [
    {
      name: "Heroku Dynos",
      functionName: "Container Process Compute",
      agentName: "Heroku Dyno Specialist (Tier 14)",
      agentId: "heroku_dyno_specialist",
      status: "ACTIVE",
      capabilities: ["dyno-scaling", "buildpack-tuning", "process-balancing"],
      description: "Deploys containerized Dyno applications, schedules web/worker partitions, and tunes buildpacks.",
      icon: "Server"
    },
    {
      name: "Heroku Postgres",
      functionName: "Managed Relational Storage",
      agentName: "Heroku Database Expert (Tier 14)",
      agentId: "heroku_database_expert",
      status: "ACTIVE",
      capabilities: ["db-backups", "pg-extensions", "conn-pooling"],
      description: "Maintains managed Postgres clusters, automates daily database snapshots, and tunes connection pools.",
      icon: "Database"
    },
    {
      name: "Heroku Router",
      functionName: "Auto-Routing Load Balancer",
      agentName: "Heroku Router Expert (Tier 14)",
      agentId: "heroku_router_expert",
      status: "OPTIMIZING",
      capabilities: ["domain-ssl", "request-queuing", "failover-routing"],
      description: "Regulates automated request routing paths, handles SSL certificates, and tracks request queuing.",
      icon: "Network"
    },
    {
      name: "Shield Compliance",
      functionName: "Secure Enterprise Enclaves",
      agentName: "Heroku Security Guardian (Tier 14)",
      agentId: "heroku_security_guardian",
      status: "SWARMING",
      capabilities: ["hipaa-auditing", "private-spaces", "secret-key-encryption"],
      description: "Isolates private network spaces, enforces HIPAA compliance rules, and encrypts environment values.",
      icon: "Lock"
    }
  ],
  "Railway": [
    {
      name: "Railway Compute",
      functionName: "Dynamic Services Compute",
      agentName: "Railway Compute Specialist (Tier 14)",
      agentId: "railway_compute_specialist",
      status: "ACTIVE",
      capabilities: ["nixpacks-build", "service-scaling", "ephemeral-containers"],
      description: "Deploys codebases using custom Nixpacks environments, tracks RAM allocations, and balances workloads.",
      icon: "Server"
    },
    {
      name: "Database Orchestrator",
      functionName: "Multi-DB Cluster Storage",
      agentName: "Railway Database Expert (Tier 14)",
      agentId: "railway_database_expert",
      status: "ACTIVE",
      capabilities: ["multi-db-sync", "data-export", "redis-caching"],
      description: "Configures relational and key-value database engines, exports schemas, and optimizes caching layers.",
      icon: "Database"
    },
    {
      name: "Railway Variables",
      functionName: "Zero-Trust Secret Vault",
      agentName: "Railway Security Guardian (Tier 14)",
      agentId: "railway_security_guardian",
      status: "SWARMING",
      capabilities: ["env-encryption", "variable-inheritance", "shared-keys"],
      description: "Locks down system configuration environments, handles inheritance hierarchies, and audits secrets access.",
      icon: "Lock"
    }
  ],
  "Render": [
    {
      name: "Web Services Compute",
      functionName: "Scalable Web Servers",
      agentName: "Render Compute Specialist (Tier 14)",
      agentId: "render_compute_specialist",
      status: "ACTIVE",
      capabilities: ["web-app-scaling", "cron-execution", "worker-pools"],
      description: "Manages HTTP web server services, background worker instances, and schedules automated cron tasks.",
      icon: "Server"
    },
    {
      name: "Render Database",
      functionName: "Managed SQL Databases",
      agentName: "Render DB Specialist (Tier 14)",
      agentId: "render_db_specialist",
      status: "ACTIVE",
      capabilities: ["postgres-tuning", "backup-retention", "ssl-connections"],
      description: "Balances Postgres configurations, regulates backup retention cycles, and enforces secure SSL routes.",
      icon: "Database"
    },
    {
      name: "Blueprint IaC Templates",
      functionName: "Infrastructure as Code",
      agentName: "Render IaC Expert (Tier 14)",
      agentId: "render_iac_expert",
      status: "IDLE",
      capabilities: ["blueprint-yaml", "pipeline-verification", "env-grouping"],
      description: "Synthesizes Render Blueprint YAML files, coordinates deployments, and groups unified configurations.",
      icon: "Activity"
    }
  ],
  "Supabase": [
    {
      name: "Postgres Realtime DB",
      functionName: "High-Performance Postgres Engine",
      agentName: "Supabase DB Expert (Tier 14)",
      agentId: "supabase_db_expert",
      status: "ACTIVE",
      capabilities: ["pgvector-queries", "rls-policies", "realtime-websocket"],
      description: "Maintains relational schema engines, handles pgvector indexes, and manages realtime websocket connections.",
      icon: "Database"
    },
    {
      name: "GoTrue Authentication",
      functionName: "Zero-Trust Identity Access",
      agentName: "Supabase Auth Guardian (Tier 14)",
      agentId: "supabase_auth_guardian",
      status: "SWARMING",
      capabilities: ["mfa-validation", "oauth-binding", "jwt-enforcement"],
      description: "Validates user login sessions, locks down row-level table security, and configures token credentials.",
      icon: "Lock"
    },
    {
      name: "Edge Functions Deno",
      functionName: "Edge-Distributed Serverless",
      agentName: "Supabase Edge Specialist (Tier 14)",
      agentId: "supabase_edge_specialist",
      status: "OPTIMIZING",
      capabilities: ["deno-import-maps", "secrets-binding", "edge-latency"],
      description: "Deploys Deno serverless script pipelines globally, handles library import maps, and optimizes latency.",
      icon: "Cpu"
    },
    {
      name: "Storage Buckets",
      functionName: "Media Uploads & CDN",
      agentName: "Supabase Storage Expert (Tier 14)",
      agentId: "supabase_storage_expert",
      status: "ACTIVE",
      capabilities: ["file-transcoding", "signed-urls", "storage-rls"],
      description: "Coordinates media asset folders, handles dynamic resizing APIs, and configures signed asset links.",
      icon: "Database"
    }
  ],
  "Vercel": [
    {
      name: "Edge & Serverless",
      functionName: "Microsecond Edge Compute",
      agentName: "Vercel Runtime Specialist (Tier 14)",
      agentId: "vercel_runtime_specialist",
      status: "ACTIVE",
      capabilities: ["edge-routing", "cold-start-tuner", "incremental-regeneration"],
      description: "Deploys serverless backend APIs on global networks, optimizes cold-start times, and tunes caching.",
      icon: "Cpu"
    },
    {
      name: "Smart Edge CDN",
      functionName: "Anycast Routing & Redirection",
      agentName: "Vercel Network Expert (Tier 14)",
      agentId: "vercel_network_expert",
      status: "ACTIVE",
      capabilities: ["anycast-cdn", "header-rewriting", "custom-domains"],
      description: "Directs anycast CDN assets routing, enforces custom redirection patterns, and applies SSL certs.",
      icon: "Network"
    },
    {
      name: "Vercel Blob & KV",
      functionName: "Serverless Database Connectors",
      agentName: "Vercel Database Specialist (Tier 14)",
      agentId: "vercel_db_specialist",
      status: "OPTIMIZING",
      capabilities: ["blob-upload-rules", "kv-redis-pooling", "postgres-connectors"],
      description: "Manages S3-compatible Blob directories, coordinates serverless Redis KV pools, and establishes DB lines.",
      icon: "Database"
    },
    {
      name: "WAF Security Shield",
      functionName: "Web Application Security",
      agentName: "Vercel Security Guardian (Tier 14)",
      agentId: "vercel_security_guardian",
      status: "SWARMING",
      capabilities: ["waf-rule-config", "ddos-mitigation", "env-vault"],
      description: "Deploys WAF security rules, protects applications against DDoS attempts, and isolates env vaults.",
      icon: "Lock"
    }
  ],
  "Kinsta": [
    {
      name: "Containerized PHP Compute",
      functionName: "Nginx Optimized PHP",
      agentName: "Kinsta Compute Specialist (Tier 14)",
      agentId: "kinsta_compute_specialist",
      status: "ACTIVE",
      capabilities: ["php-fpm-tuning", "nginx-fastcgi", "redis-object-cache"],
      description: "Tunes PHP-FPM worker instances, optimizes Nginx reverse caching, and configures object caching.",
      icon: "Server"
    },
    {
      name: "Cloudflare CDN Integration",
      functionName: "Enterprise DDoS Protection",
      agentName: "Kinsta Network Guardian (Tier 14)",
      agentId: "kinsta_network_guardian",
      status: "ACTIVE",
      capabilities: ["cloudflare-waf", "edge-caching", "wildcard-ssl"],
      description: "Controls Cloudflare WAF integration, structures global edge caching rules, and deploys SSL certificates.",
      icon: "Network"
    },
    {
      name: "Kinsta APM Metrics",
      functionName: "Application Performance",
      agentName: "Kinsta Telemetry Expert (Tier 14)",
      agentId: "kinsta_telemetry_expert",
      status: "OPTIMIZING",
      capabilities: ["apm-queries", "database-latency", "slow-requests"],
      description: "Tracks query speeds, isolates sluggish database requests, and monitors memory allocations.",
      icon: "Activity"
    }
  ],
  "Alibaba Cloud": [
    {
      name: "ECS Cloud Servers",
      functionName: "Compute & Virtual Machines",
      agentName: "Alibaba ECS Expert (Tier 14)",
      agentId: "alibaba_ecs_expert",
      status: "ACTIVE",
      capabilities: ["ecs-auto-scaling", "disk-snapshots", "enclave-nodes"],
      description: "Maintains high-performance virtual machine server instances and configures disk backup structures.",
      icon: "Server"
    },
    {
      name: "OSS Object Storage",
      functionName: "Multi-Regional File Storage",
      agentName: "Alibaba Storage Specialist (Tier 14)",
      agentId: "alibaba_oss_expert",
      status: "ACTIVE",
      capabilities: ["oss-bucket-policies", "cross-region-sync", "cdn-acceleration"],
      description: "Handles Object Storage Service (OSS) lifecycles, cross-region replication, and CDN asset speedups.",
      icon: "Database"
    },
    {
      name: "Function Compute",
      functionName: "Serverless Compute Tasks",
      agentName: "Alibaba Serverless Expert (Tier 14)",
      agentId: "alibaba_function_expert",
      status: "OPTIMIZING",
      capabilities: ["fc-cold-starts", "trigger-actions", "concurrency-limits"],
      description: "Balances serverless runtime instances, triggers event actions, and bounds execution limits.",
      icon: "Cpu"
    },
    {
      name: "RAM User Permissions",
      functionName: "Identity Access Management",
      agentName: "Alibaba IAM Guardian (Tier 14)",
      agentId: "alibaba_ram_expert",
      status: "SWARMING",
      capabilities: ["ram-policies", "security-groups", "audit-routing"],
      description: "Restricts resource access controls, writes security groups, and sweeps system audit logs.",
      icon: "Lock"
    }
  ],
  "Baidu AI Cloud": [
    {
      name: "Baidu GPU Compute",
      functionName: "NVIDIA & Kunlun Accelerators",
      agentName: "Baidu AI Compute Expert (Tier 14)",
      agentId: "baidu_gpu_expert",
      status: "ACTIVE",
      capabilities: ["kunlun-compilation", "gpu-virtualization", "training-fabric"],
      description: "Optimizes AI model hardware clusters using NVIDIA and custom Kunlun server pools.",
      icon: "Server"
    },
    {
      name: "BOS Storage BOS",
      functionName: "Resilient Data Lake Storage",
      agentName: "Baidu Storage Specialist (Tier 14)",
      agentId: "baidu_bos_expert",
      status: "ACTIVE",
      capabilities: ["bos-lifecycles", "s3-compatibility", "archive-policies"],
      description: "Controls Baidu Object Storage (BOS) datasets, cold storage transfers, and permission models.",
      icon: "Database"
    },
    {
      name: "Security Shield IAM",
      functionName: "Identity Governance Security",
      agentName: "Baidu Security Guardian (Tier 14)",
      agentId: "baidu_security_expert",
      status: "SWARMING",
      capabilities: ["iam-quota-sweeps", "access-keys", "firewall-rules"],
      description: "Schedules token validation checks, controls system access keys, and reviews incoming traffic rules.",
      icon: "Lock"
    }
  ],
  "Huawei Cloud": [
    {
      name: "ECS Server Instances",
      functionName: "Elastic VM Compute",
      agentName: "Huawei ECS Expert (Tier 14)",
      agentId: "huawei_ecs_expert",
      status: "ACTIVE",
      capabilities: ["ecs-scaling", "instance-types", "disk-volumes"],
      description: "Manages Elastic Cloud Server (ECS) vm directories, custom OS profiles, and volumes mapping.",
      icon: "Server"
    },
    {
      name: "OBS Object Storage",
      functionName: "High-Durability Cloud Storage",
      agentName: "Huawei OBS Specialist (Tier 14)",
      agentId: "huawei_obs_expert",
      status: "ACTIVE",
      capabilities: ["obs-buckets-cors", "lifecycle-retention", "kms-encryption"],
      description: "Enforces S3-compliant Object Storage Service (OBS) folders, structures KMS data encryption, and cors rules.",
      icon: "Database"
    },
    {
      name: "FunctionGraph Serverless",
      functionName: "Serverless Workflow Engine",
      agentName: "Huawei Serverless Expert (Tier 14)",
      agentId: "huawei_fg_expert",
      status: "OPTIMIZING",
      capabilities: ["fg-orchestration", "http-triggers", "node-autoscaling"],
      description: "Coordinates FunctionGraph serverless runtime chains, setups HTTP trigger gates, and balances nodes.",
      icon: "Cpu"
    },
    {
      name: "Identity Access IAM",
      functionName: "Unified Identity Management",
      agentName: "Huawei Security Guardian (Tier 14)",
      agentId: "huawei_iam_expert",
      status: "SWARMING",
      capabilities: ["iam-federation", "service-account-tokens", "audit-logs"],
      description: "Secures unified credentials access directories, schedules token validations, and checks activity logs.",
      icon: "Lock"
    }
  ],
  "OVHcloud": [
    {
      name: "OVH Bare Metal Compute",
      functionName: "Sovereign Physical Compute",
      agentName: "OVH Physical Server Expert (Tier 14)",
      agentId: "ovh_baremetal_expert",
      status: "ACTIVE",
      capabilities: ["bare-metal-ipmi", "raid-monitoring", "hardware-diagnostics"],
      description: "Provisions sovereign EU physical machines, configures RAID drive pools, and monitors IPMI links.",
      icon: "Server"
    },
    {
      name: "OVH Object Storage",
      functionName: "Sovereign S3 Database",
      agentName: "OVH Storage Guardian (Tier 14)",
      agentId: "ovh_storage_expert",
      status: "ACTIVE",
      capabilities: ["sovereign-storage-lock", "swift-migration", "bucket-rules"],
      description: "Coordinates high-durability European object storage systems, swift container migrations, and access lists.",
      icon: "Database"
    },
    {
      name: "Managed Kubernetes",
      functionName: "GDPR Compliant Clusters",
      agentName: "OVH Kubernetes Expert (Tier 14)",
      agentId: "ovh_k8s_expert",
      status: "OPTIMIZING",
      capabilities: ["k8s-pod-autoscaling", "gdpr-compliance", "metallb-routing"],
      description: "Maintains secure Kubernetes container nodes, isolates GDPR sensitive pods, and maps router paths.",
      icon: "Cpu"
    },
    {
      name: "Anti-DDoS Shield",
      functionName: "Edge Traffic Protection",
      agentName: "OVH Security Shield (Tier 14)",
      agentId: "ovh_security_shield",
      status: "SWARMING",
      capabilities: ["ddos-filtering", "virtual-routing", "port-knocking"],
      description: "Mitigates incoming high-capacity DDoS attacks, applies network protection layers, and locks secure ports.",
      icon: "Lock"
    }
  ],
  "Scaleway": [
    {
      name: "Scaleway Compute Instances",
      functionName: "Developer Cloud Compute",
      agentName: "Scaleway Compute Expert (Tier 14)",
      agentId: "scaleway_compute_expert",
      status: "ACTIVE",
      capabilities: ["vps-deployment", "persistent-ssd", "hot-snapshots"],
      description: "Provisions high-value virtual instance nodes, hooks up SSD arrays, and captures backup images.",
      icon: "Server"
    },
    {
      name: "Elements Object Storage",
      functionName: "S3 Sovereign Storage Pools",
      agentName: "Scaleway Storage Specialist (Tier 14)",
      agentId: "scaleway_storage_expert",
      status: "ACTIVE",
      capabilities: ["elements-lifecycles", "signed-urls", "storage-classes"],
      description: "Configures Elements asset storage folders, generates secure signed URLs, and optimizes archive tiers.",
      icon: "Database"
    },
    {
      name: "Serverless Containers",
      functionName: "Container Autoscale Compute",
      agentName: "Scaleway Serverless Specialist (Tier 14)",
      agentId: "scaleway_serverless_expert",
      status: "OPTIMIZING",
      capabilities: ["container-autoscale", "env-injection", "rest-gateway"],
      description: "Runs containerized serverless tasks, triggers dynamic scaling limits, and routes inbound requests.",
      icon: "Cpu"
    },
    {
      name: "VPC Private Mesh",
      functionName: "Private Virtual Network",
      agentName: "Scaleway Network Guardian (Tier 14)",
      agentId: "scaleway_network_guardian",
      status: "SWARMING",
      capabilities: ["vpc-peerings", "public-gateways", "firewall-rules"],
      description: "Isolates private network segments, deploys domain security gates, and monitors active routing protocols.",
      icon: "Network"
    }
  ],
  "Tencent Cloud": [
    {
      name: "CVM Cloud Compute",
      functionName: "Elastic VM Instances",
      agentName: "Tencent ECS Expert (Tier 14)",
      agentId: "tencent_cvm_expert",
      status: "ACTIVE",
      capabilities: ["cvm-autoscaling", "image-templates", "disk-volumes"],
      description: "Coordinates high-performance virtual machine nodes, handles volume resizing, and schedules image states.",
      icon: "Server"
    },
    {
      name: "COS Object Storage",
      functionName: "Multi-Tiers Distributed Storage",
      agentName: "Tencent COS Guardian (Tier 14)",
      agentId: "tencent_cos_expert",
      status: "ACTIVE",
      capabilities: ["cos-lifecycles", "cross-region-sync", "cdn-caching"],
      description: "Optimizes Tencent Cloud Object Storage (COS) buckets, schedules region syncs, and applies caching settings.",
      icon: "Database"
    },
    {
      name: "SCF Serverless Compute",
      functionName: "Event-Trigger Serverless",
      agentName: "Tencent SCF Specialist (Tier 14)",
      agentId: "tencent_scf_expert",
      status: "OPTIMIZING",
      capabilities: ["scf-cold-starts", "api-gateway-binding", "event-rules"],
      description: "Controls serverless execution runs, maps API gateway pipelines, and tracks trigger rules.",
      icon: "Cpu"
    },
    {
      name: "CAM Access Guardian",
      functionName: "Cloud Access Security",
      agentName: "Tencent Security Shield (Tier 14)",
      agentId: "tencent_cam_expert",
      status: "SWARMING",
      capabilities: ["cam-policies", "sub-account-tokens", "audit-logs"],
      description: "Restricts sub-account access directories, validates dynamic token keys, and audits activity logs.",
      icon: "Lock"
    }
  ],
  "Yandex Cloud": [
    {
      name: "Compute Cloud VMs",
      functionName: "High-Performance CPU/GPU",
      agentName: "Yandex Compute Specialist (Tier 14)",
      agentId: "yandex_compute_specialist",
      status: "ACTIVE",
      capabilities: ["cpu-gpu-allocation", "disk-snapshots", "vm-groups"],
      description: "Provisions virtual machines with custom CPU and GPU cores, manages disk arrays, and hooks groups.",
      icon: "Server"
    },
    {
      name: "Yandex Storage",
      functionName: "S3 Cold & Hot Storage",
      agentName: "Yandex Storage Expert (Tier 14)",
      agentId: "yandex_storage_expert",
      status: "ACTIVE",
      capabilities: ["storage-cors", "lifecycle-retention", "bucket-logging"],
      description: "Maintains S3-compatible cloud storage buckets, enforces retention durations, and gathers logs.",
      icon: "Database"
    },
    {
      name: "Yandex Lockbox Vault",
      functionName: "Secrets Key Management",
      agentName: "Yandex Security Guardian (Tier 14)",
      agentId: "yandex_lockbox_guardian",
      status: "SWARMING",
      capabilities: ["lockbox-secrets", "token-rotations", "access-keys"],
      description: "Stores system environment variables, schedules automated token sweeps, and audits active credentials.",
      icon: "Lock"
    }
  ],
  "Sinopec Cloud": [
    {
      name: "Petro Compute Engine",
      functionName: "Heavy-Duty Scientific VMs",
      agentName: "Sinopec Compute Expert (Tier 14)",
      agentId: "sinopec_compute_expert",
      status: "ACTIVE",
      capabilities: ["drilling-vms", "scientific-clusters", "thermal-throttles"],
      description: "Runs specialized petro-chemical VM nodes, balances compute workloads, and optimizes processing.",
      icon: "Server"
    },
    {
      name: "Sinopec Secure Storage",
      functionName: "High-Security Data Vaults",
      agentName: "Sinopec Storage Guardian (Tier 14)",
      agentId: "sinopec_storage_expert",
      status: "ACTIVE",
      capabilities: ["isolated-pools", "kms-vault-locks", "compliance-auditing"],
      description: "Locks high-security storage pools, restricts public network access, and schedules checks.",
      icon: "Database"
    },
    {
      name: "Petro Network Shield",
      functionName: "Isolated Dedicated Networks",
      agentName: "Sinopec Network Guardian (Tier 14)",
      agentId: "sinopec_network_expert",
      status: "SWARMING",
      capabilities: ["dedicated-tunnels", "vpn-firewalls", "ingress-filters"],
      description: "Establishes secure dedicated private connections, blocks foreign access vectors, and filters logs.",
      icon: "Network"
    }
  ],
  "Exoscale": [
    {
      name: "Swiss VM Compute",
      functionName: "Secure Swiss Virtual Compute",
      agentName: "Exoscale Compute Expert (Tier 14)",
      agentId: "exoscale_compute_expert",
      status: "ACTIVE",
      capabilities: ["swiss-vms", "nvme-volumes", "snapshot-schedules"],
      description: "Provisions secure Swiss virtual servers, allocates NVMe disk blocks, and manages snapshot intervals.",
      icon: "Server"
    },
    {
      name: "Simple Object Storage",
      functionName: "Sovereign European Storage",
      agentName: "Exoscale Storage Specialist (Tier 14)",
      agentId: "exoscale_storage_expert",
      status: "ACTIVE",
      capabilities: ["sos-lifecycles", "cors-rules", "sovereign-encryption"],
      description: "Coordinates Swiss-hosted object storage directories, handles CORS access configs, and locks encryption.",
      icon: "Database"
    },
    {
      name: "Exoscale DBaaS",
      functionName: "Sovereign Managed Databases",
      agentName: "Exoscale DB Specialist (Tier 14)",
      agentId: "exoscale_db_specialist",
      status: "ACTIVE",
      capabilities: ["managed-postgres", "kafka-streams", "opensearch-caching"],
      description: "Tunes managed PostgreSQL database instances, sets up Kafka event queues, and manages OpenSearch metrics.",
      icon: "Database"
    },
    {
      name: "IAM Key Governance",
      functionName: "Swiss Enclave Credentials",
      agentName: "Exoscale Security Guardian (Tier 14)",
      agentId: "exoscale_security_guardian",
      status: "SWARMING",
      capabilities: ["api-key-restrictions", "compartment-isolation", "ip-restrictions"],
      description: "Locks down Swiss developer credentials, monitors API key bindings, and filters originating IPs.",
      icon: "Lock"
    }
  ],
  "Cherry Servers": [
    {
      name: "Dedicated Bare Metal",
      functionName: "Physical Custom Dedicated Compute",
      agentName: "Cherry Physical Expert (Tier 14)",
      agentId: "cherry_physical_expert",
      status: "ACTIVE",
      capabilities: ["dedicated-hardware", "ipmi-locks", "raid-allocation"],
      description: "Optimizes raw server configurations, schedules IPMI access limits, and handles disk arrays.",
      icon: "Server"
    },
    {
      name: "Cherry Storage Block",
      functionName: "Persistent SSD Storage Volumes",
      agentName: "Cherry Storage Specialist (Tier 14)",
      agentId: "cherry_storage_expert",
      status: "ACTIVE",
      capabilities: ["ssd-mounting", "volume-expansion", "raw-backups"],
      description: "Allocates dedicated high-speed SSD blocks, automates partition adjustments, and runs backups.",
      icon: "Database"
    },
    {
      name: "Isolated Network LAN",
      functionName: "VLAN Network Security",
      agentName: "Cherry Network Guardian (Tier 14)",
      agentId: "cherry_network_guardian",
      status: "SWARMING",
      capabilities: ["vlan-bridges", "public-ips", "port-forwarding"],
      description: "Sets up secure VLAN segments, balances public IP structures, and isolates active ports.",
      icon: "Network"
    }
  ],
  "Equinix Metal": [
    {
      name: "Edge Bare Metal",
      functionName: "High-Performance Edge Physicals",
      agentName: "Equinix Hardware Expert (Tier 14)",
      agentId: "equinix_hardware_expert",
      status: "ACTIVE",
      capabilities: ["provisioning-speed", "firmware-locks", "console-audits"],
      description: "Deploys on-demand physical servers close to end-users, applies firmware locks, and tracks setups.",
      icon: "Server"
    },
    {
      name: "Equinix Fabric Network",
      functionName: "Multi-Cloud Connect Network",
      agentName: "Equinix Fabric Specialist (Tier 14)",
      agentId: "equinix_fabric_specialist",
      status: "ACTIVE",
      capabilities: ["fabric-mesh", "wan-routing", "inter-region-sync"],
      description: "Controls software-defined WAN interconnections, bridges AWS/GCP routing, and checks packet drops.",
      icon: "Network"
    },
    {
      name: "Enclave Security Vault",
      functionName: "Zero-Trust Physical Credentials",
      agentName: "Equinix Security Guardian (Tier 14)",
      agentId: "equinix_security_guardian",
      status: "SWARMING",
      capabilities: ["hsm-key-custody", "ssh-rotation", "port-monitoring"],
      description: "Maintains hardware security modules (HSMs), rotates SSH access credential rings, and audits connections.",
      icon: "Lock"
    }
  ],
  "Fastly": [
    {
      name: "Compute@Edge Wasm",
      functionName: "Wasm Edge Serverless Compute",
      agentName: "Fastly Edge Expert (Tier 14)",
      agentId: "fastly_edge_expert",
      status: "ACTIVE",
      capabilities: ["wasm-compiles", "edge-dictionaries", "microsecond-latency"],
      description: "Deploys high-speed WebAssembly routines at global edge locations, optimizing execution times.",
      icon: "Cpu"
    },
    {
      name: "Varnish Proxy Cache",
      functionName: "Dynamic VCL Caching Engine",
      agentName: "Fastly Cache Specialist (Tier 14)",
      agentId: "fastly_cache_specialist",
      status: "ACTIVE",
      capabilities: ["vcl-syntax-linting", "purge-actions", "origin-shielding"],
      description: "Compiles Varnish Configuration Language (VCL), triggers instant asset cache purges, and secures origins.",
      icon: "Network"
    },
    {
      name: "Edge Log Streaming",
      functionName: "Real-Time Telemetry Metrics",
      agentName: "Fastly Log Expert (Tier 14)",
      agentId: "fastly_log_expert",
      status: "OPTIMIZING",
      capabilities: ["real-time-logs", "syslog-endpoints", "latency-alarms"],
      description: "Streams sub-second request logs directly to analysis backends, monitoring latency indicators.",
      icon: "Activity"
    },
    {
      name: "Fastly WAF Shield",
      functionName: "Layer 7 Security Filter",
      agentName: "Fastly Security Guardian (Tier 14)",
      agentId: "fastly_security_guardian",
      status: "SWARMING",
      capabilities: ["waf-rule-audits", "ddos-mitigation", "ip-reputation"],
      description: "Regulates edge web application firewalls, blocks high-volume L7 DDoS attacks, and manages reputational bans.",
      icon: "Lock"
    }
  ],
  "Lumen": [
    {
      name: "Edge Compute Physicals",
      functionName: "Edge Bare Metal Compute",
      agentName: "Lumen Hardware Expert (Tier 14)",
      agentId: "lumen_hardware_expert",
      status: "ACTIVE",
      capabilities: ["edge-bare-metal", "raid-volumes", "host-diagnostics"],
      description: "Coordinates local physical server deployments, allocates block storage, and structures diagnostics.",
      icon: "Server"
    },
    {
      name: "Edge CDN Routers",
      functionName: "High-Capacity Media Delivery",
      agentName: "Lumen Network Specialist (Tier 14)",
      agentId: "lumen_network_specialist",
      status: "ACTIVE",
      capabilities: ["media-caching", "anycast-routing", "traffic-splitting"],
      description: "Controls large-scale video/file delivery caches, balances network flows, and secures router configurations.",
      icon: "Network"
    },
    {
      name: "Lumen Security Edge",
      functionName: "Secure WAN Gateway",
      agentName: "Lumen Security Guardian (Tier 14)",
      agentId: "lumen_security_guardian",
      status: "SWARMING",
      capabilities: ["vpn-mesh", "port-monitoring", "access-keys"],
      description: "Locks secure Wide Area Network access lines, validates SSH credential loops, and reports packet drops.",
      icon: "Lock"
    }
  ],
  "MacStadium": [
    {
      name: "Bare Metal Macs",
      functionName: "Dedicated Apple Silicon Compute",
      agentName: "MacStadium macOS Expert (Tier 14)",
      agentId: "macstadium_macos_expert",
      status: "ACTIVE",
      capabilities: ["m2-m3-baremetal", "macos-virtualization", "system-caching"],
      description: "Provisions M1, M2, and M3 Mac mini configurations, virtualizes macOS kernels, and configures cache caches.",
      icon: "Server"
    },
    {
      name: "Orka Desktop Cluster",
      functionName: "Enterprise macOS Kubernetes",
      agentName: "MacStadium Orka Expert (Tier 14)",
      agentId: "macstadium_orka_expert",
      status: "ACTIVE",
      capabilities: ["orka-k8s-nodes", "pod-resizing", "image-building"],
      description: "Orchestrates Orka-powered Kubernetes VM systems, schedules iOS test worker pools, and compiles images.",
      icon: "Cpu"
    },
    {
      name: "iOS Build Monitor",
      functionName: "Build Telemetry Analytics",
      agentName: "MacStadium Build Expert (Tier 14)",
      agentId: "macstadium_build_expert",
      status: "OPTIMIZING",
      capabilities: ["xcode-diagnostics", "build-speedup", "log-parsing"],
      description: "Monitors active Xcode pipeline processes, parses build logs for failure diagnostics, and optimizes speed.",
      icon: "Activity"
    },
    {
      name: "Secure VPN Gateway",
      functionName: "Zero-Trust macOS VPN",
      agentName: "MacStadium Security Shield (Tier 14)",
      agentId: "macstadium_security_shield",
      status: "SWARMING",
      capabilities: ["cisco-vpn-tunnels", "access-key-vaults", "ip-restrictions"],
      description: "Locks down secure developer virtual private network links, enforces multifactor checks, and restricts IPs.",
      icon: "Lock"
    }
  ],
  "Maxihost": [
    {
      name: "Global Bare Metal",
      functionName: "Physical Dedicated Servers",
      agentName: "Maxihost Hardware Expert (Tier 14)",
      agentId: "maxihost_hardware_expert",
      status: "ACTIVE",
      capabilities: ["hardware-provisioning", "raid-arrays", "ipmi-access"],
      description: "Provisions on-demand dedicated servers globally, configures RAID systems, and sets up secure IPMI links.",
      icon: "Server"
    },
    {
      name: "Network & DNS",
      functionName: "Anycast Global Network",
      agentName: "Maxihost Network Expert (Tier 14)",
      agentId: "maxihost_network_expert",
      status: "ACTIVE",
      capabilities: ["anycast-dns", "vlan-tagging", "ddos-filters"],
      description: "Coordinates fast anycast DNS setups, isolates VLAN tags, and monitors packet security filters.",
      icon: "Network"
    },
    {
      name: "Maxihost Firewall",
      functionName: "Infrastructure Security Shield",
      agentName: "Maxihost Security Guardian (Tier 14)",
      agentId: "maxihost_security_guardian",
      status: "SWARMING",
      capabilities: ["l3-l4-filtering", "token-sweeps", "port-protection"],
      description: "Locks out Layer 3/4 unauthorized traffic, runs access key sweeps, and secures server ports.",
      icon: "Lock"
    }
  ],
  "Rackspace": [
    {
      name: "Multi-Cloud VMs",
      functionName: "Hybrid VM Orchestrations",
      agentName: "Rackspace VM Specialist (Tier 14)",
      agentId: "rackspace_vm_specialist",
      status: "ACTIVE",
      capabilities: ["hybrid-vms", "openstack-scaling", "backup-jobs"],
      description: "Manages hybrid cloud instances, OpenStack virtual server pools, and schedules system backup jobs.",
      icon: "Server"
    },
    {
      name: "Rackspace Databases",
      functionName: "Managed DB Clusters",
      agentName: "Rackspace DB Expert (Tier 14)",
      agentId: "rackspace_db_expert",
      status: "ACTIVE",
      capabilities: ["sql-tuning", "no-sql-replication", "snapshot-restore"],
      description: "Balances relational SQL databases, manages NoSQL data replication routes, and handles system restores.",
      icon: "Database"
    },
    {
      name: "Active Firewall Guard",
      functionName: "Threat Monitoring Security",
      agentName: "Rackspace Security Guardian (Tier 14)",
      agentId: "rackspace_security_guardian",
      status: "SWARMING",
      capabilities: ["threat-audits", "port-filtering", "credential-sweeps"],
      description: "Performs real-time threat scans, applies network port filters, and enforces strict credential rotations.",
      icon: "Lock"
    }
  ],
  "Packet": [
    {
      name: "On-Demand Metal",
      functionName: "On-Demand Physical Servers",
      agentName: "Packet Hardware Expert (Tier 14)",
      agentId: "packet_hardware_expert",
      status: "ACTIVE",
      capabilities: ["provisioning-speed", "bare-metal-ipmi", "raid-setup"],
      description: "Deploys dedicated physical servers instantly, configures secure RAID levels, and manages IPMI controllers.",
      icon: "Server"
    },
    {
      name: "BGP Layer 3 Routing",
      functionName: "Programmable Network Routing",
      agentName: "Packet Network Specialist (Tier 14)",
      agentId: "packet_network_specialist",
      status: "ACTIVE",
      capabilities: ["bgp-routing", "elastic-ips", "vlan-bridges"],
      description: "Tunes programmable BGP routing setups, allocates elastic IP configurations, and isolates internal bridges.",
      icon: "Network"
    },
    {
      name: "SSH Key Guardian",
      functionName: "Secure Access Controls",
      agentName: "Packet Security Guardian (Tier 14)",
      agentId: "packet_security_guardian",
      status: "SWARMING",
      capabilities: ["ssh-rotations", "api-token-audits", "ingress-filters"],
      description: "Enforces strict developer SSH key rotations, audits active API tokens, and applies ingress filters.",
      icon: "Lock"
    }
  ],
  "Cloudflare": [
    {
      name: "Cloudflare Workers",
      functionName: "Edge V8 Isolate Serverless",
      agentName: "Cloudflare Worker Expert (Tier 14)",
      agentId: "cloudflare_worker_expert",
      status: "ACTIVE",
      capabilities: ["workers-wrangler", "v8-isolates", "cron-triggers"],
      description: "Deploys V8 isolate serverless routines globally, manages cron triggers, and monitors cpu millisecond usage.",
      icon: "Cpu"
    },
    {
      name: "Cloudflare R2 Object",
      functionName: "Zero Egress Fee Storage",
      agentName: "Cloudflare R2 Specialist (Tier 14)",
      agentId: "cloudflare_r2_specialist",
      status: "ACTIVE",
      capabilities: ["r2-cors-policies", "s3-compatibility", "signed-urls"],
      description: "Configures zero egress fee R2 object buckets, maps S3-compatible endpoints, and generates signed keys.",
      icon: "Database"
    },
    {
      name: "KV & D1 Databases",
      functionName: "Edge SQL & Document Stores",
      agentName: "Cloudflare DB Expert (Tier 14)",
      agentId: "cloudflare_db_expert",
      status: "OPTIMIZING",
      capabilities: ["d1-migrations", "kv-namespaces", "hyperdrive-pooling"],
      description: "Controls distributed SQLite D1 migrations, KV namespace caches, and Hyperdrive backend database pools.",
      icon: "Database"
    },
    {
      name: "Zero Trust Tunnels",
      functionName: "Secure Edge Access Gateway",
      agentName: "Cloudflare Zero Trust Guardian (Tier 14)",
      agentId: "cloudflare_zero_trust_guardian",
      status: "SWARMING",
      capabilities: ["cloudflare-tunnels", "access-policies", "dnssec-keys"],
      description: "Establishes secure ingress tunnels, applies conditional single sign-on checks, and monitors DNSSEC records.",
      icon: "Lock"
    }
  ],
  "1&1 IONOS": [
    {
      name: "Cloud Virtual Servers",
      functionName: "Sovereign Cloud VMs",
      agentName: "IONOS Compute Specialist (Tier 14)",
      agentId: "ionos_compute_specialist",
      status: "ACTIVE",
      capabilities: ["virtual-vps", "backup-snapshots", "cpu-allocations"],
      description: "Provisions secure virtual servers, manages backup snapshot lists, and scales CPU resources.",
      icon: "Server"
    },
    {
      name: "IONOS Object Storage",
      functionName: "Sovereign Backup Storage",
      agentName: "IONOS Storage Expert (Tier 14)",
      agentId: "ionos_storage_expert",
      status: "ACTIVE",
      capabilities: ["s3-backups", "cors-handling", "lifecycle-retention"],
      description: "Coordinates S3-compatible sovereign backup storage buckets, handles CORS rules, and sets retention times.",
      icon: "Database"
    },
    {
      name: "DCD Data Center Designer",
      functionName: "Visual IaC Architectures",
      agentName: "IONOS IaC Expert (Tier 14)",
      agentId: "ionos_iac_expert",
      status: "IDLE",
      capabilities: ["dcd-templates", "state-locking", "drift-checking"],
      description: "Synthesizes data center designer templates, handles state locks, and audits server drift status.",
      icon: "Activity"
    }
  ],
  "Atlantic.Net": [
    {
      name: "HIPAA SSD Compute",
      functionName: "HIPAA Compliant SSD VMs",
      agentName: "Atlantic Compute Expert (Tier 14)",
      agentId: "atlantic_compute_expert",
      status: "ACTIVE",
      capabilities: ["hipaa-vms", "ssd-volumes", "snapshot-schedules"],
      description: "Provisions secure HIPAA-compliant SSD virtual machines, schedules backups, and configures disks.",
      icon: "Server"
    },
    {
      name: "HIPAA Security Guard",
      functionName: "Strict Medical Security Group",
      agentName: "Atlantic Security Guardian (Tier 14)",
      agentId: "atlantic_security_guardian",
      status: "SWARMING",
      capabilities: ["hipaa-auditing", "firewall-rules", "encryption-enforcement"],
      description: "Performs regular HIPAA compliance audits, maps firewall filters, and encrypts storage partitions.",
      icon: "Lock"
    }
  ],
  "Hetzner": [
    {
      name: "Hetzner Cloud VMs",
      functionName: "European Virtual Compute",
      agentName: "Hetzner Compute Specialist (Tier 14)",
      agentId: "hetzner_compute_specialist",
      status: "ACTIVE",
      capabilities: ["vps-sizing-cx", "block-volumes-hc", "snapshot-backups"],
      description: "Provisions Hetzner Cloud virtual instances, manages block storage, and schedules backup snapshots.",
      icon: "Server"
    },
    {
      name: "Storage Box Storage",
      functionName: "Resilient Backup Arrays",
      agentName: "Hetzner Storage Expert (Tier 14)",
      agentId: "hetzner_storage_expert",
      status: "ACTIVE",
      capabilities: ["sftp-shares", "samba-mounts", "retention-rules"],
      description: "Manages dedicated SFTP and Samba storage box backups, sets storage rules, and tracks bytes usage.",
      icon: "Database"
    },
    {
      name: "Hetzner Cloud Networks",
      functionName: "Isolated Private Subnets",
      agentName: "Hetzner Network Specialist (Tier 14)",
      agentId: "hetzner_network_specialist",
      status: "OPTIMIZING",
      capabilities: ["private-subnets", "route-tables", "load-balancers"],
      description: "Configures private cloud sub-networks, sets up routing tables, and provisions load balancers.",
      icon: "Network"
    },
    {
      name: "Robot Hardware Telemetry",
      functionName: "Bare Metal Health Pulse",
      agentName: "Hetzner Hardware Guardian (Tier 14)",
      agentId: "hetzner_hardware_guardian",
      status: "SWARMING",
      capabilities: ["robot-api-checks", "smart-disk-diagnostics", "thermal-logs"],
      description: "Audits dedicated physical servers via Hetzner Robot API, monitors disk smart data, and tracks CPU thermal logs.",
      icon: "Lock"
    }
  ],
  "Kamatera": [
    {
      name: "Express Cloud Compute",
      functionName: "Instant Virtual Servers",
      agentName: "Kamatera VM Specialist (Tier 14)",
      agentId: "kamatera_vm_specialist",
      status: "ACTIVE",
      capabilities: ["instant-vms", "disk-volumes", "snapshot-backups"],
      description: "Provisions custom CPU and RAM virtual server configurations instantly, handling disk allocations.",
      icon: "Server"
    },
    {
      name: "Kamatera Networking",
      functionName: "Private LAN Segments",
      agentName: "Kamatera Network Specialist (Tier 14)",
      agentId: "kamatera_network_specialist",
      status: "OPTIMIZING",
      capabilities: ["private-lan", "elastic-ips", "routing-rules"],
      description: "Manages isolated private LAN network connections, floating IP setups, and handles gateway routing.",
      icon: "Network"
    }
  ],
  "Linode": [
    {
      name: "Linode Compute VMs",
      functionName: "Developer Cloud Compute",
      agentName: "Linode Compute Specialist (Tier 14)",
      agentId: "linode_compute_specialist",
      status: "ACTIVE",
      capabilities: ["vps-deployment", "block-storage", "backup-snapshots"],
      description: "Provisions reliable virtual private machines, mounts block volumes, and schedules snapshots.",
      icon: "Server"
    },
    {
      name: "Object Storage S3",
      functionName: "S3 S3-Compatible Asset Space",
      agentName: "Linode Storage Expert (Tier 14)",
      agentId: "linode_storage_expert",
      status: "ACTIVE",
      capabilities: ["s3-cors-policies", "signed-urls", "lifecycle-retention"],
      description: "Manages S3-compatible asset spaces, applies custom CORS settings, and generates signature keys.",
      icon: "Database"
    },
    {
      name: "Linode NodeBalancers",
      functionName: "Managed L4/L7 Load Balancing",
      agentName: "Linode Network Router (Tier 14)",
      agentId: "linode_network_router",
      status: "OPTIMIZING",
      capabilities: ["nodebalancers-ssl", "ports-matching", "health-probes"],
      description: "Configures managed load balancer nodes, manages SSL certificates, and implements health probes.",
      icon: "Network"
    },
    {
      name: "LKE Kubernetes Engine",
      functionName: "Container Autoscale Kubernetes",
      agentName: "Linode Kubernetes Expert (Tier 14)",
      agentId: "linode_kubernetes_expert",
      status: "ACTIVE",
      capabilities: ["lke-scaling", "pod-isolation", "yaml-deployments"],
      description: "Maintains Kubernetes clusters, manages pod deployment scaling, and verifies yaml configs.",
      icon: "Cpu"
    }
  ],
  "UpCloud": [
    {
      name: "MaxIOPS Compute VMs",
      functionName: "Proprietary High-Performance Compute",
      agentName: "UpCloud Compute Specialist (Tier 14)",
      agentId: "upcloud_compute_specialist",
      status: "ACTIVE",
      capabilities: ["maxiops-speedup", "block-snapshots", "vm-groups"],
      description: "Deploys virtual machines backed by fast proprietary MaxIOPS storage arrays, optimizing disk I/O.",
      icon: "Server"
    },
    {
      name: "Managed DBaas",
      functionName: "Relational SQL & Redis Cache",
      agentName: "UpCloud Database Expert (Tier 14)",
      agentId: "upcloud_database_expert",
      status: "ACTIVE",
      capabilities: ["managed-postgres", "redis-pooling", "opensearch-sync"],
      description: "Tunes managed PostgreSQL databases, handles Redis connection structures, and syncs OpenSearch nodes.",
      icon: "Database"
    },
    {
      name: "SDN Network Gates",
      functionName: "Software-Defined Networking",
      agentName: "UpCloud Network Guardian (Tier 14)",
      agentId: "upcloud_network_guardian",
      status: "SWARMING",
      capabilities: ["sdn-firewalls", "floating-ips", "ingress-filters"],
      description: "Establishes secure software-defined subnets, manages dynamic public IPs, and filters inbound traffic.",
      icon: "Lock"
    }
  ],
  "Vultr": [
    {
      name: "NVMe Virtual Compute",
      functionName: "High-Performance Cloud Compute",
      agentName: "Vultr Compute Specialist (Tier 14)",
      agentId: "vultr_compute_specialist",
      status: "ACTIVE",
      capabilities: ["nvme-vps-deploy", "startup-scripts", "snapshots-backup"],
      description: "Provisions reliable SSD/NVMe virtual private servers, schedules snapshots, and injects startup configurations.",
      icon: "Server"
    },
    {
      name: "Vultr Kubernetes VKE",
      functionName: "Managed Container Kubernetes",
      agentName: "Vultr Kubernetes Specialist (Tier 14)",
      agentId: "vultr_k8s_specialist",
      status: "ACTIVE",
      capabilities: ["vke-autoscaling", "load-balancer-sync", "pod-policies"],
      description: "Deploys Kubernetes nodes, balances dynamic load balancer rules, and applies container isolation policies.",
      icon: "Cpu"
    },
    {
      name: "Vultr Firewall Group",
      functionName: "Network Security Filter",
      agentName: "Vultr Security Guardian (Tier 14)",
      agentId: "vultr_security_guardian",
      status: "SWARMING",
      capabilities: ["firewall-groups", "token-sweeps", "port-blocks"],
      description: "Manages network firewall groups, schedules access token check routines, and blocks insecure ports.",
      icon: "Lock"
    }
  ],
  "Hostwinds": [
    {
      name: "Managed VPS Compute",
      functionName: "Fully Managed Cloud Servers",
      agentName: "Hostwinds Compute Expert (Tier 14)",
      agentId: "hostwinds_compute_expert",
      status: "ACTIVE",
      capabilities: ["managed-vps-config", "nightly-backups", "disk-expansions"],
      description: "Monitors managed virtual servers, schedules automated backups, and adjusts disk partitioning.",
      icon: "Server"
    },
    {
      name: "Hostwinds Network",
      functionName: "IP Allocations & Subnets",
      agentName: "Hostwinds Network Guardian (Tier 14)",
      agentId: "hostwinds_network_guardian",
      status: "SWARMING",
      capabilities: ["ip-routing", "private-subnets", "firewall-filters"],
      description: "Isolates private network connections, maps IP routing directories, and applies port security filters.",
      icon: "Lock"
    }
  ],
  "Liquid Web": [
    {
      name: "Liquid Dedicated Metal",
      functionName: "Managed Physical Bare Metal",
      agentName: "Liquid Web Hardware Expert (Tier 14)",
      agentId: "liquidweb_hardware_expert",
      status: "ACTIVE",
      capabilities: ["dedicated-tuning", "acronis-backups", "smart-disk-scans"],
      description: "Coordinates dedicated high-performance physical servers, runs Acronis backups, and checks disk health.",
      icon: "Server"
    },
    {
      name: "Threat Stack Guard",
      functionName: "Intrusion Detection Security",
      agentName: "Liquid Web Security Guardian (Tier 14)",
      agentId: "liquidweb_security_guardian",
      status: "SWARMING",
      capabilities: ["threat-stack-audits", "port-blocks", "credential-rotations"],
      description: "Runs real-time Threat Stack intrusion scans, manages firewall groups, and enforces credential cycles.",
      icon: "Lock"
    }
  ],
  "Aiven": [
    {
      name: "Aiven Postgres DB",
      functionName: "Managed Relational Database",
      agentName: "Aiven Database Expert (Tier 14)",
      agentId: "aiven_db_expert",
      status: "ACTIVE",
      capabilities: ["postgres-pooling", "automated-backups", "pg-extensions"],
      description: "Provisions managed PostgreSQL database nodes, schedules daily backup sweeps, and loads extensions.",
      icon: "Database"
    },
    {
      name: "Aiven Apache Kafka",
      functionName: "Managed Event Stream Engine",
      agentName: "Aiven Kafka Expert (Tier 14)",
      agentId: "aiven_kafka_expert",
      status: "ACTIVE",
      capabilities: ["kafka-topics", "schema-registry", "retention-rules"],
      description: "Tunes Kafka message topics, coordinates Schema Registry mappings, and balances message retention.",
      icon: "Database"
    },
    {
      name: "Aiven Multi-Cloud IaC",
      functionName: "Cross-Cloud DB Orchestration",
      agentName: "Aiven IaC Expert (Tier 14)",
      agentId: "aiven_iac_expert",
      status: "IDLE",
      capabilities: ["terraform-aiven", "cloud-routing-sync", "drift-checking"],
      description: "Compiles Aiven Terraform templates, links database connection networks, and checks server drift.",
      icon: "Activity"
    }
  ],
  "Aruba Cloud": [
    {
      name: "Aruba VPS Compute",
      functionName: "European VM Compute",
      agentName: "Aruba Compute Expert (Tier 14)",
      agentId: "aruba_compute_expert",
      status: "ACTIVE",
      capabilities: ["aruba-vps", "block-storage", "snapshot-backups"],
      description: "Configures highly reliable European virtual servers, persistent storage, and backup schedules.",
      icon: "Server"
    },
    {
      name: "Aruba Network Guard",
      functionName: "Virtual Network Security",
      agentName: "Aruba Security Guardian (Tier 14)",
      agentId: "aruba_security_guardian",
      status: "SWARMING",
      capabilities: ["firewall-groups", "vlan-bridges", "access-key-sweeps"],
      description: "Defines cloud security groups, isolates VLAN bridges, and monitors administrator key rings.",
      icon: "Lock"
    }
  ],
  "ClearDATA": [
    {
      name: "ClearDATA HIPAA Compute",
      functionName: "HIPAA Compliant Cloud VMs",
      agentName: "ClearDATA Compute Expert (Tier 14)",
      agentId: "cleardata_compute_expert",
      status: "ACTIVE",
      capabilities: ["hipaa-compliance", "encrypted-storage", "audit-logs"],
      description: "Maintains HIPAA-compliant cloud server directories, locks encrypted partitions, and runs audit logs.",
      icon: "Server"
    },
    {
      name: "HIPAA Compliance Shield",
      functionName: "Zero-Trust Healthcare Rules",
      agentName: "ClearDATA Security Guardian (Tier 14)",
      agentId: "cleardata_security_guardian",
      status: "SWARMING",
      capabilities: ["compliance-dashboard", "kms-vault-locks", "port-knocking"],
      description: "Monitors real-time healthcare compliance scores, schedules KMS key rotations, and secures ports.",
      icon: "Lock"
    }
  ],
  "Cloudera": [
    {
      name: "Data Lakehouse Storage",
      functionName: "ACID Transactional Storage",
      agentName: "Cloudera Storage Expert (Tier 14)",
      agentId: "cloudera_storage_expert",
      status: "ACTIVE",
      capabilities: ["apache-iceberg", "delta-sync", "data-scrubbing"],
      description: "Coordinates Apache Iceberg transactional tables, formats data partitions, and scans bytes.",
      icon: "Database"
    },
    {
      name: "Cloudera Spark Compute",
      functionName: "Scalable Big Data Compute",
      agentName: "Cloudera Spark Expert (Tier 14)",
      agentId: "cloudera_spark_expert",
      status: "ACTIVE",
      capabilities: ["spark-autoscaling", "resource-allocation", "job-queuing"],
      description: "Balances large-scale Spark compute clusters, schedules dynamic job runs, and maps nodes.",
      icon: "Cpu"
    },
    {
      name: "SDN Security Governor",
      functionName: "Unified Data Access Security",
      agentName: "Cloudera Security Guardian (Tier 14)",
      agentId: "cloudera_security_guardian",
      status: "SWARMING",
      capabilities: ["sdx-access-rules", "token-sweeps", "audit-routing"],
      description: "Enforces Shared Data Experience (SDX) governance, checks table access rights, and routes logs.",
      icon: "Lock"
    }
  ],
  "Databricks": [
    {
      name: "Delta Lake Storage",
      functionName: "ACID Object Storage Layer",
      agentName: "Databricks Storage Specialist (Tier 14)",
      agentId: "databricks_storage_specialist",
      status: "ACTIVE",
      capabilities: ["delta-sharing", "parquet-indexing", "vacuum-cleanups"],
      description: "Optimizes Delta Lake dataset tables, schedules vacuum cleanups, and manages parity partitions.",
      icon: "Database"
    },
    {
      name: "Autoscaling Spark",
      functionName: "Big Data Spark Compute Engine",
      agentName: "Databricks Spark Expert (Tier 14)",
      agentId: "databricks_spark_expert",
      status: "ACTIVE",
      capabilities: ["spark-drivers", "worker-nodes", "photon-acceleration"],
      description: "Manages distributed Spark drivers, photon-accelerated instances, and scales worker compute nodes.",
      icon: "Server"
    },
    {
      name: "Unity Catalog IAM",
      functionName: "Centralized Data Security",
      agentName: "Databricks Unity Guardian (Tier 14)",
      agentId: "databricks_unity_guardian",
      status: "SWARMING",
      capabilities: ["catalog-permissions", "row-level-masking", "token-rotation"],
      description: "Enforces fine-grained data governance policies, applies dynamic column masking, and rotates keys.",
      icon: "Lock"
    },
    {
      name: "MLflow Orchestrator",
      functionName: "AI Model Lifecycle Tracker",
      agentName: "Databricks MLflow Expert (Tier 14)",
      agentId: "databricks_mlflow_expert",
      status: "IDLE",
      capabilities: ["model-registry", "experiment-logs", "lineage-checking"],
      description: "Manages MLflow experiment pipelines, logs training parameters, and maintains model versioning.",
      icon: "Activity"
    }
  ],
  "Navisite": [
    {
      name: "Managed Cloud Compute",
      functionName: "Enterprise Multi-Cloud Compute",
      agentName: "Navisite Compute Expert (Tier 14)",
      agentId: "navisite_compute_expert",
      status: "ACTIVE",
      capabilities: ["multi-cloud-vms", "openstack-scaling", "disaster-recovery"],
      description: "Optimizes enterprise multi-cloud VM allocations, structures disaster recovery plans, and monitors loads.",
      icon: "Server"
    },
    {
      name: "Threat Stack Shield",
      functionName: "Threat Monitoring Security",
      agentName: "Navisite Security Guardian (Tier 14)",
      agentId: "navisite_security_guardian",
      status: "SWARMING",
      capabilities: ["intrusion-detection", "access-token-checks", "compliance-audits"],
      description: "Performs active threat scans, implements access token sweeps, and audits compliance states.",
      icon: "Lock"
    }
  ],
  "Nutanix": [
    {
      name: "AHV Enterprise Compute",
      functionName: "Hyperconverged Hypervisor Compute",
      agentName: "Nutanix Hypervisor Expert (Tier 14)",
      agentId: "nutanix_hypervisor_expert",
      status: "ACTIVE",
      capabilities: ["ahv-vm-tuning", "host-clustering", "storage-consolidation"],
      description: "Optimizes Nutanix AHV virtual server hypervisors, coordinates clustering, and manages memory.",
      icon: "Server"
    },
    {
      name: "Nutanix Distributed Files",
      functionName: "Scale-Out File Storage",
      agentName: "Nutanix Storage Specialist (Tier 14)",
      agentId: "nutanix_storage_specialist",
      status: "ACTIVE",
      capabilities: ["scale-out-storage", "compression-pools", "backup-retention"],
      description: "Coordinates distributed scale-out file shares, handles storage compression pools, and schedules backups.",
      icon: "Database"
    },
    {
      name: "Nutanix Flow Network",
      functionName: "VM Microsegmentation Firewall",
      agentName: "Nutanix Network Guardian (Tier 14)",
      agentId: "nutanix_network_guardian",
      status: "SWARMING",
      capabilities: ["microsegmentation", "flow-rules", "port-blocks"],
      description: "Enforces Flow microsegmentation network policies, isolates vm groups, and blocks unauthorized ports.",
      icon: "Lock"
    }
  ],
  "Red Hat": [
    {
      name: "OpenShift K8s compute",
      functionName: "Enterprise Kubernetes Container",
      agentName: "Red Hat OpenShift Expert (Tier 14)",
      agentId: "redhat_openshift_expert",
      status: "ACTIVE",
      capabilities: ["openshift-pods", "cluster-autoscaler", "operator-hub"],
      description: "Orchestrates OpenShift Kubernetes instances, balances dynamic worker nodes, and manages operators.",
      icon: "Cpu"
    },
    {
      name: "Ceph Storage Block",
      functionName: "Scale-Out Distributed Blocks",
      agentName: "Red Hat Storage Specialist (Tier 14)",
      agentId: "redhat_ceph_specialist",
      status: "ACTIVE",
      capabilities: ["ceph-pools", "object-gateway", "data-encryption"],
      description: "Maintains software-defined Ceph storage partitions, object gateways, and enforces data encryption.",
      icon: "Database"
    },
    {
      name: "Ansible Playbooks IaC",
      functionName: "Serverless Configuration Play",
      agentName: "Red Hat Ansible Specialist (Tier 14)",
      agentId: "redhat_ansible_specialist",
      status: "IDLE",
      capabilities: ["ansible-linting", "playbook-automation", "node-drift-check"],
      description: "Compiles declarative Ansible config files, maps deployment targets, and audits server setups.",
      icon: "Activity"
    },
    {
      name: "Cluster ACS Security",
      functionName: "Container Compliance Auditing",
      agentName: "Red Hat Security Guardian (Tier 14)",
      agentId: "redhat_security_guardian",
      status: "SWARMING",
      capabilities: ["acs-compliance", "pod-vulnerabilities", "api-token-audits"],
      description: "Runs Advanced Cluster Security vulnerability scans, locks credentials access, and monitors enclaves.",
      icon: "Lock"
    }
  ],
  "Salesforce": [
    {
      name: "Core CRM Tables",
      functionName: "CRM Relational Database",
      agentName: "Salesforce DB Expert (Tier 14)",
      agentId: "salesforce_db_expert",
      status: "ACTIVE",
      capabilities: ["object-indexing", "soql-optimization", "data-loader-sync"],
      description: "Manages custom CRM object indices, SOQL query speeds, and schedules continuous data loader syncs.",
      icon: "Database"
    },
    {
      name: "Apex Serverless Run",
      functionName: "Apex Execution Runtime",
      agentName: "Salesforce Apex Specialist (Tier 14)",
      agentId: "salesforce_apex_specialist",
      status: "OPTIMIZING",
      capabilities: ["apex-triggers", "batch-apex-jobs", "concurrency-tuner"],
      description: "Coordinates backend Apex serverless triggers, asynchronous batch jobs, and tunes execution pools.",
      icon: "Cpu"
    },
    {
      name: "Salesforce Shield",
      functionName: "Field-Level Encryption Vault",
      agentName: "Salesforce Security Guardian (Tier 14)",
      agentId: "salesforce_security_guardian",
      status: "SWARMING",
      capabilities: ["field-encryption", "event-monitoring", "audit-logs-sweeps"],
      description: "Secures platform-level field encryption, reviews event log data, and runs system audit sweeps.",
      icon: "Lock"
    }
  ],
  "SAP": [
    {
      name: "HANA In-Memory DB",
      functionName: "High-Performance In-Memory DB",
      agentName: "SAP HANA DB Expert (Tier 14)",
      agentId: "sap_hana_expert",
      status: "ACTIVE",
      capabilities: ["in-memory-tuning", "columnar-indexing", "hana-snapshots"],
      description: "Optimizes HANA database in-memory buffers, columnar indexing, and schedules system snapshots.",
      icon: "Database"
    },
    {
      name: "BTP ABAP Compute",
      functionName: "Business Serverless Engine",
      agentName: "SAP BTP Compute Specialist (Tier 14)",
      agentId: "sap_btp_specialist",
      status: "OPTIMIZING",
      capabilities: ["abap-runtime", "btp-gateway", "connection-pooling"],
      description: "Coordinates Business Technology Platform (BTP) serverless engines and manages integration connections.",
      icon: "Cpu"
    },
    {
      name: "SAP Cloud Identity",
      functionName: "Secure Single Sign-On SSO",
      agentName: "SAP Security Guardian (Tier 14)",
      agentId: "sap_security_guardian",
      status: "SWARMING",
      capabilities: ["sso-federation", "user-role-vaults", "api-token-audits"],
      description: "Controls single sign-on user groups, rotates SSO credential files, and audits API keys.",
      icon: "Lock"
    }
  ],
  "Snowflake": [
    {
      name: "Micro-Partition Storage",
      functionName: "Optimized Columnar Data",
      agentName: "Snowflake Storage Expert (Tier 14)",
      agentId: "snowflake_storage_expert",
      status: "ACTIVE",
      capabilities: ["micro-partitioning", "data-clustering", "time-travel-retention"],
      description: "Coordinates micro-partition storage sets, handles columnar clustering, and regulates time-travel retention.",
      icon: "Database"
    },
    {
      name: "Virtual Warehouses",
      functionName: "High-Speed SQL SQL Engines",
      agentName: "Snowflake Warehouse Specialist (Tier 14)",
      agentId: "snowflake_warehouse_specialist",
      status: "ACTIVE",
      capabilities: ["warehouse-resizing", "concurrency-scaling", "photon-acceleration"],
      description: "Provisions SQL warehouse instances, manages auto-scaling settings, and tunes query speeds.",
      icon: "Server"
    },
    {
      name: "Snowpipe Real-Time Ingest",
      functionName: "Continuous Pipeline Ingest",
      agentName: "Snowflake Snowpipe Specialist (Tier 14)",
      agentId: "snowflake_snowpipe_specialist",
      status: "OPTIMIZING",
      capabilities: ["snowpipe-scaling", "json-file-parsing", "stage-monitoring"],
      description: "Regulates real-time Continuous Snowpipe ingestions, parses incoming JSON schemas, and monitors stages.",
      icon: "Cpu"
    },
    {
      name: "Row & Column Shield",
      functionName: "Data Masking Security",
      agentName: "Snowflake Security Guardian (Tier 14)",
      agentId: "snowflake_security_guardian",
      status: "SWARMING",
      capabilities: ["row-level-policies", "column-masking", "token-sweeps"],
      description: "Locks out unauthorized table viewers, applies dynamic column masking, and schedules key sweeps.",
      icon: "Lock"
    }
  ],
  "VMware": [
    {
      name: "vSphere ESXi Compute",
      functionName: "Enterprise Virtualization Compute",
      agentName: "VMware Hypervisor Expert (Tier 14)",
      agentId: "vmware_hypervisor_expert",
      status: "ACTIVE",
      capabilities: ["esxi-vm-scaling", "resource-scheduler", "memory-overcommit"],
      description: "Configures ESXi virtualization hypervisors, manages RAM overcommitments, and handles vMotion scheduling.",
      icon: "Server"
    },
    {
      name: "vSAN Software Storage",
      functionName: "Software-Defined Storage Pools",
      agentName: "VMware vSAN Expert (Tier 14)",
      agentId: "vmware_vsan_expert",
      status: "ACTIVE",
      capabilities: ["vsan-striping", "data-deduplication", "retention-rules"],
      description: "Coordinates distributed vSAN storage systems, schedules deduplication sweeps, and sets storage rules.",
      icon: "Database"
    },
    {
      name: "NSX Network Firewall",
      functionName: "Software-Defined Network Router",
      agentName: "VMware NSX Specialist (Tier 14)",
      agentId: "vmware_nsx_specialist",
      status: "OPTIMIZING",
      capabilities: ["nsx-firewalls", "segment-routing", "load-balancers"],
      description: "Maintains NSX logical routing layers, applies virtual firewalls, and tunes connection pools.",
      icon: "Network"
    },
    {
      name: "vRealize Telemetry APM",
      functionName: "Virtual Cluster Metrics",
      agentName: "VMware Telemetry Expert (Tier 14)",
      agentId: "vmware_telemetry_expert",
      status: "SWARMING",
      capabilities: ["vrealize-alerts", "capacity-planning", "latency-metrics"],
      description: "Tracks active host metrics, schedules capacity forecasting rules, and logs cluster warning codes.",
      icon: "Lock"
    }
  ],
  "Biznet Networks": [
    {
      name: "Biznet GIO Compute",
      functionName: "Indonesian Virtual Compute",
      agentName: "Biznet GIO Compute Expert (Tier 14)",
      agentId: "biznet_compute_expert",
      status: "ACTIVE",
      capabilities: ["gio-vms-sizing", "disk-volumes", "snapshot-backups"],
      description: "Provisions Indonesian GIO Cloud virtual servers, mounts block disks, and schedules backup snapshots.",
      icon: "Server"
    },
    {
      name: "GIO Network Gate",
      functionName: "Local Fiber-Channel Router",
      agentName: "Biznet GIO Network Specialist (Tier 14)",
      agentId: "biznet_network_expert",
      status: "OPTIMIZING",
      capabilities: ["fiber-routing", "elastic-ips", "vlan-bridges"],
      description: "Coordinates fast local fiber routing gateways, balances public IP structures, and sets up VLAN bridges.",
      icon: "Network"
    },
    {
      name: "Secure Key Enclave",
      functionName: "Key & Identity Credentials",
      agentName: "Biznet Security Guardian (Tier 14)",
      agentId: "biznet_security_guardian",
      status: "SWARMING",
      capabilities: ["key-vault-locks", "ssh-rotations", "firewall-rules"],
      description: "Defines network firewall rules, locks secure credential directories, and rotates administrator keys.",
      icon: "Lock"
    }
  ],
  "BT Cloud": [
    {
      name: "BT Compute VMs",
      functionName: "UK Hosted Virtual Compute",
      agentName: "BT Compute Expert (Tier 14)",
      agentId: "bt_compute_expert",
      status: "ACTIVE",
      capabilities: ["bt-vms", "block-storage", "snapshot-backups"],
      description: "Provisions highly reliable UK-hosted virtual machines, block volumes, and schedules snapshots.",
      icon: "Server"
    },
    {
      name: "BT Secure WAN Gateway",
      functionName: "Enterprise SD-WAN Connect",
      agentName: "BT WAN Specialist (Tier 14)",
      agentId: "bt_wan_specialist",
      status: "OPTIMIZING",
      capabilities: ["sd-wan-mesh", "vpn-tunnels", "ingress-filters"],
      description: "Configures secure SD-WAN connections, manages VPN tunnels, and monitors packet routing.",
      icon: "Network"
    },
    {
      name: "BT Identity Shield",
      functionName: "Zero-Trust Credentials Group",
      agentName: "BT Security Guardian (Tier 14)",
      agentId: "bt_security_guardian",
      status: "SWARMING",
      capabilities: ["credentials-audits", "role-policies", "firewall-rules"],
      description: "Audits credential groups, maps corporate security rules, and filters incoming port safety.",
      icon: "Lock"
    }
  ],
  "Cato Networks": [
    {
      name: "Cato SASE Compute",
      functionName: "Edge Cloud Virtual Compute",
      agentName: "Cato SASE Expert (Tier 14)",
      agentId: "cato_sase_expert",
      status: "ACTIVE",
      capabilities: ["sase-compute-nodes", "container-routing", "edge-tunnels"],
      description: "Provisions secure SASE edge microVM compute slots globally, coordinating local containers.",
      icon: "Server"
    },
    {
      name: "Cato SD-WAN Routers",
      functionName: "Distributed SD-WAN Router",
      agentName: "Cato Network Specialist (Tier 14)",
      agentId: "cato_network_specialist",
      status: "ACTIVE",
      capabilities: ["sd-wan-routing", "anycast-tunnels", "traffic-optimization"],
      description: "Directs Cato software-defined anycast networks, balancing global user data flows.",
      icon: "Network"
    },
    {
      name: "Cato Secure Gate SDP",
      functionName: "Zero-Trust Remote SDP Access",
      agentName: "Cato Security Guardian (Tier 14)",
      agentId: "cato_security_guardian",
      status: "SWARMING",
      capabilities: ["clientless-sdp", "ips-threat-filters", "api-token-checks"],
      description: "Locks secure clientless SDP remote connections, runs active IPS threat filters, and checks tokens.",
      icon: "Lock"
    }
  ],
  "CenturyLink": [
    {
      name: "CenturyLink Compute",
      functionName: "Enterprise VM Cloud Compute",
      agentName: "CenturyLink Compute Expert (Tier 14)",
      agentId: "centurylink_compute_expert",
      status: "ACTIVE",
      capabilities: ["centurylink-vms", "persistent-disk", "backup-snapshots"],
      description: "Provisions secure high-performance cloud servers, coordinates disk arrays, and runs backups.",
      icon: "Server"
    },
    {
      name: "Direct Connect WAN",
      functionName: "Direct Fiber SD-WAN Network",
      agentName: "CenturyLink Network Specialist (Tier 14)",
      agentId: "centurylink_network_specialist",
      status: "OPTIMIZING",
      capabilities: ["fiber-connect", "sd-wan-mesh", "ingress-filters"],
      description: "Manages private fiber-channel lines, interfaces SD-WAN subnets, and monitors ingress packet filters.",
      icon: "Network"
    },
    {
      name: "Key Enclave Security",
      functionName: "Zero-Trust Credentials Group",
      agentName: "CenturyLink Security Guardian (Tier 14)",
      agentId: "centurylink_security_guardian",
      status: "SWARMING",
      capabilities: ["mfa-validation", "access-token-rotations", "firewall-rules"],
      description: "Performs administrator key rotations, enforces single-sign checks, and reviews port rules.",
      icon: "Lock"
    }
  ],
  "GTS Central Europe": [
    {
      name: "GTS Compute VMs",
      functionName: "Regional Cloud Compute",
      agentName: "GTS Compute Expert (Tier 14)",
      agentId: "gts_compute_expert",
      status: "ACTIVE",
      capabilities: ["gts-vms", "storage-partitions", "backup-schedules"],
      description: "Provisions secure regional virtual servers, mounts storage blocks, and schedules backups.",
      icon: "Server"
    },
    {
      name: "GTS Network Gateway",
      functionName: "Regional Telecom Gateway",
      agentName: "GTS Network Specialist (Tier 14)",
      agentId: "gts_network_specialist",
      status: "OPTIMIZING",
      capabilities: ["telecom-routing", "vlan-bridges", "dns-failovers"],
      description: "Coordinates GTS telecom line connections, maps VLAN systems, and structures DNS failover records.",
      icon: "Network"
    },
    {
      name: "Access Enforcer Group",
      functionName: "Secure Port Firewall Groups",
      agentName: "GTS Security Guardian (Tier 14)",
      agentId: "gts_security_guardian",
      status: "SWARMING",
      capabilities: ["firewall-groups", "ssh-rotations", "ingress-filters"],
      description: "Enforces strict port firewalls, monitors secure SSH credentials, and filters ingress packet traffic.",
      icon: "Lock"
    }
  ],
  "Megaport": [
    {
      name: "MCR Cloud Router",
      functionName: "Software-Defined Multi-Cloud Router",
      agentName: "Megaport Router Specialist (Tier 14)",
      agentId: "megaport_router_specialist",
      status: "ACTIVE",
      capabilities: ["mcr-routing", "anycast-dns", "inter-cloud-sync"],
      description: "Deploys software-defined multi-cloud router connections, maps AWS/GCP routing, and check tunnels.",
      icon: "Network"
    },
    {
      name: "Megaport VXC Lines",
      functionName: "Virtual Cross Connect lines",
      agentName: "Megaport Network Expert (Tier 14)",
      agentId: "megaport_network_expert",
      status: "OPTIMIZING",
      capabilities: ["vxc-dedicated-lines", "latency-checks", "bandwidth-shaping"],
      description: "Provisions virtual dedicated direct connections, monitors path latency, and shapes port speeds.",
      icon: "Network"
    },
    {
      name: "VPC Ingress Guardian",
      functionName: "Zero-Trust Port Access Security",
      agentName: "Megaport Security Guardian (Tier 14)",
      agentId: "megaport_security_guardian",
      status: "SWARMING",
      capabilities: ["private-connection-keys", "port-firewalls", "credential-sweeps"],
      description: "Locks secure private connect keys, implements port firewall filters, and audits credentials access.",
      icon: "Lock"
    }
  ],
  "NTT Communications": [
    {
      name: "Enterprise Cloud VMs",
      functionName: "Premium VM Cloud Compute",
      agentName: "NTT Compute Expert (Tier 14)",
      agentId: "ntt_compute_expert",
      status: "ACTIVE",
      capabilities: ["premium-vms-sizing", "disk-volumes", "backup-snapshots"],
      description: "Provisions high-value Japanese enterprise cloud servers, persistent storage, and runs backups.",
      icon: "Server"
    },
    {
      name: "SDN Router Gateway",
      functionName: "NTT Private Telecom Router",
      agentName: "NTT Network Specialist (Tier 14)",
      agentId: "ntt_network_specialist",
      status: "OPTIMIZING",
      capabilities: ["telecom-vpc-routing", "dns-failovers", "ingress-filters"],
      description: "Controls software-defined telecom network routing, maps VPC pipelines, and configures failover files.",
      icon: "Network"
    },
    {
      name: "IAM Account Governance",
      functionName: "Zero-Trust Credentials Group",
      agentName: "NTT Security Guardian (Tier 14)",
      agentId: "ntt_security_guardian",
      status: "SWARMING",
      capabilities: ["iam-quota-sweeps", "token-rotations", "firewall-rules"],
      description: "Restricts sub-account access directories, schedules credential rotations, and monitors port firewalls.",
      icon: "Lock"
    }
  ],
  "T-Systems": [
    {
      name: "Sovereign Cloud Compute",
      functionName: "Sovereign GDPR-Compliant VMs",
      agentName: "T-Systems Compute Expert (Tier 14)",
      agentId: "tsystems_compute_expert",
      status: "ACTIVE",
      capabilities: ["sovereign-vms", "encrypted-disks", "snapshots-backup"],
      description: "Provisions sovereign German-hosted cloud servers, configures disk arrays, and runs backups.",
      icon: "Server"
    },
    {
      name: "OTC Kubernetes Engine",
      functionName: "Managed Sovereign Container Engine",
      agentName: "T-Systems Kubernetes Expert (Tier 14)",
      agentId: "tsystems_k8s_expert",
      status: "ACTIVE",
      capabilities: ["otc-kubernetes", "gdpr-pod-isolation", "load-balancer-sync"],
      description: "Maintains Open Telekom Cloud (OTC) Kubernetes container nodes, maps dynamic load balancer rules.",
      icon: "Cpu"
    },
    {
      name: "Sovereign Shield IAM",
      functionName: "Data Privacy Credentials Guard",
      agentName: "T-Systems Security Guardian (Tier 14)",
      agentId: "tsystems_security_guardian",
      status: "SWARMING",
      capabilities: ["sovereign-key-locks", "compliance-auditing", "port-knocking"],
      description: "Secures data privacy enclaves, schedules regulatory compliance audits, and blocks insecure ports.",
      icon: "Lock"
    }
  ],
  "Zayo": [
    {
      name: "Zayo Express WAN",
      functionName: "Dedicated Dark Fiber Network",
      agentName: "Zayo WAN Specialist (Tier 14)",
      agentId: "zayo_wan_specialist",
      status: "ACTIVE",
      capabilities: ["dark-fiber-connect", "sd-wan-mesh", "latency-checks"],
      description: "Provisions high-speed dedicated dark fiber lines, structures SD-WAN connections, and monitors latency.",
      icon: "Network"
    },
    {
      name: "Edge Compute Compute",
      functionName: "Edge Bare Metal Compute",
      agentName: "Zayo Hardware Expert (Tier 14)",
      agentId: "zayo_hardware_expert",
      status: "ACTIVE",
      capabilities: ["edge-hardware-scaling", "raid-volumes", "smart-disk-scans"],
      description: "Deploys edge physical servers close to users, handles raid storage, and sweeps disk metrics.",
      icon: "Server"
    },
    {
      name: "WAN Traffic Enforcer",
      functionName: "DDoS Mitigation Port Security",
      agentName: "Zayo Security Guardian (Tier 14)",
      agentId: "zayo_security_guardian",
      status: "SWARMING",
      capabilities: ["ddos-filtering", "access-key-sweeps", "ingress-filters"],
      description: "Mitigates incoming high-capacity L3 DDoS attacks, runs credential checks, and filters active channels.",
      icon: "Lock"
    }
  ]
};
