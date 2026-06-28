"use client";
import React, { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Database,
  ArrowLeft,
  Check,
  Wifi,
  WifiOff,
  AlertCircle,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import axios from "axios";
import {
  Button,
  Card,
  Input,
  Chip,
  Tooltip,
  Spinner,
  Switch,
} from "@heroui/react";

import { ConnectorTabs } from "@/components/connector-tabs";

const SUPPORTED_DATABASES = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "logos:postgresql",
    port: 5432,
  },
  { id: "mysql", name: "MySQL", icon: "logos:mysql", port: 3306 },
  { id: "mongodb", name: "MongoDB", icon: "logos:mongodb-icon", port: 27017 },
  { id: "redis", name: "Redis", icon: "logos:redis", port: 6379 },
  { id: "supabase", name: "Supabase", icon: "logos:supabase-icon", port: 5432 },
  { id: "neon", name: "Neon", icon: "logos:neon-icon", port: 5432 },
  {
    id: "clickhouse",
    name: "ClickHouse",
    icon: "logos:clickhouse",
    port: 8123,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    icon: "logos:snowflake-icon",
    port: 443,
  },
  { id: "sqlite", name: "SQLite", icon: "logos:sqlite", port: 0 },
  { id: "pinecone", name: "Pinecone", icon: "logos:pinecone", port: 443 },
  { id: "qdrant", name: "Qdrant", icon: "logos:qdrant", port: 6333 },
];

export default function DatabasePage({
  params,
}: {
  params: Promise<{ dbId?: string[] }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const unwrappedParams = use(params);
  const dbId = unwrappedParams.dbId?.[0];
  const selectedDb = SUPPORTED_DATABASES.find((db) => db.id === dbId);

  // Connection list state
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // Form State
  const [connName, setConnName] = useState("");
  const [useUri, setUseUri] = useState(true);
  const [connectionString, setConnectionString] = useState("");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("");
  const [database, setDatabase] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [ssl, setSsl] = useState(true);

  // Action States
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load default port when db selected changes
  useEffect(() => {
    if (selectedDb) {
      setPort(selectedDb.port ? String(selectedDb.port) : "");
      setConnName(`Primary ${selectedDb.name}`);
      setTestResult(null);
    }
  }, [selectedDb]);

  // Load connections on mount
  const fetchConnections = async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const res = await axios.get(`${API_URL}/integrations/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        // Filter database connections
        const dbConns = res.data.data.filter((conn: any) =>
          conn.provider.startsWith("db_"),
        );

        setActiveConnections(dbConns);
      }
    } catch (err) {
      console.error("Failed to load active database connections:", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [token]);

  const handleTestConnection = async () => {
    if (!selectedDb || !token) return;
    setTesting(true);
    setTestResult(null);
    try {
      const details = useUri
        ? { connectionString, ssl, name: connName }
        : { host, port, database, user, password, ssl, name: connName };
      const res = await axios.post(
        `${API_URL}/integrations/test-db`,
        {
          provider: `db_${selectedDb.id}`,
          details,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data && res.data.success) {
        setTestResult({
          success: true,
          message: "Connection check successful!",
        });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to reach host database server.";

      setTestResult({ success: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!selectedDb || !token) return;
    setSaving(true);
    try {
      const details = useUri
        ? { connectionString, ssl, name: connName }
        : { host, port, database, user, password, ssl, name: connName };
      const res = await axios.post(
        `${API_URL}/integrations/custom`,
        {
          provider: `db_${selectedDb.id}`,
          details,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data && res.data.success) {
        router.push("/database");
        fetchConnections();
      }
    } catch (err) {
      console.error("Failed to save connection:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConnection = async (provider: string) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/integrations/disconnect/${provider}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConnections();
    } catch (err) {
      console.error("Failed to disconnect database:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans scrollbar-hide">
      <ConnectorTabs />
      <div className="flex flex-col items-center justify-start min-h-full w-full py-6">
        <div className="w-full max-w-4xl space-y-6">
          {selectedDb ? (
            /* Configure DB Form View */
            <div className="space-y-6">
              {/* Back Header */}
              <div className="flex items-center gap-3">
                <Button
                  isIconOnly
                  className="rounded-xl border border-default-200 bg-white dark:bg-[#111111] hover:bg-default-100"
                  variant="light"
                  onClick={() => router.push("/database")}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Connect {selectedDb.name}
                  </h1>
                  <p className="text-xs text-default-400">
                    Configure your data connection and credentials securely.
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <Card className="p-8 border border-default-200 bg-white dark:bg-[#111111] rounded-3xl shadow-sm space-y-6">
                {/* Connection Name */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                    Connector Name
                  </span>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-[#F4F4F6] dark:bg-default-50 hover:bg-[#e4e4e7] dark:hover:bg-default-100/50 shadow-none rounded-2xl h-11",
                    }}
                    placeholder="e.g. Production PostgreSQL Main"
                    value={connName}
                    onChange={(e) => setConnName(e.target.value)}
                  />
                </div>

                {/* Connection Mode Toggle */}
                {selectedDb.id !== "sqlite" && (
                  <div className="flex items-center justify-between border-y border-default-100/50 py-4">
                    <div>
                      <span className="text-xs font-semibold text-default-800 dark:text-default-200">
                        Connection Method
                      </span>
                      <p className="text-[11px] text-default-400 mt-0.5">
                        Choose between a complete Connection String URI or
                        granular connection fields.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${!useUri ? "font-semibold text-primary" : "text-default-400"}`}
                      >
                        Parameters
                      </span>
                      <Switch
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-primary",
                        }}
                        isSelected={useUri}
                        size="sm"
                        onValueChange={setUseUri}
                      />
                      <span
                        className={`text-xs ${useUri ? "font-semibold text-primary" : "text-default-400"}`}
                      >
                        URI String
                      </span>
                    </div>
                  </div>
                )}

                {/* Form fields depending on mode */}
                {useUri && selectedDb.id !== "sqlite" ? (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                      Connection URI
                    </span>
                    <Input
                      classNames={{
                        inputWrapper:
                          "bg-[#F4F4F6] dark:bg-default-50 hover:bg-[#e4e4e7] dark:hover:bg-default-100/50 shadow-none rounded-2xl h-11 font-mono text-xs",
                      }}
                      placeholder={
                        selectedDb.id === "mongodb"
                          ? "mongodb://user:password@host:port/database"
                          : selectedDb.id === "redis"
                            ? "redis://user:password@host:port"
                            : "postgresql://user:password@host:port/database"
                      }
                      value={connectionString}
                      onChange={(e) => setConnectionString(e.target.value)}
                    />
                  </div>
                ) : selectedDb.id === "sqlite" ? (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                      SQLite File Path
                    </span>
                    <Input
                      classNames={{
                        inputWrapper:
                          "bg-[#F4F4F6] dark:bg-default-50 hover:bg-[#e4e4e7] dark:hover:bg-default-100/50 shadow-none rounded-2xl h-11 font-mono text-xs",
                      }}
                      placeholder="./database.db"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                        Host
                      </span>
                      <Input
                        classNames={{
                          inputWrapper:
                            "bg-[#F4F4F6] dark:bg-default-50 rounded-2xl h-11 shadow-none",
                        }}
                        placeholder="localhost"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                        Port
                      </span>
                      <Input
                        classNames={{
                          inputWrapper:
                            "bg-[#F4F4F6] dark:bg-default-50 rounded-2xl h-11 shadow-none",
                        }}
                        placeholder="5432"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                        Database Name
                      </span>
                      <Input
                        classNames={{
                          inputWrapper:
                            "bg-[#F4F4F6] dark:bg-default-50 rounded-2xl h-11 shadow-none",
                        }}
                        placeholder="mydb"
                        value={database}
                        onChange={(e) => setDatabase(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                        Username
                      </span>
                      <Input
                        classNames={{
                          inputWrapper:
                            "bg-[#F4F4F6] dark:bg-default-50 rounded-2xl h-11 shadow-none",
                        }}
                        placeholder="postgres"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                        Password
                      </span>
                      <Input
                        classNames={{
                          inputWrapper:
                            "bg-[#F4F4F6] dark:bg-default-50 rounded-2xl h-11 shadow-none",
                        }}
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* SSL and Security configurations */}
                {selectedDb.id !== "sqlite" && (
                  <div className="flex items-center justify-between border-t border-default-100/50 pt-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <div>
                        <span className="text-xs font-semibold text-default-800 dark:text-default-200 block">
                          Enforce Secure SSL Connections
                        </span>
                        <p className="text-[10px] text-default-400">
                          Validate server credentials securely before
                          transacting.
                        </p>
                      </div>
                    </div>
                    <Switch
                      classNames={{
                        wrapper: "group-data-[selected=true]:bg-primary",
                      }}
                      isSelected={ssl}
                      size="sm"
                      onValueChange={setSsl}
                    />
                  </div>
                )}

                {/* Connection Test Results */}
                {testResult && (
                  <div
                    className={`p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed ${testResult.success ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 text-emerald-700 dark:text-emerald-400" : "bg-rose-50/50 dark:bg-rose-950/15 border-rose-200 text-rose-700 dark:text-rose-400"}`}
                  >
                    {testResult.success ? (
                      <Check className="size-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold block">
                        {testResult.success ? "Test Succeeded" : "Test Failed"}
                      </span>
                      {testResult.message}
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    className="h-11 px-5 rounded-xl text-default-600 dark:text-default-300 font-semibold"
                    variant="light"
                    onClick={() => router.push("/database")}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 px-5 rounded-xl text-primary font-semibold flex items-center gap-2"
                    color="primary"
                    isLoading={testing}
                    variant="flat"
                    onClick={handleTestConnection}
                  >
                    {!testing && <Wifi className="size-4" />} Test Connection
                  </Button>
                  <Button
                    className="h-11 px-6 rounded-xl font-semibold flex items-center gap-2"
                    color="primary"
                    isLoading={saving}
                    onClick={handleSaveConnection}
                  >
                    {!saving && <Zap className="size-4" />} Save Connection
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            /* Database Connectors Catalog List View */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header block */}
              <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-default-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Database Connectors
                    </h1>
                    <p className="text-xs text-default-500 mt-0.5">
                      Connect external databases to index schemas, analyze
                      performance, and provide knowledge data streams.
                    </p>
                  </div>
                </div>
                <Button
                  isIconOnly
                  className="text-default-400 hover:text-foreground rounded-xl"
                  variant="light"
                  onClick={fetchConnections}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>

              {/* Active Connectors List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                  Active Database Integrations
                </span>

                {listLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#111111] rounded-3xl border border-default-200">
                    <Spinner color="primary" />
                    <span className="text-xs text-default-500 mt-2">
                      Loading active connectors...
                    </span>
                  </div>
                ) : activeConnections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#111111] rounded-3xl border border-default-200 p-6">
                    <WifiOff className="size-12 text-default-200 mb-3" />
                    <h3 className="text-sm font-semibold text-foreground">
                      No Connections Registered
                    </h3>
                    <p className="text-xs text-default-400 max-w-sm mt-1">
                      Link databases below to allow agents to securely lookup
                      table schemas, run optimization reviews, or extract
                      context.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeConnections.map((conn) => {
                      const dbType = conn.provider.replace("db_", "");
                      const vendor = SUPPORTED_DATABASES.find(
                        (d) => d.id === dbType,
                      ) || { name: dbType, id: "db" };

                      return (
                        <Card
                          key={conn.provider}
                          className="p-5 border border-default-200 bg-white dark:bg-[#111111] hover:border-primary/20 transition-all rounded-2xl shadow-sm flex flex-row items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-default-100 rounded-xl flex items-center justify-center shrink-0">
                              <Database className="size-5 text-default-500" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-foreground block">
                                {conn.connectionId || conn.provider}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Chip
                                  className="text-[9px] uppercase font-bold tracking-wider h-4 px-1.5 border-none"
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                >
                                  {vendor.name}
                                </Chip>
                                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                                  Connected
                                </span>
                              </div>
                            </div>
                          </div>

                          <Tooltip
                            classNames={{
                              content:
                                "bg-black text-white text-xs py-1 px-2 rounded-md shadow-lg",
                            }}
                            content="Disconnect Database"
                          >
                            <Button
                              isIconOnly
                              className="rounded-lg text-default-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                              size="sm"
                              variant="light"
                              onClick={() =>
                                handleDeleteConnection(conn.provider)
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </Tooltip>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Supported vendors selection Grid */}
              <div className="space-y-4 pt-4 border-t border-default-200">
                <span className="text-xs font-semibold text-default-600 dark:text-default-400 uppercase tracking-wider block">
                  Add New Database Connector
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {SUPPORTED_DATABASES.map((db) => (
                    <Card
                      key={db.id}
                      className="p-5 border border-default-200 bg-white dark:bg-[#111111] hover:bg-primary/5 hover:border-primary/30 transition-all rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-3 cursor-pointer group hover:-translate-y-0.5 duration-300"
                      onClick={() => router.push(`/database/${db.id}`)}
                    >
                      <div className="w-12 h-12 bg-default-50 dark:bg-default-100/5 rounded-2xl flex items-center justify-center group-hover:scale-105 duration-300">
                        <Database className="size-6 text-default-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          {db.name}
                        </span>
                        <span className="text-[9px] text-default-400 group-hover:text-primary font-medium uppercase tracking-wider mt-0.5 block">
                          Configure
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
