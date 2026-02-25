# Enterprise Infrastructure

As of **v7.3.0**, Alti.Code.Studio is deployed natively on **Google Cloud Platform (GCP)** using a highly available, declarative infrastructure stack defined in Terraform and Kubernetes.

This document serves as a guide for platform engineers managing the production deployment.

---

## 🏗️ Architecture Overview

The system is split into two halves:
1. **Terraform (`/terraform`)**: Provisions the raw cloud primitives (Clusters, Databases, IAM).
2. **Kubernetes (`/k8s`)**: Provisions the application workloads and networking layer on top of the cluster.

### 1. The Terraform Modules

```text
terraform/
├── main.tf
├── variables.tf
└── modules/
    ├── gke/       # Google Kubernetes Engine (Autopilot)
    ├── database/  # Cloud SQL (PostgreSQL), Memorystore (Redis), MongoDB Atlas
    └── secrets/   # GCP Secret Manager
```

- **GKE Autopilot**: We use GKE Autopilot to eliminate node management overhead. Nodes scale dynamically based on the requested CPU/RAM of the pods. The cluster is configured as a *Private Cluster*, meaning worker nodes do not have public IP addresses.
- **Managed Databases**: We rely on Cloud SQL for PostgreSQL, Memorystore for Redis, and MongoDB Atlas to guarantee 99.99% availability and automated point-in-time recovery.
- **Secret Manager**: Production secrets are injected dynamically into the cluster. Never commit `.env` files to production.

### 2. The Kubernetes Manifests

```text
k8s/
├── backend.yaml   # Node.js Express + Agents (HPA: 3-30 replicas)
├── frontend.yaml  # Next.js Dashboard (HPA: 3-15 replicas)
├── services.yaml  # PentAGI, Scraper, and FossFLOW deployments
└── ingress.yaml   # GCLB Ingress + Managed Certificate + Cloud Armor
```

- **Cloud Load Balancing**: The `ingress.yaml` creates an L7 external HTTP/S load balancer.
- **Cloud Armor**: The `FrontendConfig` custom resource attaches a Cloud Armor WAF policy to mitigate DDoS attacks.
- **Autoscaling**: `HorizontalPodAutoscaler` limits ensure the Swarm has enough compute during massive code generation sprints while scaling down to save costs.

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
     -var="atlas_public_key=..." \
     -var="atlas_private_key=..." \
     -var="stripe_secret_key=..." \
     -var="stripe_webhook_secret_key=..."
   ```
4. *Important*: Note the output variables, specifically the database connection strings.

### Step 2: Deploy Workloads (Kubernetes)
1. Fetch cluster credentials:
   ```bash
   gcloud container clusters get-credentials alti-code-studio-gke-prod --region us-central1
   ```
2. Apply the manifests:
   ```bash
   cd ../k8s
   kubectl apply -f .
   ```
3. Watch the rollout:
   ```bash
   kubectl get pods -w
   kubectl get hpa
   kubectl get ingress
   ```

*(Wait approximately 15 minutes for the Google-managed SSL certificate to provision and turn generic `HTTP(S)` to `Active`.)*
