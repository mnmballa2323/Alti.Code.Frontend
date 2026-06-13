"use client";
import React from "react";
import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { LibertyIcon } from "@/components/CloudIcons";

export default function LibertyDashboard() {
  return (
    <CloudProviderDashboard 
      providerName="Liberty Center One"
      providerIcon={LibertyIcon}
      themeColorClass="teal-600"
      accentColorHex="#007DA5"
      mockInstances={8}
      mockCost="$1,200.00"
      mockUptime="99.98%"
    />
  );
}
