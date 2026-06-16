"use client";
import React from "react";

import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { AwsIcon } from "@/components/CloudIcons";

export default function AWSDashboard() {
  return (
    <CloudProviderDashboard
      accentColorHex="#FF9900"
      mockCost="$4,250.00"
      mockInstances={142}
      mockUptime="99.99%"
      providerIcon={AwsIcon}
      providerName="Amazon Web Services"
      themeColorClass="orange-500"
    />
  );
}
