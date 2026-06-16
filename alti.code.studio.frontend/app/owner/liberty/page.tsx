"use client";
import React from "react";

import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { LibertyIcon } from "@/components/CloudIcons";

export default function LibertyDashboard() {
  return (
    <CloudProviderDashboard
      accentColorHex="#007DA5"
      mockCost="$1,200.00"
      mockInstances={8}
      mockUptime="99.98%"
      providerIcon={LibertyIcon}
      providerName="Liberty Center One"
      themeColorClass="teal-600"
    />
  );
}
