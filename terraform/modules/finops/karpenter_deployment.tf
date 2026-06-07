resource "kubernetes_manifest" "karpenter_nodepool" {
  manifest = yamldecode(file("${path.module}/karpenter_spot_provisioner.yaml"))
}

# Assume IAM Roles for Karpenter Controller are already configured elsewhere
# This configuration applies the NodePool definition to the cluster to actively 
# consolidate workloads and shift towards Spot instances.
