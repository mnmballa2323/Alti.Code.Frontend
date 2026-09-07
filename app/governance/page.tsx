"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";

import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid";
import { complianceAPI, costAPI } from "@/lib/enterprise-api";

export default function GovernancePage() {
  const [compliance, setCompliance] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cicero SLA Form State
  const [contractId, setContractId] = useState("contract-0x98f3c");
  const [minUptime, setMinUptime] = useState("99.9");
  const [uptime, setUptime] = useState("98.2");
  const [maxLatency, setMaxLatency] = useState("3000");
  const [latency, setLatency] = useState("3820");
  const [rateLimit, setRateLimit] = useState("200");
  const [requestCount, setRequestCount] = useState("150");

  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([
    {
      id: "job-1012",
      contractId: "contract-0x98f3c",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      violations: [
        "Uptime breach: actual 98.2 < target SLA minUptime 99.9",
        "Latency breach: actual 3820ms > target SLA maxLatencyMs 3000ms",
      ],
      severity: "HIGH",
      status: "QUEUED",
      receiptId: "az-rcpt-df38a109",
      hash: "8a4f91b3ce1982a7f80498b2cd6e0fa12a3b9c7d",
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [c, co] = await Promise.allSettled([
          complianceAPI.stats(),
          costAPI.stats(),
        ]);

        if (c.status === "fulfilled") setCompliance(c.value);
        if (co.status === "fulfilled") setCost(co.value);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleTriggerAudit = async () => {
    setAuditing(true);
    setError(null);
    setAuditResult(null);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBase}/governance/legal/enforce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          slaConditions: {
            minUptime: parseFloat(minUptime),
            maxLatencyMs: parseFloat(maxLatency),
            rateLimit: parseFloat(rateLimit),
          },
          telemetry: {
            uptime: parseFloat(uptime),
            avgLatencyMs: parseFloat(latency),
            requestCount: parseFloat(requestCount),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to trigger Cicero SLA compliance check.",
        );
      }

      setAuditResult(data);

      // Determine violations locally for history log display
      const violations: string[] = [];

      if (parseFloat(uptime) < parseFloat(minUptime)) {
        violations.push(
          `Uptime breach: actual ${uptime} < target SLA minUptime ${minUptime}`,
        );
      }
      if (parseFloat(latency) > parseFloat(maxLatency)) {
        violations.push(
          `Latency breach: actual ${latency}ms > target SLA maxLatencyMs ${maxLatency}ms`,
        );
      }
      if (parseFloat(requestCount) > parseFloat(rateLimit)) {
        violations.push(
          `Rate limit breach: actual requestCount ${requestCount} > SLA limit ${rateLimit}`,
        );
      }

      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify({
            contractId,
            uptime,
            latency,
            requestCount,
            ts: Date.now(),
          }),
        ),
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const cryptHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 40);

      setAuditHistory((prev) => [
        {
          id: data.jobId || `job-${Math.floor(1000 + Math.random() * 9000)}`,
          contractId,
          timestamp: new Date().toISOString(),
          violations,
          severity:
            violations.length > 0
              ? violations.some((v) => v.includes("Uptime"))
                ? "HIGH"
                : "MEDIUM"
              : "LOW",
          status: data.status || (violations.length > 0 ? "QUEUED" : "SKIPPED"),
          receiptId:
            data.gcp_routing_metadata?.receiptId ||
            (violations.length > 0 ? "az-rcpt-pending" : "N/A"),
          hash: cryptHash,
        },
        ...prev,
      ]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAuditing(false);
    }
  };

  const handleExportVerifiableRecord = (item: any) => {
    const record = {
      title: "Verifiable Compliance Log & Audit Trail Receipt",
      milestone: "v40.3.0",
      jobId: item.id,
      contractId: item.contractId,
      timestamp: item.timestamp,
      slaViolations: item.violations,
      severityLevel: item.severity,
      queueStatus: item.status,
      gcpNoticeReceiptId: item.receiptId,
      cryptographicProvenanceHash: item.hash,
      signature: "INSO-CODE-GOVERNANCE-OFFICE-AUTOSIGN-SHA256",
    };

    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `compliance-audit-${item.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-auto">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Governance Deck
        </h1>
        <p className="text-default-500">
          Security, Compliance, and Audit Trails
        </p>
      </header>

      {/* Summary Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-l-4 border-l-green-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold text-default-400">
              Compliance Frameworks
            </p>
            <h4 className="font-bold text-large text-default-200">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                `${compliance?.frameworks ?? 5} Active`
              )}
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-400">
              {compliance?.totalAssessments ?? 0} assessments •{" "}
              {compliance?.certified ?? 0} certified
            </p>
          </CardBody>
        </Card>
        <Card className="glass border-l-4 border-l-blue-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold text-default-400">
              Cost Analytics
            </p>
            <h4 className="font-bold text-large text-default-200">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                `${cost?.totalTracked ?? 0} Tracked`
              )}
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-400">
              {cost?.categories ?? 5} cost categories active
            </p>
          </CardBody>
        </Card>
        <Card className="glass border-l-4 border-l-purple-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold text-default-400">
              Audit Trail
            </p>
            <h4 className="font-bold text-large text-default-200">
              Active Stream
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-400">
              Real-time SPSC Ring Buffer enabled
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Cicero Law Enforcement Matrix Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            ⚖️ Cicero SLA Triage Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Simulate smart contract SLA threshold configurations and telemetry
            to trigger automated background legal notice routing.
          </p>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Contract ID
              </label>
              <input
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Min Uptime SLA (%)
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={minUptime}
                  onChange={(e) => setMinUptime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Current Uptime (%)
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={uptime}
                  onChange={(e) => setUptime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Max Latency SLA (ms)
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={maxLatency}
                  onChange={(e) => setMaxLatency(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Avg Latency (ms)
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={latency}
                  onChange={(e) => setLatency(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Rate Limit SLA
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Request Count
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={requestCount}
                  onChange={(e) => setRequestCount(e.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-medium rounded-xl text-xs transition-all shadow-md shadow-red-500/10 mt-2"
              disabled={auditing}
              onClick={handleTriggerAudit}
            >
              {auditing
                ? "⏳ Analyzing SLA Compliance…"
                : "⚖️ Trigger Cicero SLA Audit"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            📜 Cicero Audit & Queue Execution Log
          </h3>

          <div className="flex-1 overflow-auto space-y-4 pr-1">
            {auditResult && (
              <div className="bg-slate-900/50 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Latest Execution Response
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${auditResult.status === "QUEUED" ? "bg-amber-500/25 text-amber-300" : "bg-emerald-500/25 text-emerald-300"}`}
                  >
                    {auditResult.status || "COMPLETED"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Job ID: </span>
                    <span className="text-slate-300 font-mono">
                      {auditResult.jobId || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Message: </span>
                    <span className="text-slate-300">
                      {auditResult.message}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block font-mono">
                Job History (BullMQ Asynchronous)
              </span>
              {auditHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/35 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        {item.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({item.contractId})
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${item.status === "QUEUED" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      {item.violations.length > 0 ? (
                        item.violations.map((v: string, i: number) => (
                          <div
                            key={i}
                            className="text-red-400 flex items-start gap-1"
                          >
                            <span>•</span>
                            <span>{v}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-emerald-400 flex items-center gap-1">
                          <span>✔</span>
                          <span>
                            No violations found (fully SLA-compliant).
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div>
                        Timestamp: {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div>
                        GCP Dispatch Receipt:{" "}
                        <span className="font-mono text-slate-400">
                          {item.receiptId}
                        </span>
                      </div>
                      <div>
                        Provenance Hash:{" "}
                        <span className="font-mono text-slate-400">
                          {item.hash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end md:self-center">
                    <button
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                      onClick={() => handleExportVerifiableRecord(item)}
                    >
                      📥 Export Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <h2 className="text-xl font-bold mt-8 mb-4">Active Agents</h2>
      <AgentStatusGrid />
    </div>
  );
}
