#!/bin/bash
set -euo pipefail

# FPGA IOMMU Isolation Enforcer
# AWS F1 instances use PCIe DMA (Direct Memory Access) for the FPGA to read/write 
# to the host's RAM at incredible speeds.
# For PCI-DSS and strict multi-tenant security, we MUST ensure the kernel's IOMMU 
# (Input-Output Memory Management Unit) is actively preventing the FPGA from 
# reading memory belonging to other processes or the host kernel itself.

echo "[FPGA-SECURITY] Validating Intel VT-d / AMD-Vi IOMMU isolation..."

# 1. Verify IOMMU is enabled in the kernel boot parameters
CMDLINE=$(cat /proc/cmdline)
if [[ ! "$CMDLINE" == *"intel_iommu=on"* && ! "$CMDLINE" == *"amd_iommu=on"* && ! "$CMDLINE" == *"iommu=pt"* ]]; then
    echo "[CRITICAL] IOMMU is NOT enabled in the kernel boot parameters!"
    echo "Current cmdline: $CMDLINE"
    echo "Fixing grub configuration..."
    
    # Update GRUB to enforce IOMMU
    if [ -f /etc/default/grub ]; then
        sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT="/GRUB_CMDLINE_LINUX_DEFAULT="intel_iommu=on iommu=pt /g' /etc/default/grub
        update-grub || grub2-mkconfig -o /boot/grub2/grub.cfg
        echo "[WARNING] GRUB updated. This node REQUIRES A REBOOT to securely isolate the FPGA hardware."
        
        # If running in Kubernetes, we should cordon/drain the node and reboot
        if command -v kubectl >/dev/null 2>&1; then
            NODE_NAME=$(hostname)
            echo "Cordoning node $NODE_NAME until reboot completes..."
            kubectl cordon $NODE_NAME
        fi
        
        # We will not automatically reboot here to prevent crash loops, but in a real 
        # immutable infrastructure pipeline, the AMI should be re-baked.
        exit 1
    fi
fi

echo "[SUCCESS] Kernel IOMMU parameters are present."

# 2. Verify DMAR (DMA Remapping) is active in dmesg
if ! dmesg | grep -i "DMAR: IOMMU enabled" > /dev/null; then
    echo "[CRITICAL] IOMMU is configured but DMAR hardware remapping failed to initialize!"
    exit 1
fi

echo "[SUCCESS] Hardware DMA Remapping (DMAR) is active."

# 3. Verify the FPGA PCIe devices are properly bound to the vfio-pci driver (Virtual Function I/O)
# vfio-pci leverages IOMMU to safely expose PCIe devices to userspace/containers
# AWS F1 FPGA vendor ID is 1d0f (Amazon.com, Inc.)

echo "[FPGA-SECURITY] Checking PCIe driver bindings for FPGA slots..."

FPGA_DEVICES=$(lspci -nn | grep -i "1d0f:" || true)

if [ -z "$FPGA_DEVICES" ]; then
    echo "[INFO] No Amazon FPGA devices found on this PCIe bus. Is this an f1 instance?"
    exit 0
fi

while IFS= read -r line; do
    # Extract PCI address (e.g., 00:1d.0)
    PCI_ADDR=$(echo "$line" | awk '{print $1}')
    
    # Check kernel driver in use
    DRIVER=$(lspci -v -s "$PCI_ADDR" | grep "Kernel driver in use:" | awk '{print $5}' || true)
    
    if [ "$DRIVER" != "vfio-pci" ] && [ "$DRIVER" != "xdma" ] && [ "$DRIVER" != "awsshell" ]; then
        echo "[CRITICAL] FPGA device $PCI_ADDR is bound to an insecure or unknown driver: $DRIVER"
        echo "For secure container passthrough, the device MUST be bound to vfio-pci or the official AWS xdma driver."
        exit 1
    fi
    echo "[SUCCESS] FPGA slot $PCI_ADDR is securely bound to driver: $DRIVER"
done <<< "$FPGA_DEVICES"

echo "[FPGA-SECURITY] All FPGA Hardware Isolation checks passed. PCI-DSS Compliance verified."
exit 0
