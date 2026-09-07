"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Progress,
  Divider,
  Input,
  Chip,
} from "@heroui/react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

import { API_URL } from "@/lib/config";

interface VulnCounts {
  critical: number;
  high: number;
  moderate: number;
  low: number;
}

interface CodeCompliance {
  violations: string[];
}

interface SecurityReport {
  status: "CLEAN" | "THREATS_DETECTED";
  vulnerabilities: VulnCounts;
  compliance: CodeCompliance;
  timestamp: string;
}

const SecurityAdviser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [repoPath, setRepoPath] = useState("");

  const runAudit = async () => {
    if (!repoPath.trim()) {
      toast.error("Please enter a repository path.");

      return;
    }

    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const response = await axios.post(
        `${API_URL}/sentinel/scan`,
        { repoPath: repoPath.trim() },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "x-device-posture-valid": "true",
          },
        },
      );

      if (response.data.success) {
        setReport(response.data.data);
        toast.success("Sentinel Scan Complete");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Sentinel Scan Failed";

      console.error("Audit failed", error);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!report) return 100;
    let penalty = 0;

    penalty += (report.vulnerabilities?.critical || 0) * 15;
    penalty += (report.vulnerabilities?.high || 0) * 10;
    penalty += (report.vulnerabilities?.moderate || 0) * 5;
    penalty += (report.vulnerabilities?.low || 0) * 2;
    penalty += (report.compliance?.violations?.length || 0) * 5;

    return Math.max(0, 100 - penalty);
  };

  const getScoreColor = (score: number): "success" | "warning" | "danger" => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";

    return "danger";
  };

  const dynamicScore = calculateScore();
  const vulns = report?.vulnerabilities;
  const violations = report?.compliance?.violations || [];

  return (
    <Card className="w-full max-w-lg shadow-xl shadow-blue-900/10 border border-blue-900/20 bg-default-100/50 backdrop-blur-md">
      <CardHeader className="flex gap-3 pb-2">
        <FaShieldAlt className="text-2xl text-blue-500" />
        <div className="flex flex-col">
          <p className="text-md font-bold text-gray-100">Security Adviser</p>
          <p className="text-xs text-blue-400 font-mono tracking-tight uppercase">
            Powered by The Sentinel
          </p>
        </div>
      </CardHeader>

      <Divider className="opacity-50" />

      <CardBody className="space-y-6 pt-6">
        <Input
          description="Absolute path to the project root to audit."
          label="Repository Path"
          placeholder="/absolute/path/to/project"
          size="sm"
          value={repoPath}
          variant="faded"
          onValueChange={setRepoPath}
        />

        {!report && (
          <div className="flex justify-center mt-2">
            <Button
              className="w-full font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40"
              isLoading={loading}
              onPress={runAudit}
            >
              Initiate Sentinel Scan
            </Button>
          </div>
        )}

        {report && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Score */}
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-sm tracking-widest uppercase text-gray-400">
                Security Score
              </span>
              <span
                className={`text-3xl font-black text-${getScoreColor(dynamicScore)}-500 drop-shadow-md`}
              >
                {dynamicScore}
                <span className="text-lg text-gray-600">/100</span>
              </span>
            </div>

            <Progress
              className="h-2"
              color={getScoreColor(dynamicScore)}
              value={dynamicScore}
            />

            {/* Status Chip */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                SYSTEM STATUS
              </span>
              <Chip
                color={report.status === "CLEAN" ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {report.status}
              </Chip>
            </div>

            {/* Vuln grid */}
            {vulns && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs mt-6">
                {(["critical", "high", "moderate", "low"] as const).map(
                  (sev) => {
                    const colors: Record<string, string> = {
                      critical: "bg-red-900/20 text-red-500 border-red-900/50",
                      high: "bg-orange-900/20 text-orange-500 border-orange-900/50",
                      moderate:
                        "bg-yellow-900/20 text-yellow-500 border-yellow-900/50",
                      low: "bg-blue-900/20 text-blue-400 border-blue-900/50",
                    };

                    return (
                      <div
                        key={sev}
                        className={`${colors[sev]} p-2 rounded-lg border font-mono`}
                      >
                        <div className="font-black text-lg">
                          {vulns[sev] || 0}
                        </div>
                        <div className="text-[10px] tracking-widest opacity-80">
                          {sev.slice(0, 4).toUpperCase()}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            <Divider className="my-6 opacity-30" />

            {/* Compliance Insights */}
            {violations.length > 0 ? (
              <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-red-400 text-sm">
                  <FaExclamationTriangle /> Architectural Violations
                  <Chip
                    className="ml-auto"
                    color="danger"
                    size="sm"
                    variant="flat"
                  >
                    {violations.length} Found
                  </Chip>
                </h4>
                <ul className="list-none space-y-2">
                  {violations.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xs text-gray-300 font-mono bg-black/20 p-2 rounded border border-white/5"
                    >
                      <span className="text-red-500 mt-0.5 shrink-0">
                        [{i + 1}]
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-xl flex items-center gap-3">
                <FaCheckCircle className="text-emerald-500 text-xl" />
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">
                    Compliance Verified
                  </h4>
                  <p className="text-xs text-emerald-500/70 mt-0.5">
                    The Sentinel confirmed no structural or architectural policy
                    violations.
                  </p>
                </div>
              </div>
            )}

            <Button
              className="w-full mt-6 font-mono text-xs tracking-widest"
              color="default"
              isLoading={loading}
              size="sm"
              variant="flat"
              onPress={runAudit}
            >
              RE-RUN SCAN
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SecurityAdviser;
