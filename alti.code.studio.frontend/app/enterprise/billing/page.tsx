"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { CreditCard, TrendingUp, Zap, Package } from "lucide-react";

import { billingAPI } from "@/lib/enterprise-api";

export default function BillingPage() {
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, m] = await Promise.allSettled([
          billingAPI.stats(),
          billingAPI.plans(),
          billingAPI.models(),
        ]);

        if (s.status === "fulfilled") setStats(s.value);
        if (p.status === "fulfilled")
          setPlans(Array.isArray(p.value) ? p.value : p.value?.plans || []);
        if (m.status === "fulfilled")
          setModels(Array.isArray(m.value) ? m.value : m.value?.models || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Billing...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Accounts",
      value: stats?.totalAccounts ?? 0,
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Plans Available",
      value: stats?.plans ?? 0,
      icon: <Package className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Models Supported",
      value: stats?.models ?? 0,
      icon: <Zap className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Revenue Period",
      value: "Monthly",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-emerald-500 to-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Usage</h2>
        <p className="text-sm text-default-400">
          Token metering, plan management, and model rates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <Card key={i} className="bg-white/5 border border-white/10">
            <CardBody className="py-4 px-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${c.color} shadow-lg`}
                >
                  <div className="text-white">{c.icon}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{c.value}</div>
              <div className="text-sm text-default-300">{c.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Available Plans</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table isStriped removeWrapper aria-label="Plans">
            <TableHeader>
              <TableColumn>PLAN</TableColumn>
              <TableColumn>MONTHLY TOKENS</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>OVERAGE</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No plans found">
              {plans.map((plan: any, i: number) => (
                <TableRow key={plan.id || i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Chip
                        color={
                          plan.id === "enterprise"
                            ? "secondary"
                            : plan.id === "business"
                              ? "primary"
                              : "default"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {plan.name || plan.id}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {(plan.monthlyAllowance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-bold">
                    ${plan.price ?? "—"}/mo
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={plan.overage?.allowed ? "warning" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {plan.overage?.allowed
                        ? `$${plan.overage.rate}/1k`
                        : "Blocked"}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Models Table */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Model Rates</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table isStriped removeWrapper aria-label="Models">
            <TableHeader>
              <TableColumn>MODEL</TableColumn>
              <TableColumn>PROVIDER</TableColumn>
              <TableColumn>INPUT (per 1K)</TableColumn>
              <TableColumn>OUTPUT (per 1K)</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No models found">
              {models.map((model: any, i: number) => (
                <TableRow key={model.id || i}>
                  <TableCell className="font-semibold">
                    {model.name || model.id}
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {model.provider || "unknown"}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-success">
                    ${model.inputRate ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-warning">
                    ${model.outputRate ?? "—"}
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
