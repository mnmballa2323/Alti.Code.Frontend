# HashiCorp Vault Server Configuration
# Integrating the AWS F1 FPGA Cryptographic Accelerator as a hardware entropy source
# and backing for the Transit Secrets Engine

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 0
  tls_cert_file = "/vault/userconfig/vault-tls/tls.crt"
  tls_key_file  = "/vault/userconfig/vault-tls/tls.key"
}

storage "raft" {
  path    = "/vault/data"
  node_id = "vault-node-1"
}

# The seal configuration determines how Vault unwraps its master key.
# Typically this is AWS KMS. In our architecture, we use the FPGA cluster 
# exposed via the XKS proxy established in Cycle 48.
seal "awskms" {
  region     = "us-east-1"
  kms_key_id = "alias/fpga-master-key" # This KMS alias points to our Custom Key Store (CKS) backed by the FPGA
  endpoint   = "https://kms.us-east-1.amazonaws.com"
}

# Configure Vault to draw cryptographic entropy directly from the FPGA
# This provides True Random Number Generation (TRNG) sourced from physical silicon noise,
# which is vastly superior to the Linux pseudo-random /dev/urandom for cryptographic keys.
entropy "external" {
  # We expose a TRNG API endpoint on the fpga-crypto-svc
  url = "https://crypto-accelerator-svc.security.svc.cluster.local:8443/api/v1/entropy"
  # Require 256 bits of hardware entropy for Vault operations
  minimum_bytes = 32
  mode = "require"
}

ui = true
disable_mlock = true

# Telemetry configuration for the Prometheus Operator
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}
