"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Button,
} from "@heroui/react";
import { Webhook, Zap, CircleAlert, CheckCircle, Plus } from "lucide-react";

import { webhookAPI } from "@/lib/enterprise-api";

export default function WebhooksPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.allSettled([
          webhookAPI.stats(),
          webhookAPI.events(),
        ]);

        if (s.status === "fulfilled") setStats(s.value);
        if (e.status === "fulfilled")
          setEvents(Array.isArray(e.value) ? e.value : e.value?.events || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Webhooks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Webhook Manager</h2>
          <p className="text-sm text-default-400">
            Register endpoints, manage deliveries, and monitor circuit states
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
          size="sm"
          startContent={<Plus className="w-4 h-4" />}
        >
          Register Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
              <Webhook className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalWebhooks ?? 0}
              </div>
              <div className="text-sm text-default-300">Registered</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.deliveries ?? 0}
              </div>
              <div className="text-sm text-default-300">Deliveries</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.events ?? 17}
              </div>
              <div className="text-sm text-default-300">Event Types</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
              <CircleAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.circuitsBroken ?? 0}
              </div>
              <div className="text-sm text-default-300">Circuits Open</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Event Types */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">
            Supported Event Types
          </h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {events.length > 0
              ? events.map((evt: string, i: number) => (
                  <Chip
                    key={i}
                    className="font-mono text-xs"
                    color="secondary"
                    size="sm"
                    variant="flat"
                  >
                    {evt}
                  </Chip>
                ))
              : [
                  "tenant.created",
                  "tenant.updated",
                  "tenant.deleted",
                  "user.invited",
                  "user.removed",
                  "agent.deployed",
                  "agent.failed",
                  "compliance.assessed",
                  "compliance.certified",
                  "billing.overage",
                  "billing.payment",
                  "billing.plan_changed",
                  "webhook.circuit_opened",
                  "data.exported",
                  "data.imported",
                  "migration.started",
                  "migration.completed",
                ].map((evt, i) => (
                  <Chip
                    key={i}
                    className="font-mono text-xs"
                    color="secondary"
                    size="sm"
                    variant="flat"
                  >
                    {evt}
                  </Chip>
                ))}
          </div>
        </CardBody>
      </Card>

      {/* Security Info */}
      <Card className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
        <CardBody className="py-5 px-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Webhook className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="text-white font-bold mb-1">
                HMAC-SHA256 Secured Delivery
              </div>
              <p className="text-sm text-default-400 leading-relaxed">
                All webhook payloads are signed with HMAC-SHA256 using
                per-webhook secret keys. Circuit breaker pattern automatically
                opens after 3 consecutive failures, protecting your
                infrastructure from cascading issues. Circuits auto-close after
                60 seconds.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
