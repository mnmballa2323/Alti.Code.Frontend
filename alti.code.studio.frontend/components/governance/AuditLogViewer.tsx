"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Button,
} from "@heroui/react";
import {
  RefreshCw,
  ShieldAlert,
  FileText,
  Globe,
  Database,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface AuditLog {
  timestamp: string;
  actorId: string;
  action: string;
  resource: string;
  outcome: string;
  metadata: any;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Adjust API URL as needed (using environment variable ideally)

      const res = await fetch(`${API_URL}/governance/audit-logs?limit=20`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data);
        setError("");
      } else {
        setError("Failed to load logs");
      }
    } catch (err) {
      setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, []);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "SUCCESS":
        return "success";
      case "DENIED":
        return "danger";
      case "FAILURE":
        return "warning";
      default:
        return "default";
    }
  };

  const getIcon = (action: string) => {
    if (action.includes("DLP")) return <ShieldAlert size={16} />;
    if (action.includes("FILE")) return <FileText size={16} />;
    if (action.includes("NET")) return <Globe size={16} />;

    return <Database size={16} />;
  };

  return (
    <Card className="w-full h-full min-h-[400px] border-none shadow-md">
      <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-divider">
        <div className="flex gap-2 items-center">
          <ShieldAlert className="text-warning-500" />
          <h3 className="text-lg font-bold">Governance Audit Trail</h3>
        </div>
        <Button isIconOnly size="sm" variant="light" onPress={fetchLogs}>
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
        </Button>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden">
        {error && <div className="p-4 text-center text-danger">{error}</div>}
        <Table
          isStriped
          removeWrapper
          aria-label="Audit Logs"
          className="h-full overflow-auto"
        >
          <TableHeader>
            <TableColumn>TIMESTAMP</TableColumn>
            <TableColumn>ACTION</TableColumn>
            <TableColumn>ACTOR</TableColumn>
            <TableColumn>RESOURCE</TableColumn>
            <TableColumn>OUTCOME</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={"No logs found"}
            isLoading={loading}
            items={logs}
            loadingContent={<Spinner />}
          >
            {(item) => (
              <TableRow key={item.timestamp + item.action}>
                <TableCell className="text-tiny text-default-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getIcon(item.action)}
                    <span className="font-semibold">{item.action}</span>
                  </div>
                </TableCell>
                <TableCell>{item.actorId}</TableCell>
                <TableCell
                  className="text-tiny truncate max-w-[150px]"
                  title={item.resource}
                >
                  {item.resource}
                </TableCell>
                <TableCell>
                  <Chip
                    color={getOutcomeColor(item.outcome)}
                    size="sm"
                    variant="flat"
                  >
                    {item.outcome}
                  </Chip>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
