"use client";
import React from "react";

import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { GoogleCloudIcon } from "@/components/CloudIcons";

export default function GoogleCloudDashboard() {
  return (
    <CloudProviderDashboard
      accentColorHex="#EA4335"
      mockCost="$430.00"
      mockInstances={12}
      mockUptime="100.00%"
      providerIcon={GoogleCloudIcon}
      providerName="Google Cloud Platform"
      themeColorClass="red-500"
    />
  );
}
