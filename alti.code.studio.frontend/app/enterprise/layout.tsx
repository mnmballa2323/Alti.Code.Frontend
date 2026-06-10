"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ShieldCheck,
  Webhook,
  Store,
  Database,
  Settings,
  KeyRound,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";

const tabs = [
  { href: "/enterprise", label: "Command Center", icon: LayoutDashboard },
  { href: "/enterprise/billing", label: "Billing & Usage", icon: CreditCard },
  { href: "/enterprise/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/enterprise/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/enterprise/marketplace", label: "Marketplace", icon: Store },
  { href: "/enterprise/data", label: "Data Hub", icon: Database },
  { href: "/admin", label: "Admin", icon: KeyRound },
];

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full w-full">
        {/* Enterprise Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 pt-4 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Enterprise Console
              </h1>
              <p className="text-xs text-default-400">
                Infrastructure • Analytics • Compliance
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => {
              const isActive = tab.href === "/admin" ? pathname.startsWith("/admin") : pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? "border-violet-500 text-white bg-white/5"
                      : "border-transparent text-default-400 hover:text-white hover:bg-white/5"
                  }`}
                  href={tab.href}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </ChatBotLayout>
  );
}
