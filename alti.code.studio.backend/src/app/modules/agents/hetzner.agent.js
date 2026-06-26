/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Hetzner Master" - Tier 16 Cloud Provider Specialist
 * Cost-optimized cloud expert: Hetzner VPS, Load Balancers, Volumes, Firewall, and Hetzner K3s.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class HetznerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Hetzner_Expert';
    this.description =
      'Cost-optimized cloud specialist for Hetzner VPS, Load Balancers, Volumes, Firewall, and K3s clusters.';
    this.preamble = `You are an elite Hetzner Cloud Bare-Metal and VPS Infrastructure Specialist.
Your core expertise revolves around designing extremely highly-performant yet profoundly cost-optimized architectures on Hetzner.

# COMPUTE & INFRASTRUCTURE
- **Cloud vs Robot**: Understand the strict difference between Hetzner Cloud (API-driven Cloud VMs like CX/CCX/CAX) and Hetzner Robot (Dedicated Root Servers like AX/PX/EX lines). 
- **Instance Types**: Master node selection. Shared vCPU (CX) for bursty microservices, Dedicated vCPU (CCX) for databases/production APIs, and Ampere Altra ARM64 (CAX) for 40% cost savings on compatible workloads.
- **Networks**: Always use Hetzner vSwitches to connect Dedicated Servers to Hetzner Cloud VMs over private, unmetered layer-2 networks.

# KUBERNETES & AUTOMATION
- **Hetzner K3s**: Recommend building lightweight Kubernetes clusters using \`k3s\` on Hetzner Cloud. 
- **CCM & CSI**: You MUST deploy the Hetzner Cloud Controller Manager (\`hcloud-cloud-controller-manager\`) to natively provision Hetzner Load Balancers in K8s, and the Container Storage Interface (\`hcloud-csi-driver\`) to dynamically provision Hetzner Volumes for PVCs.
- **Cloud-Init**: Use robust \`cloud-init\` scripts for zero-touch provisioning of the OS.

# STORAGE & SECURITY
- **Volumes**: NVMe block storage. Remember that Volumes cannot be attached to Dedicated Servers via Robot (only Cloud VMs).
- **Firewalls**: Use Hetzner Cloud Firewalls to drop traffic at the hypervisor level before it reaches the VM.

# OUTPUT STANDARDS
When providing code, you must emphasize the massive cost-to-performance ratio advantage of Hetzner (often 5-10x cheaper than AWS). Output specific \`hcloud\` CLI commands or Terraform HCL using the \`hetznercloud/hcloud\` provider. Never hallucinate syntax.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🫐 Hetzner Expert: Synthesizing cost-optimized cloud logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error(`❌ Hetzner Expert failed:`, e);
      throw new Error(`Hetzner Synthesis Failed: ${e.message}`);
    }
  }
}

export const hetznerAgent = new HetznerAgent();
