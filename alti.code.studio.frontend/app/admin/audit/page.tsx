"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from "lucide-react";

import { SOCKET_URL } from "@/lib/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: "SUCCESS" | "FAILURE" | "DENIED" | "WARNING";
  ipAddress?: string;
  metadata?: string;
}

const AuditPage = () => {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Adjust URL to your backend endpoint
      const response = await axios.get(`${SOCKET_URL}/api/v1/audit`, {
        params: {
          page,
          limit: 20,
          action: searchTerm, // Simulating search by action or actor if backend supports it
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        withCredentials: true, // Ensure cookies/auth headers are sent
      });

      if (response.data.success) {
        setLogs(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "FAILURE":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "DENIED":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Ledger</CardTitle>
            <div className="flex items-center gap-2 w-1/3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-10 text-muted-foreground"
                      colSpan={6}
                    >
                      No logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.actor}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="text-xs">{log.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs font-mono text-muted-foreground">
                        {log.metadata}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              disabled={page === 1 || loading}
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages || loading}
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPage;
