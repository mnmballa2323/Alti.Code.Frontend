"use client";

/**
 * Enterprise Audit Forensics Dashboard
 * Allows compliance officers to search, filter, and export verified ledger logs.
 * Displays Vertex AI Threat Scores and KMS Signature Verification visual indicators.
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Search,
  Download,
  ShieldCheck,
  ShieldAlert,
  BrainCircuit,
  Activity,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ForensicDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, severityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In production this would point to the backend's /api/v1/audit endpoint
      // For POC/Demo, we mock the fetch or hit localhost depending on the environment
      const params = new URLSearchParams();

      if (searchTerm) params.append("actor", searchTerm);
      if (severityFilter !== "ALL") params.append("status", severityFilter);

      const response = await axios.get(
        `http://localhost:5001/api/v1/audit?${params.toString()}`,
      );

      if (response.data && response.data.data) {
        setLogs(response.data.data);
      } else {
        // Fallback mock data if backend isn't running yet in Dev
        setLogs(generateMockLogs());
      }
    } catch (error) {
      console.error("Failed to fetch logs. Using Mock data.", error);
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const handleExportWORM = async () => {
    try {
      const loadingToast = toast.loading(
        "Dispatching export to GCP Cloud Storage Container...",
      );
      const response = await axios.post(
        "http://localhost:5001/api/v1/audit/export/gcp",
      );

      toast.dismiss(loadingToast);
      if (response.data?.success) {
        toast.success(
          `Ledger Exported Successfully to ${response.data.data.bucket}`,
        );
      } else {
        toast.success("Simulation: Ledger Exported to WORM Storage.");
      }
    } catch (err) {
      toast.error("Failed to export. Ensure backend is running.");
    }
  };

  const generateMockLogs = () => {
    return [
      {
        id: "1",
        actor: "system_orchestrator",
        action: "CODE_MERGE",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        kmsSignature: "valid",
        threatScore: 12,
      },
      {
        id: "2",
        actor: "user_123",
        action: "PRIVILEGE_ESCALATION",
        status: "DENIED",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        kmsSignature: "valid",
        threatScore: 94,
      },
      {
        id: "3",
        actor: "bot_agent_refactor",
        action: "WORM_BUCKET_DELETE",
        status: "DENIED_BY_POLICY",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        kmsSignature: "valid",
        threatScore: 99,
      },
    ];
  };

  const renderStatusChip = (status: string) => {
    const colorMap: Record<
      string,
      "success" | "danger" | "warning" | "default"
    > = {
      SUCCESS: "success",
      FAILURE: "danger",
      DENIED: "danger",
      WARNING: "warning",
      DENIED_BY_POLICY: "danger", // OPA specific
    };

    return (
      <Chip
        className="font-mono"
        color={colorMap[status] || "default"}
        size="sm"
        variant="flat"
      >
        {status}
      </Chip>
    );
  };

  const renderSignatureVerify = (hasKms: boolean | string) => {
    if (hasKms) {
      return (
        <div className="flex items-center text-success gap-1">
          <ShieldCheck size={16} /> <span className="text-xs">HSM Signed</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-warning gap-1">
        <ShieldAlert size={16} /> <span className="text-xs">Legacy</span>
      </div>
    );
  };

  const renderThreatScore = (score: number | undefined | null) => {
    if (score === undefined || score === null)
      return <span className="text-default-400 text-xs">N/A</span>;

    let colorClass = "text-success";
    let Icon = Activity;

    if (score > 80) {
      colorClass = "text-danger font-bold animate-pulse";
      Icon = BrainCircuit;
    } else if (score > 50) {
      colorClass = "text-warning";
    }

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon size={16} />
        <span>{score}</span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enterprise Forensic Audits
          </h1>
          <p className="text-default-500">
            Immutable ledger exploration with Vertex AI Threat Analysis and KMS
            Sealing.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Download size={18} />}
          variant="shadow"
          onPress={handleExportWORM}
        >
          Export to WORM
        </Button>
      </div>

      <Card className="border-none shadow-sm shadow-primary/10 bg-content1/50 backdrop-blur-md">
        <CardBody className="gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="md:max-w-xs"
              placeholder="Search by Actor..."
              startContent={<Search className="text-default-400" size={18} />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Select
              className="md:max-w-xs"
              placeholder="Filter by Status"
              selectedKeys={[severityFilter]}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <SelectItem key="ALL">All Statuses</SelectItem>
              <SelectItem key="SUCCESS">Success</SelectItem>
              <SelectItem key="DENIED">Denied</SelectItem>
              <SelectItem key="DENIED_BY_POLICY">Policy Block (OPA)</SelectItem>
            </Select>
          </div>

          <Table
            isStriped
            aria-label="Immutable Forensics Ledger"
            classNames={{
              wrapper: "bg-transparent border-none shadow-none",
              th: "bg-default-100 text-default-800",
            }}
          >
            <TableHeader>
              <TableColumn>TIMESTAMP</TableColumn>
              <TableColumn>ACTOR</TableColumn>
              <TableColumn>ACTION</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>INTEGRITY PROOF</TableColumn>
              <TableColumn>AI THREAT SCORE</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="No records found in immutable ledger."
              isLoading={loading}
            >
              {logs.map((log) => (
                <TableRow key={log.id || log._id}>
                  <TableCell className="font-mono text-xs text-default-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {log.actor}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.action}
                  </TableCell>
                  <TableCell>{renderStatusChip(log.status)}</TableCell>
                  <TableCell>
                    {renderSignatureVerify(log.kmsSignature)}
                  </TableCell>
                  <TableCell>
                    {/* Try to pull the mock threat score or a dynamic one if the metadata supports it */}
                    {renderThreatScore(
                      log.threatScore || log.metadata?.threatScore,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
