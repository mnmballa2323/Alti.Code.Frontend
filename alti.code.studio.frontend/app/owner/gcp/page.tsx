"use client";
import React from "react";

import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { GoogleIcon } from "@/components/CloudIcons";

export default function GcpDashboard() {
  return (
    <CloudProviderDashboard
      accentColorHex="#4285F4"
      mockCost="$3,240.80"
      mockInstances={142}
      mockUptime="99.99%"
      providerIcon={GoogleIcon}
      providerName="Google Cloud Platform"
      themeColorClass="blue-500"
    />
  );
}
