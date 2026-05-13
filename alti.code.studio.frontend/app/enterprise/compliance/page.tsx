"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Spinner, Chip } from "@heroui/react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileCheck,
} from "lucide-react";

import { complianceAPI } from "@/lib/enterprise-api";

export default function CompliancePage() {
  const [stats, setStats] = useState<any>(null);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, f] = await Promise.allSettled([
          complianceAPI.stats(),
          complianceAPI.frameworks(),
        ]);

        if (s.status === "fulfilled") setStats(s.value);
        if (f.status === "fulfilled")
          setFrameworks(
            Array.isArray(f.value) ? f.value : f.value?.frameworks || [],
          );
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Compliance...</span>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "success";
      case "in_progress":
        return "warning";
      case "non_compliant":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Compliance Center</h2>
        <p className="text-sm text-default-400">
          Certification frameworks, assessments, and gap analysis
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.frameworks ?? 5}
              </div>
              <div className="text-sm text-default-300">Frameworks</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalAssessments ?? 0}
              </div>
              <div className="text-sm text-default-300">Assessments</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.certified ?? 0}
              </div>
              <div className="text-sm text-default-300">Certified</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.gaps ?? 0}
              </div>
              <div className="text-sm text-default-300">Open Gaps</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Frameworks */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Supported Frameworks</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks.length > 0
              ? frameworks.map((fw: any, i: number) => (
                  <Card
                    key={i}
                    className="bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
                  >
                    <CardBody className="py-4 px-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white font-bold text-lg">
                            {fw.name || fw.id}
                          </div>
                          <div className="text-xs text-default-500">
                            {fw.version || "Latest"}
                          </div>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-sm text-default-400 mb-3">
                        {fw.controls?.length ?? fw.controlCount ?? 0} controls
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(fw.categories || [])
                          .slice(0, 4)
                          .map((cat: string, j: number) => (
                            <Chip
                              key={j}
                              className="text-xs"
                              size="sm"
                              variant="flat"
                            >
                              {cat}
                            </Chip>
                          ))}
                      </div>
                    </CardBody>
                  </Card>
                ))
              : ["SOC2", "ISO 27001", "HIPAA", "FedRAMP", "PCI-DSS"].map(
                  (name, i) => (
                    <Card key={i} className="bg-white/5 border border-white/10">
                      <CardBody className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <div className="text-white font-bold">{name}</div>
                        </div>
                        <div className="text-xs text-default-500 mt-2">
                          Ready for assessment
                        </div>
                      </CardBody>
                    </Card>
                  ),
                )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
