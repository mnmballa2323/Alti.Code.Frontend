# Cloud Agents: Foreman & Crew Reference

The Inso.Code system utilizes 6 specialized **Cloud Foremen** managing a total of **105 Crew Specialists** (111 Agents total) to execute strict, isolated infrastructure operations.

## Cloud Provider Roster

### 1. Amazon Web Services (AWS)
- **Foreman:** AWS Foreman
- **Crew Size:** 20 Specialists
- **Specialists:** S3, EC2, EKS, Lambda, RDS, DynamoDB, VPC, IAM, CloudFront, ECS, Step Functions, SQS/SNS, Bedrock, SageMaker, CDK, Route53, ElastiCache, Kinesis, CodePipeline, CloudWatch

### 2. Google Cloud Platform (GCP)
- **Foreman:** GCP Foreman
- **Crew Size:** 20 Specialists
- **Specialists:** GKE, Cloud Run, BigQuery, Vertex AI, Spanner, Cloud SQL, Cloud Storage, Pub/Sub, Compute Engine, Cloud Functions, VPC Networking, IAM, Firestore, Cloud Build, Cloud Armor, Cloud CDN, Bigtable, Cloud Logging, Artifact Registry, Secret Manager

### 3. Microsoft Azure
- **Foreman:** Azure Foreman
- **Crew Size:** 20 Specialists
- **Specialists:** Blob Storage, AKS, Functions, SQL, Cosmos DB, OpenAI, App Service, DevOps, VNet, Entra ID, Key Vault, Monitor, Front Door, Service Bus, Container Apps, AI Search, Firewall, Redis Cache, Virtual Machines, Synapse

### 4. Alibaba Cloud
- **Foreman:** Alibaba Foreman
- **Crew Size:** 15 Specialists
- **Specialists:** ECS, ACK, Function Compute, OSS, RDS, PolarDB, MaxCompute, SLB, VPC/CEN, RAM, Log Service, CDN/DCDN, PAI, AnalyticDB, DataWorks

### 5. Oracle Cloud
- **Foreman:** Oracle Foreman
- **Crew Size:** 15 Specialists
- **Specialists:** OKE, Autonomous DB, Compute, Object Storage, VCN, Functions, MySQL HeatWave, NoSQL, DevOps, Cloud Guard, Vault, Monitoring, Resource Manager, FastConnect, AI Services

### 6. IBM Cloud
- **Foreman:** IBM Foreman
- **Crew Size:** 15 Specialists
- **Specialists:** IKS, OpenShift, Code Engine, VPC, COS, Databases, watsonx.ai, watsonx.data, Key Protect, Schematics, Monitoring, CIS, Transit Gateway, Secrets Manager, Security & Compliance

## Service Coverage Comparison Matrix

| Service Type | AWS | GCP | Azure | Alibaba | Oracle | IBM |
|--------------|-----|-----|-------|---------|--------|-----|
| **Compute** | EC2 | Compute Engine | Virtual Machines | ECS | Compute | VPC |
| **Containers** | EKS, ECS | GKE, Cloud Run | AKS, Container Apps | ACK | OKE | IKS, OpenShift, Code Engine |
| **Storage** | S3 | Cloud Storage | Blob Storage | OSS | Object Storage | COS |
| **Relational DB** | RDS | Cloud SQL, Spanner | SQL | RDS, PolarDB | Autonomous DB | Databases |
| **NoSQL** | DynamoDB | Firestore, Bigtable | Cosmos DB | AnalyticDB | NoSQL | Databases |
| **Serverless** | Lambda | Cloud Functions | Functions | Function Compute | Functions | Code Engine |
| **Networking** | VPC, Route53 | VPC Networking | VNet | VPC/CEN | VCN, FastConnect| Transit Gateway |
| **AI / ML** | Bedrock, SageMaker| Vertex AI | OpenAI, AI Search| PAI | AI Services | watsonx.ai, watsonx.data |
| **IAM / Sec** | IAM | IAM, Secret Mgr | Entra ID, Key Vault| RAM | Cloud Guard, Vault | Key Protect, Secrets Mgr |

## Routing Examples

The Foreman strictly outputs routing tokens when determining which specialist to invoke.

**User Prompt:** "Can you help me configure an S3 bucket with versioning and KMS encryption?"
**AWS Foreman Output:** `[ROUTE_TO: s3-expert]`

**User Prompt:** "Deploy a containerized API on Google Kubernetes Engine with Cloud Armor."
**GCP Foreman Output:** `[ROUTE_TO: gke-expert]` (Once GKE is complete, it may loop and yield `[ROUTE_TO: cloud-armor-expert]`)

**User Prompt:** "I need to setup Cosmos DB global distribution."
**Azure Foreman Output:** `[ROUTE_TO: cosmosdb-expert]`
