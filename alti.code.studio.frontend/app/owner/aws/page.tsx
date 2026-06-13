import React from "react";
import CloudProviderDashboard from "@/components/CloudProviderDashboard";
import { AwsIcon } from "@/components/CloudIcons";

export default function AWSDashboard() {
  return (
    <CloudProviderDashboard 
      providerName="Amazon Web Services"
      providerIcon={AwsIcon}
      themeColorClass="orange-500"
      accentColorHex="#FF9900"
      mockInstances={142}
      mockCost="$4,250.00"
      mockUptime="99.99%"
    />
  );
}
