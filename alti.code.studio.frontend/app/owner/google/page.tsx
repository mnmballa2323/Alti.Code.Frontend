import React from "react";
import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { GoogleCloudIcon } from "@/components/CloudIcons";

export default function GoogleCloudDashboard() {
  return (
    <CloudProviderDashboard 
      providerName="Google Cloud Platform"
      providerIcon={GoogleCloudIcon}
      themeColorClass="red-500"
      accentColorHex="#EA4335"
      mockInstances={12}
      mockCost="$430.00"
      mockUptime="100.00%"
    />
  );
}
