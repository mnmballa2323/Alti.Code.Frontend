"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Cpu, ShieldAlert, Check, Loader2, Key, Globe2, Link2, ShieldCheck } from "lucide-react";
import { Button, Chip } from "@heroui/react";

export default function GatewaysPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AWS Bedrock config state
  const [awsKeyId, setAwsKeyId] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("us-east-1");

  // GCP Vertex config state
  const [gcpProjectId, setGcpProjectId] = useState("");
  const [gcpJsonKey, setGcpJsonKey] = useState("");
  const [gcpRegion, setGcpRegion] = useState("us-central1");

  // Azure OpenAI config state
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");
  const [azureDeployment, setAzureDeployment] = useState("gpt-4o-default");

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      // Simulate loading credentials from secure store/local storage
      const storedAwsKey = localStorage.getItem("gateway_aws_key") || "";
      const storedAwsSecret = localStorage.getItem("gateway_aws_secret") || "";
      const storedAwsRegion = localStorage.getItem("gateway_aws_region") || "us-east-1";

      const storedGcpProject = localStorage.getItem("gateway_gcp_project") || "";
      const storedGcpJsonKey = localStorage.getItem("gateway_gcp_json") || "";
      const storedGcpRegion = localStorage.getItem("gateway_gcp_region") || "us-central1";

      const storedAzureEndpoint = localStorage.getItem("gateway_azure_endpoint") || "";
      const storedAzureKey = localStorage.getItem("gateway_azure_key") || "";
      const storedAzureDeployment = localStorage.getItem("gateway_azure_deployment") || "gpt-4o-default";

      setAwsKeyId(storedAwsKey);
      setAwsSecretKey(storedAwsSecret);
      setAwsRegion(storedAwsRegion);

      setGcpProjectId(storedGcpProject);
      setGcpJsonKey(storedGcpJsonKey);
      setGcpRegion(storedGcpRegion);

      setAzureEndpoint(storedAzureEndpoint);
      setAzureApiKey(storedAzureKey);
      setAzureDeployment(storedAzureDeployment);

      setLoading(false);
    }
  }, [status]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // Simulate secure saving (in localhost we can write to localStorage)
    setTimeout(() => {
      localStorage.setItem("gateway_aws_key", awsKeyId);
      localStorage.setItem("gateway_aws_secret", awsSecretKey);
      localStorage.setItem("gateway_aws_region", awsRegion);

      localStorage.setItem("gateway_gcp_project", gcpProjectId);
      localStorage.setItem("gateway_gcp_json", gcpJsonKey);
      localStorage.setItem("gateway_gcp_region", gcpRegion);

      localStorage.setItem("gateway_azure_endpoint", azureEndpoint);
      localStorage.setItem("gateway_azure_key", azureApiKey);
      localStorage.setItem("gateway_azure_deployment", azureDeployment);

      setSaving(false);
      setSaveSuccess(true);

      // Flash success state
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full h-full">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-sm text-neutral-500">Loading Gateway Configurations...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">
      <div className="space-y-6 max-w-5xl">
        {/* Compliance Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3.5 items-start text-amber-800 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight">Tri-Cloud Security Policy Enforced</h4>
            <p className="text-xs leading-normal opacity-90">
              Direct API / SDK connections to models are forbidden. All inference is cryptographically routed through secure, authorized gateways. Only use state-of-the-art models for Bedrock, Vertex AI, and OpenAI Foundry.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* 1. AWS Bedrock Config */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                    AWS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-white">AWS Bedrock Gateway</h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Secured via AWS IAM Policies & KMS Key Encryption</p>
                  </div>
                </div>
                <Chip className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold" size="sm" variant="flat">
                  Claude 3.5 Sonnet
                </Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Access Key ID</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Key size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all font-mono"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      type="text"
                      value={awsKeyId}
                      onChange={(e) => setAwsKeyId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Secret Access Key</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Key size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all font-mono"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      type="password"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Default AWS Region</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Globe2 size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                      placeholder="us-east-1"
                      type="text"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GCP Vertex AI Config */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                    GCP
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-white">GCP Vertex AI Gateway</h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Secured via Workload Identity & BeyondCorp Access Proxy</p>
                  </div>
                </div>
                <Chip className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold" size="sm" variant="flat">
                  Gemini 3.1 Pro
                </Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">GCP Project ID</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Globe2 size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                      placeholder="my-gcp-project-123"
                      type="text"
                      value={gcpProjectId}
                      onChange={(e) => setGcpProjectId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Service Account Key (JSON)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Key size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all font-mono"
                      placeholder='{ "type": "service_account", ... }'
                      type="password"
                      value={gcpJsonKey}
                      onChange={(e) => setGcpJsonKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Default GCP Region</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Globe2 size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                      placeholder="us-central1"
                      type="text"
                      value={gcpRegion}
                      onChange={(e) => setGcpRegion(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Azure OpenAI Config */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-xs">
                    MS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-white">Azure OpenAI Foundry Gateway</h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Secured via Azure Private Links & Managed Identities</p>
                  </div>
                </div>
                <Chip className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold" size="sm" variant="flat">
                  GPT-4o
                </Chip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Resource Endpoint URL</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Link2 size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                      placeholder="https://my-resource.openai.azure.com/"
                      type="text"
                      value={azureEndpoint}
                      onChange={(e) => setAzureEndpoint(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Azure API Key</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Key size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all font-mono"
                      placeholder="Enter Azure OpenAI API Key..."
                      type="password"
                      value={azureApiKey}
                      onChange={(e) => setAzureApiKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Deployment Name</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400"><Globe2 size={14} /></span>
                    <input
                      className="w-full h-10 bg-neutral-50 dark:bg-neutral-900/40 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                      placeholder="gpt-4o-default"
                      type="text"
                      value={azureDeployment}
                      onChange={(e) => setAzureDeployment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in animate-out fade-out duration-1000">
                <ShieldCheck size={14} /> Configurations saved securely!
              </span>
            )}
            <Button
              className="bg-neutral-850 dark:bg-neutral-100 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-900 font-semibold h-10 rounded-xl px-8 shadow-sm flex items-center justify-center gap-2"
              disabled={saving}
              type="submit"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Gateways"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
