"use client";

import React from "react";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black w-full overflow-x-hidden font-sans relative">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">
          Privacy Policy
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-12 font-medium">
          Last Updated: July 2026
        </p>

        {/* Glowing Blue Outline Card */}
        <div
          className="bg-zinc-100 dark:bg-zinc-900/40 p-8 md:p-12 rounded-[32px] border relative overflow-hidden flex flex-col gap-8 shadow-xl"
          style={{
            borderColor: "#2563EB",
            boxShadow: "0 4px 24px rgba(37, 99, 235, 0.15)",
          }}
        >
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              1. Google Cloud Sovereign Commitment
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Alti Code Studio is built from the ground up for strict data sovereignty
              and compliance. All data processing, agent swarms, and model
              inference run inside private Google Cloud Sovereign environments.
              We do not transmit, share, or egress customer codebases, prompts,
              or metadata to third-party public AI providers. All model
              endpoints run isolated in regional sovereign virtual private
              clouds (VPC).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              2. Local-First Sandboxed Execution
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Agent execution and tool invocations run strictly inside local
              sandboxes or customer-managed virtual private environments. By
              isolating code modifications, shell execution, and AST traversals
              to local VPC boundaries, we guarantee that no unauthorized access
              to your intellectual property is possible.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              3. Data Loss Prevention (DLP) & Masking
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Our platform features automatic client-side DLP filtering. Before
              any prompts or assets reach regional Vertex AI API endpoints,
              personal identifiable information (PII), database credentials, API
              keys, and private configuration values are automatically scanned
              and redacted locally, preventing accidental secrets exposure.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              4. Cryptographic Ledger Logging
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Every action taken by our agent swarms is recorded in a signed,
              tamper-proof cryptographic ledger stored within your local
              database instance. This audit trail is HMAC-signed using SHA-256
              keys to ensure absolute authenticity and zero operator tampering,
              supporting compliance with SOC 2 Type II, HIPAA, and ISO 27001
              audit requirements.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              5. Data Retention & Backups
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              All metadata is backed up using high-frequency ZFS block-level
              snapshots or regional Cloud Storage buckets with local keys. We do
              not retain copies of your codebase or operational secrets in our
              infrastructure. You retain 100% control over the retention,
              archiving, and deletion of all project wikis and code changes.
            </p>
          </section>
        </div>
      </main>

      <PreFooter />
    </div>
  );
}
