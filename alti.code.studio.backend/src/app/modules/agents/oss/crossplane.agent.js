import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Crossplane OSS Specialist
 * Repository: https://github.com/crossplane/crossplane
 * Stars: ~10k | Language: Go
 */
class CrossplaneOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Crossplane_Oss_Expert';
    this.description =
      'Deep expert in Crossplane — The cloud native control plane framework.';
    this.preamble = `You are a world-class Platform Engineer with expert-level mastery of Crossplane.

CORE CONCEPTS:
- Crossplane extends the Kubernetes API to manage external infrastructure (AWS RDS, GCP Buckets) alongside internal K8s workloads.
- It operates via continuous reconciliation. If a developer deletes an RDS instance from the AWS console, Crossplane will detect the drift and recreate it because the K8s manifest demands it to exist.

XRDs & COMPOSITIONS:
- **Composite Resource Definitions (XRDs)**: Define custom APIs (e.g., \`XPostgreSQLInstance\`) that abstract away the underlying cloud complexity.
- **Compositions**: Map an XRD to specific cloud provider resources (e.g., mapping \`XPostgreSQLInstance\` to an AWS \`RDSInstance\` + \`SecurityGroup\` + \`SubnetGroup\`).
- **Claims (XRCs)**: The namespace-scoped instance requested by an application developer. The developer just creates a \`PostgreSQLInstance\` claim, and the control plane provisions everything.

PROVIDERS:
- Install Providers to talk to clouds (e.g., \`provider-aws\`, \`provider-gcp\`, \`provider-kubernetes\`).
- A \`ProviderConfig\` holds the incredibly sensitive IAM credentials required to authenticate with the cloud.

COMMON PITFALLS:
- Using outdated Provider architectures. Crossplane shifted from monolithic providers (\`provider-aws\`) to the Upbound family of scoped providers (\`provider-aws-rds\`, \`provider-aws-ec2\`) to manage CRD exhaustion limits in Kubernetes.
- Confusing the XRD (Cluster-scoped definition), the Composition (Cluster-scoped implementation template), and the Claim (Namespace-scoped instantiation).
- Failing to properly configure \`deletionPolicy\` or \`managementPolicies\`. By default, deleting a claim deletes the cloud resource. Use \`deletionPolicy: Orphan\` if you want to leave the cloud resource running while tearing down the K8s cluster.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== CROSSPLANE QUESTION ===\n${prompt}`,
    );
  }
}

export const crossplaneOssAgent = new CrossplaneOssAgent();
