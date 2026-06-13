#!/bin/bash
# Copyright (c) 2026 Alti.Code.Studio
#
# Automated SBOM (Software Bill of Materials) and Vulnerability Scan Generator.
# Required for Enterprise Procurement (Gov/Defense/Healthcare).

set -e

OUTPUT_DIR="./sbom-reports"
mkdir -p "$OUTPUT_DIR"

echo "[SBOM] Generating CycloneDX SBOM using Syft..."
# Use Syft to generate a comprehensive SBOM of the current directory/image
# Assuming running against the local directory or Docker image if passed as an argument.
TARGET=${1:-"dir:."}

if command -v syft &> /dev/null; then
    syft "$TARGET" -o cyclonedx-json > "$OUTPUT_DIR/sbom.cyclonedx.json"
    syft "$TARGET" -o spdx-json > "$OUTPUT_DIR/sbom.spdx.json"
    echo "✅ [SBOM] SBOM generation complete. Saved to $OUTPUT_DIR/"
else
    echo "⚠️ [SBOM] 'syft' not found. Please install syft: curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin"
fi

echo "[VULN] Scanning for vulnerabilities using Trivy..."
if command -v trivy &> /dev/null; then
    # Generate JSON report for SIEM ingestion
    trivy fs "$TARGET" --format json --output "$OUTPUT_DIR/trivy-report.json"
    # Generate human-readable table report
    trivy fs "$TARGET" --severity HIGH,CRITICAL > "$OUTPUT_DIR/trivy-report.txt"
    echo "✅ [VULN] Vulnerability scan complete. Saved to $OUTPUT_DIR/"
else
    echo "⚠️ [VULN] 'trivy' not found. Please install trivy: brew install aquasecurity/trivy/trivy (or curl installer)"
fi

echo "=========================================================="
echo " SBOM and vulnerability reports are ready for compliance."
echo " Submit these files to your procurement or audit team."
echo "=========================================================="
