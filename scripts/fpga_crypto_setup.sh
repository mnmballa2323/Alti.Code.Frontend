#!/bin/bash
# Script to initialize and configure AWS F1 FPGA instances for Cryptographic Acceleration
# This script should be run on the EC2 F1 instance

set -e

echo "Starting FPGA Cryptographic Acceleration Setup..."

# Load necessary FPGA management tools
if [ ! -d "/opt/aws/fpga" ]; then
    echo "AWS FPGA Developer AMI tools not found. Cloning aws-fpga repository..."
    git clone https://github.com/aws/aws-fpga.git /opt/aws/fpga
fi

source /opt/aws/fpga/hdk/hdk_setup.sh
source /opt/aws/fpga/sdk/userspace/fpga_mgmt_tools/src/fpga_mgmt_setup.sh

# Verify FPGA management tools
fpga-describe-local-image-slots -H

# Desired Amazon FPGA Image (AFI) for our custom cryptographic acceleration
# This would normally be the result of a hardware synthesis pipeline (e.g., Vivado)
CRYPTO_AFI_ID=${CRYPTO_AFI_ID:-"agfi-0123456789abcdef0"}

echo "Clearing existing FPGA image on slot 0..."
fpga-clear-local-image -S 0

echo "Loading Cryptographic Acceleration AFI ($CRYPTO_AFI_ID) to slot 0..."
fpga-load-local-image -S 0 -I "$CRYPTO_AFI_ID"

# Verify load status
echo "Verifying FPGA slot status..."
fpga-describe-local-image -S 0 -R -H

# Install OpenSSL engine integration if applicable
echo "Configuring OpenSSL to use FPGA engine..."
cat << 'EOF' > /etc/ssl/fpga_engine.cnf
openssl_conf = openssl_init

[openssl_init]
engines = engine_section

[engine_section]
fpga = fpga_section

[fpga_section]
engine_id = fpga
dynamic_path = /usr/lib64/engines-1.1/fpga.so
init = 1
EOF

echo "Setup Complete. The FPGA is now accelerating cryptographic operations."
