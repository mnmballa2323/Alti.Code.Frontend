"use client";
import React from "react";

import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { AzureIcon } from "@/components/CloudIcons";

export default function AzureDashboard() {
  return (
    <CloudProviderDashboard
      accentColorHex="#0078D4"
      mockCost="$1,830.50"
      mockInstances={56}
      mockUptime="99.95%"
      providerIcon={AzureIcon}
      providerName="Microsoft Azure"
      themeColorClass="blue-600"
    />
  );
}
