import React from "react";
import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { AzureIcon } from "@/components/CloudIcons";

export default function AzureDashboard() {
  return (
    <CloudProviderDashboard 
      providerName="Microsoft Azure"
      providerIcon={AzureIcon}
      themeColorClass="blue-600"
      accentColorHex="#0078D4"
      mockInstances={56}
      mockCost="$1,830.50"
      mockUptime="99.95%"
    />
  );
}
