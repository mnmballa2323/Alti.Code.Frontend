"use client";

import React, { useState } from "react";
import { ShieldAlert, CheckCircle, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SecurityPanel() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Sentinel Section */}
      <Card className="bg-black/40 border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-red-500">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Sentinel Watchtower
            </div>
            <Badge
              className="border-red-500 text-red-500 animate-pulse"
              variant="outline"
            >
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-950/20 rounded-lg border border-red-900/30">
              <div>
                <p className="text-sm font-medium text-red-200">Threat Level</p>
                <p className="text-2xl font-bold text-white">Low</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-200">
                  Active Threats
                </p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Recent Events
              </p>
              <div className="text-sm text-gray-400 p-2 border-l-2 border-gray-700">
                No critical security events detected in the last 24h.
              </div>
            </div>

            <Button
              className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800"
              disabled={scanning}
              onClick={handleScan}
            >
              {scanning ? "Scanning System..." : "Trigger Manual Scan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Governor Section */}
      <Card className="bg-black/40 border-blue-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-500">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Governor Compliance
            </div>
            <Badge className="border-blue-500 text-blue-500" variant="outline">
              Auditing
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
                <p className="text-sm text-blue-200">Policy Score</p>
                <p className="text-2xl font-bold text-white">98/100</p>
              </div>
              <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
                <p className="text-sm text-blue-200">Licenses</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-white font-bold">Compliant</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Latest Audit
              </p>
              <div className="flex items-center justify-between text-sm p-2 bg-gray-900 rounded">
                <span className="text-gray-300">src/app/modules/auth</span>
                <span className="text-green-500">Passed</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 bg-gray-900 rounded">
                <span className="text-gray-300">package.json</span>
                <span className="text-green-500">Passed</span>
              </div>
            </div>

            <Button className="w-full bg-blue-900/50 hover:bg-blue-900 text-blue-200 border border-blue-800">
              Generate Transparency Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
