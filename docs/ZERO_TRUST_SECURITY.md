# Zero Trust DevSecOps & Hardening

As of **v8.0.0**, the Inso.Code platform abandoned perimeter-based security in favor of a mathematically rigorous **Zero Trust** architecture running within the Kubernetes Swarm.

---

## 1. Anthos Service Mesh (mTLS)

Traffic between all microservices—whether it is the Scraper sending results to the Backend, or the Backend requesting vectors from PentAGI—is encrypted over **Mutual TLS (mTLS)**.

We utilize Google's **Anthos Service Mesh (ASM)** (a managed iteration of Istio) provisioned via Terraform.

### The Cryptographic Guarantee
No workload can connect to another without presenting a cryptographically signed identity certificate. This entirely eliminates lateral movement risks. If an attacker breaches the isolated Scraper pod via a zero-day browser vulnerability, they cannot execute a secondary lateral attack against the Backend without possessing the Backend's explicit mTLS signing key.

---

## 2. Default-Deny Network Policies

All namespaces operate under a strict **Default-Deny** Kubernetes `NetworkPolicy`. 
Every port, and every IP range is mathematically blocked by default. 

### Explicit Whitelists
We punch exact holes in the policy to allow known-good traffic:
1. **GCLB Health Checks**: The `allow-ingress-to-frontend` policy only allows incoming TCP:3000 requests originating from Google's exact Load Balancer subnets (`130.211.0.0/22` and `35.191.0.0/16`).
2. **Frontend-to-Backend**: The `allow-frontend-to-backend` policy permits TCP:5000 egress only from pods labeled `app: alti-frontend`.

See `k8s/security/network-policies.yaml` for the live implementation.

---

## 3. Kyverno Admission Validation Webhooks

Malicious internal actors, or compromised developer laptops, might try to apply raw YAML directly to the cluster. We block unauthorized workloads before they ever touch the Kubernetes API server using **Kyverno Validating Admission Webhooks**.

### Enforced Policies
1. **Block 'latest' Tags**: The `require-specific-image-tags` policy prevents ANY deployment using the `:latest` Docker tag. All images must be pinned to explicit, immutable Git SHAs.
2. **Trusted Registries Only**: The `restrict-image-registries` policy instantly rejects any deployment trying to pull images from Docker Hub or unknown sources. All Swarm images must be hosted safely inside our private `us-central1-docker.pkg.dev` Artifact Registry.

See `k8s/security/admission-control.yaml` for the live rules definitions.
