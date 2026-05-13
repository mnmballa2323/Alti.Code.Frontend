"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Spinner } from "@heroui/react";

import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid";
import { complianceAPI, costAPI } from "@/lib/enterprise-api";

export default function GovernancePage() {
  const [compliance, setCompliance] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, co] = await Promise.allSettled([
          complianceAPI.stats(),
          costAPI.stats(),
        ]);

        if (c.status === "fulfilled") setCompliance(c.value);
        if (co.status === "fulfilled") setCost(co.value);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full h-full p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Governance Deck
        </h1>
        <p className="text-default-500">
          Security, Compliance, and Audit Trails
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-l-4 border-l-green-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">
              Compliance Frameworks
            </p>
            <h4 className="font-bold text-large">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                `${compliance?.frameworks ?? 5} Active`
              )}
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-500">
              {compliance?.totalAssessments ?? 0} assessments •{" "}
              {compliance?.certified ?? 0} certified
            </p>
          </CardBody>
        </Card>
        <Card className="glass border-l-4 border-l-blue-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Cost Analytics</p>
            <h4 className="font-bold text-large">
              {loading ? (
                <Spinner size="sm" />
              ) : (
                `${cost?.totalTracked ?? 0} Tracked`
              )}
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-500">
              {cost?.categories ?? 5} cost categories active
            </p>
          </CardBody>
        </Card>
        <Card className="glass border-l-4 border-l-purple-500">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Audit Trail</p>
            <h4 className="font-bold text-large">Active Stream</h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <p className="text-sm text-default-500">
              Real-time audit logging enabled
            </p>
          </CardBody>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Active Agents</h2>
      <AgentStatusGrid />
    </div>
  );
}
