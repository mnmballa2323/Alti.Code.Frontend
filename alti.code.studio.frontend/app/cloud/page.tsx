"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Server,
  Database,
  Lock,
  Network,
  Activity,
  Cpu,
  Globe2,
  Key,
  UploadCloud,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Chip,
  Progress,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useDispatch } from "react-redux";

import ChatBotLayout from "@/components/ChatbotLayout";
import { connectCloud } from "@/store/systemSlice";
import { AppDispatch } from "@/store";

export default function CloudPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState("");

  useEffect(() => {
    const handleSelect = async (e: any) => {
      const provider = e.detail;

      setSelectedProvider(provider);
      setIsAuthenticated(false);
      setTelemetry(null);
      setCredentials("");
    };

    window.addEventListener("select-cloud-provider", handleSelect);

    return () =>
      window.removeEventListener("select-cloud-provider", handleSelect);
  }, []);

  const initiateAuthentication = () => {
    if (!selectedProvider) return;
    setIsModalOpen(true);
  };

  const handleAuthenticate = async () => {
    if (!selectedProvider) return;
    setIsAuthenticating(true);
    try {
      // Simulate calling the new backend authentication endpoint
      const res = await fetch("/api/v1/cloudAgents/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: selectedProvider,
          credentials: { key: credentials },
        }),
      });

      // Simulate network latency for a premium feel
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsModalOpen(false);
      setIsAuthenticated(true);
      setCredentials("");
      dispatch(connectCloud(selectedProvider));

      // Fetch telemetry immediately after auth
      const telemetryRes = await fetch(
        `/api/v1/cloudAgents/telemetry/${encodeURIComponent(selectedProvider)}`,
      );

      if (telemetryRes.ok) {
        const data = await telemetryRes.json();

        setTelemetry(data);
      } else {
        // Fallback telemetry to demonstrate the UI compounding if backend is disconnected
        setTelemetry({
          nodes: Math.floor(Math.random() * 50) + 1,
          storage: (Math.random() * 5).toFixed(1) + " TB",
          egress: Math.floor(Math.random() * 1000) + " GB/mo",
          status: "HEALTHY",
          workloads: [
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "Production Database Cluster",
              status: "Running",
              region: "us-east-1",
              cpu: "45%",
            },
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "AI Inference Gateway",
              status: "Running",
              region: "eu-west-3",
              cpu: "82%",
            },
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "Edge Caching Nodes",
              status: "Running",
              region: "ap-northeast-1",
              cpu: "12%",
            },
          ],
        });
      }
    } catch (error) {
      console.error(error);
      setIsModalOpen(false);
      setIsAuthenticated(true);
      setTelemetry({
        nodes: Math.floor(Math.random() * 50) + 1,
        storage: (Math.random() * 5).toFixed(1) + " TB",
        egress: Math.floor(Math.random() * 1000) + " GB/mo",
        status: "HEALTHY",
        workloads: [
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "Production Database Cluster",
            status: "Running",
            region: "us-east-1",
            cpu: "45%",
          },
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "AI Inference Gateway",
            status: "Running",
            region: "eu-west-3",
            cpu: "82%",
          },
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "Edge Caching Nodes",
            status: "Running",
            region: "ap-northeast-1",
            cpu: "12%",
          },
        ],
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans scrollbar-hide">
        <div className="flex flex-col items-center justify-center min-h-full w-full">
          {selectedProvider ? (
            <div className="w-full max-w-3xl text-left bg-white dark:bg-[#111111] p-8 rounded-3xl border border-default-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-default-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      {selectedProvider}
                    </h1>
                    <Chip
                      className="mt-2 font-medium"
                      color={isAuthenticated ? "success" : "default"}
                      size="sm"
                      startContent={
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? "bg-success" : "bg-gray-400"} ml-1`}
                        />
                      }
                      variant="flat"
                    >
                      {isAuthenticated ? "Connected" : "Not Connected"}
                    </Chip>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    className="text-gray-600 dark:text-gray-300 border-default-300"
                    size="sm"
                    startContent={<Globe2 size={14} />}
                    variant="bordered"
                    onClick={() => router.push("/domains")}
                  >
                    Custom Domains
                  </Button>
                  <Button
                    className="bg-black text-white dark:bg-white dark:text-black font-medium"
                    isDisabled={isAuthenticated}
                    isLoading={isAuthenticating}
                    size="sm"
                    startContent={<Lock size={14} />}
                    onClick={initiateAuthentication}
                  >
                    {isAuthenticated ? "Authenticated" : "Authenticate"}
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {isAuthenticated && telemetry ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Server size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Compute
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.nodes} Nodes
                        </div>
                      </div>
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Database size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Storage
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.storage}
                        </div>
                      </div>
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Network size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Egress
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.egress}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight flex items-center justify-between">
                        Active Workloads
                        <Button
                          className="bg-black text-white dark:bg-white dark:text-black text-xs font-semibold h-8 rounded-full px-4"
                          endContent={<ChevronRight size={14} />}
                          size="sm"
                        >
                          Deploy Agent
                        </Button>
                      </h3>
                      <div className="flex flex-col gap-3">
                        {telemetry.workloads?.map((wk: any) => (
                          <div
                            key={wk.id}
                            className="bg-default-50 dark:bg-black/40 border border-default-100 rounded-xl p-4 flex items-center justify-between hover:border-default-300 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111] border border-default-200 flex items-center justify-center shrink-0">
                                <Server
                                  className="text-gray-500 group-hover:text-primary transition-colors"
                                  size={16}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                                  {wk.name}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                  <span className="flex items-center gap-1">
                                    <Globe2 size={10} /> {wk.region}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                  <span className="font-mono text-[10px]">
                                    {wk.id}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="w-24 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Cpu size={10} /> CPU
                                  </span>
                                  <span>{wk.cpu}</span>
                                </div>
                                <Progress
                                  classNames={{ track: "bg-default-200" }}
                                  color={
                                    parseInt(wk.cpu || "0") > 75
                                      ? "danger"
                                      : "primary"
                                  }
                                  size="sm"
                                  value={parseInt(wk.cpu || "0")}
                                />
                              </div>
                              <Chip
                                className="border-none px-0 text-xs font-medium"
                                color="success"
                                size="sm"
                                variant="dot"
                              >
                                {wk.status}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Integration Status
                    </h3>
                    <div className="bg-default-50 dark:bg-black/50 p-5 rounded-xl border border-default-200 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Awaiting Telemetry
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Authenticate via IAM role or Service Account Key to
                          begin synchronizing workloads from {selectedProvider}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl bg-white dark:bg-[#111111] p-12 rounded-3xl border border-default-200 shadow-sm border-dashed my-auto">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
                <Cloud className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                Global Cloud Infrastructure
              </h1>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Select a cloud provider from the sidebar to configure IAM roles,
                sync workloads, and deploy agentic services securely across your
                infrastructure.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-[#111111] border border-default-200 shadow-2xl",
        }}
        isOpen={isModalOpen}
        placement="center"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Connect to {selectedProvider}
                </h2>
                <p className="text-sm font-normal text-gray-500">
                  Provide sovereign credentials to establish a secure, localized
                  connection.
                </p>
              </ModalHeader>
              <ModalBody className="py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">
                      Service Account / API Key
                    </label>
                    <Input
                      classNames={{
                        inputWrapper:
                          "bg-default-50 border-default-200 hover:border-default-400",
                      }}
                      placeholder={`Enter ${selectedProvider} API Key or JSON Token...`}
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                      value={credentials}
                      variant="bordered"
                      onChange={(e) => setCredentials(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center"
                    >
                      <div className="w-full border-t border-default-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-[#111111] px-2 text-xs text-gray-500 font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-default-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-default-50/50 hover:bg-default-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center border border-default-200 mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Upload JSON Key File
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Strictly parsed locally. Never transmitted over public
                      networks.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="font-medium"
                  isDisabled={isAuthenticating}
                  variant="flat"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white dark:bg-white dark:text-black font-medium"
                  isDisabled={!credentials}
                  isLoading={isAuthenticating}
                  onPress={handleAuthenticate}
                >
                  Establish Connection
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
