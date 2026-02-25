# Enterprise Infrastructure

As of **v8.1.0**, Alti.Code.Studio is deployed natively on **Google Cloud Platform (GCP)** using a highly available, declarative infrastructure stack defined in Terraform, with continuous deployment managed via **ArgoCD (GitOps)**.

This document serves as a guide for platform engineers managing the production deployment.

---

## 🏗️ Architecture Overview

The system is split into two halves:
1. **Terraform (`/terraform`)**: Provisions the raw cloud primitives (Multi-Region Clusters, Databases, IAM, OIDC).
2. **Kubernetes (`/k8s`)**: Provisions the application workloads, service mesh, and zero-trust policies via ArgoCD.

### 1. The Terraform Modules

```text
terraform/
├── main.tf
├── variables.tf
└── modules/
    ├── gke_multi_region/ # Global GKE Autopilot Fleet (US, EU, APAC)
    ├── database/         # Cloud SQL (PostgreSQL), Memorystore (Redis), MongoDB Atlas
    ├── secrets/          # GCP Secret Manager
    ├── workload_identity/# GitHub Actions OIDC Auth
    ├── asm/              # Anthos Service Mesh (Managed Istio)
    └── observability/    # BigQuery FinOps and Pub/Sub SIEM Log Sinks
```

- **Global GKE Fleet**: We use multi-region GKE Autopilot clusters to eliminate node management overhead and provide regional disaster recovery.
- **Cross-Region Databases**: Cloud SQL and MongoDB are configured with cross-region read replicas.
- **Workload Identity**: GitHub Actions authenticates natively via ephemeral JWTs—no static `.env` keys.

### 2. The Kubernetes Manifests (GitOps Managed)

```text
k8s/
├── backend.yaml        # Node.js Express + Agents (HPA: 3-30 replicas)
├── frontend.yaml       # Next.js Dashboard (HPA: 3-15 replicas)
├── services.yaml       # PentAGI, Scraper, and FossFLOW deployments
├── argocd/             # The Root App of Apps manifest
├── multi_region/       # MultiClusterIngress and Global Load Balancing
├── observability/      # Managed Prometheus PodMonitoring
└── security/           # Default-Deny Network Policies and Kyverno Admission
```

- **GitOps Continuous Deployment**: ArgoCD runs inside the default cluster, watching the `k8s/` folder on GitHub and syncing state automatically.
- **Global Load Balancing**: `MultiClusterIngress` creates an L7 external HTTP/S load balancer that routes traffic globally.
- **Zero Trust Security**: See `docs/ZERO_TRUST_SECURITY.md` for details on ASM, Kyverno, and Network Policies.

---

## 🚀 Deployment Guide

### Prerequisites
- GCP Project with billing enabled
- `gcloud` CLI authenticated (`gcloud auth login`)
- Terraform >= 1.5.0 installed
- MongoDB Atlas API Keys

### Step 1: Provision Infrastructure (Terraform)
1. Navigate to the terraform directory: `cd terraform`
2. Initialize providers: `terraform init`
3. Plan and apply:
   ```bash
   terraform apply \
     -var="project_id=your-gcp-project" \
     -var="environment=prod" \
     -var="github_repository=yourorg/yourrepo" \
     -var="atlas_public_key=..." \
     -var="atlas_private_key=..." \
     -var="stripe_secret_key=..." \
     -var="stripe_webhook_secret_key=..."
   ```

### Step 2: Bootstrap GitOps (ArgoCD)
Instead of applying manifests manually, we seed the cluster with ArgoCD:
1. Fetch cluster credentials for the primary cluster:
   ```bash
   gcloud container clusters get-credentials alti-gke-prod-primary --region us-central1
   ```
2. Install ArgoCD:
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
3. Apply the root application:
   ```bash
   kubectl apply -f ../k8s/argocd/application.yaml
   ```

From this point forward, all code pushed to the `main` branch is validated and subsequently deployed autonomously by ArgoCD.
