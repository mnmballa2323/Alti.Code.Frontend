"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Badge, Divider } from "@heroui/react";
import {
  Bot,
  LineChart,
  Factory,
  Car,
  Landmark,
  Server,
  Syringe,
  HeartPulse,
  Rocket,
  Satellite,
  Zap,
  Radio,
  Package,
  Scale,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Hexagon,
  Network,
  Wifi,
  Database,
  Search,
  Cpu,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";

type ConnectorColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

interface Connector {
  id: string;
  name: string;
  icon: any;
  desc: string;
  color: ConnectorColor;
}

const ENTERPRISE_CONNECTORS: Connector[] = [
  {
    id: "fix-protocol",
    name: "FIX Protocol Engine",
    icon: LineChart,
    desc: "High-Frequency Trading & Market Data",
    color: "primary",
  },
  {
    id: "fintech-ledger",
    name: "FinTech Ledger",
    icon: Landmark,
    desc: "Stripe Treasury, Plaid & Banking",
    color: "success",
  },
  {
    id: "iiot-scada",
    name: "SCADA & IIoT",
    icon: Factory,
    desc: "OPC UA, Modbus TCP, MQTT",
    color: "warning",
  },
  {
    id: "automotive-autosar",
    name: "AUTOSAR Firmware",
    icon: Car,
    desc: "MISRA C/C++ ECU & CAN Bus",
    color: "danger",
  },
  {
    id: "sap-netsuite",
    name: "ERP Bridges",
    icon: Server,
    desc: "SAP ABAP & Oracle NetSuite",
    color: "secondary",
  },
  {
    id: "salesforce-crm",
    name: "CRM Automation",
    icon: Bot,
    desc: "Salesforce Apex, LWC, MuleSoft",
    color: "primary",
  },
  {
    id: "fhir-weaver",
    name: "HL7 / FHIR R4",
    icon: Syringe,
    desc: "EHR Interoperability & Medical Data",
    color: "success",
  },
  {
    id: "actuarial-risk",
    name: "InsurTech Claims",
    icon: HeartPulse,
    desc: "Guidewire & Adjudication Workflows",
    color: "danger",
  },
];

const SOVEREIGN_CONNECTORS: Connector[] = [
  {
    id: "avionics-architect",
    name: "Avionics Architect",
    icon: Rocket,
    desc: "DO-178C, ARINC 429, Flight Code",
    color: "primary",
  },
  {
    id: "space-telemetry",
    name: "Space Telemetry",
    icon: Satellite,
    desc: "CCSDS, SGP4 Dynamics, C2 Links",
    color: "secondary",
  },
  {
    id: "smart-grid",
    name: "Smart Grid Automator",
    icon: Zap,
    desc: "IEC 61850 GOOSE, DNP3, DER",
    color: "warning",
  },
  {
    id: "5g-core",
    name: "5G Core Network",
    icon: Radio,
    desc: "3GPP, eBPF, O-RAN, Diameter",
    color: "primary",
  },
  {
    id: "logistics-edi",
    name: "Global Logistics",
    icon: Package,
    desc: "EDIFACT, AS2, WCS Conveyors",
    color: "success",
  },
  {
    id: "digital-forensics",
    name: "Digital Forensics",
    icon: Scale,
    desc: "Chain-of-Custody, PII Redaction",
    color: "default",
  },
  {
    id: "govtech-security",
    name: "GovTech Security",
    icon: ShieldCheck,
    desc: "FIPS 140-3, NIST 800-53, IL5",
    color: "danger",
  },
];

const DEEP_SYSTEMS_CONNECTORS: Connector[] = [
  {
    id: "zk-architect",
    name: "Zero-Knowledge Proofs",
    icon: Fingerprint,
    desc: "zk-SNARKs, Halo2, Circom R1CS",
    color: "secondary",
  },
  {
    id: "pqc-migration",
    name: "Post-Quantum Crypto",
    icon: Hexagon,
    desc: "Kyber, Dilithium, NIST PQC",
    color: "primary",
  },
  {
    id: "distributed-consensus",
    name: "Consensus Protocols",
    icon: Network,
    desc: "Raft CFT, PBFT, State Machines",
    color: "success",
  },
  {
    id: "gossip-dht",
    name: "P2P Networking",
    icon: Wifi,
    desc: "Kademlia DHT, Gossip, CRDTs",
    color: "warning",
  },
  {
    id: "database-storage",
    name: "Storage Engines",
    icon: Database,
    desc: "LSM Trees, B+Tree, NVMe WAL",
    color: "danger",
  },
  {
    id: "database-query",
    name: "Query Optimizers",
    icon: Search,
    desc: "Cost-Based, AST, HNSW Vectors",
    color: "primary",
  },
  {
    id: "edge-tinyml",
    name: "TinyML Edge AI",
    icon: Cpu,
    desc: "CMSIS-NN, Post-Training INT8",
    color: "secondary",
  },
];

export const EnterpriseConnectors = ({
  onGenerate,
}: {
  onGenerate?: (prompt: string) => Promise<void>;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScaffold = async (connector: Connector) => {
    setIsGenerating(true);
    toast.loading(`Scaffolding ${connector.name} architecture...`, {
      id: "scaffold",
    });

    try {
      // Note: In a real flow, this would hit /api/agents/dispatch mapping to the new specific agent.
      if (onGenerate) {
        await onGenerate(
          `Scaffold a production-ready template for ${connector.name}. This is an enterprise context (${connector.desc}). Ensure maximum resiliency and zero tight-coupling.`,
        );
      }
      toast.success(`${connector.name} module generated successfully!`, {
        id: "scaffold",
      });
    } catch (error: any) {
      toast.error(`Failed to scaffold ${connector.name}: ${error.message}`, {
        id: "scaffold",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full bg-content2 border border-default-200">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <Server className="text-secondary" size={24} />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            Enterprise Nexus Connectors
          </h2>
        </div>
        <p className="text-sm text-default-500 mt-1">
          Drag, drop, or click to autonomously scaffold proprietary industry
          integrations (ISO 26262, HIPAA, FIX).
        </p>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {ENTERPRISE_CONNECTORS.map((connector) => {
            const Icon = connector.icon;

            return (
              <Card
                key={connector.id}
                isHoverable
                isPressable
                className="border border-default-100 bg-content1 hover:border-secondary transition-all"
                onPress={() => handleScaffold(connector)}
              >
                <CardBody className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div
                    className={`p-3 rounded-full bg-${connector.color}/10 text-${connector.color}`}
                  >
                    <Icon size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-medium">
                      {connector.name}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      {connector.desc}
                    </p>
                  </div>
                  <Badge
                    className="mt-2"
                    color={connector.color}
                    size="sm"
                    variant="flat"
                  >
                    Tier 15 Agent
                  </Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Divider className="my-8" />

        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-danger" size={24} />
          <h3 className="text-lg font-bold text-gray-200">
            Sovereign Infrastructure (Tier 15)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SOVEREIGN_CONNECTORS.map((connector) => {
            const Icon = connector.icon;

            return (
              <Card
                key={connector.id}
                isHoverable
                isPressable
                className="border border-danger-100/50 bg-content1 hover:border-danger transition-all"
                onPress={() => handleScaffold(connector)}
              >
                <CardBody className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div
                    className={`p-3 rounded-full bg-${connector.color}/10 text-${connector.color}`}
                  >
                    <Icon size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-medium">
                      {connector.name}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      {connector.desc}
                    </p>
                  </div>
                  <Badge
                    className="mt-2 text-[10px] uppercase font-bold tracking-wider"
                    color={connector.color}
                    size="sm"
                    variant="flat"
                  >
                    Critical Infrastructure
                  </Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Divider className="my-8" />

        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-secondary" size={24} />
          <h3 className="text-lg font-bold text-gray-200">
            Deep Systems & Cryptography (Tier 20)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEEP_SYSTEMS_CONNECTORS.map((connector) => {
            const Icon = connector.icon;

            return (
              <Card
                key={connector.id}
                isHoverable
                isPressable
                className="border border-secondary-100/50 bg-content1 hover:border-secondary transition-all"
                onPress={() => handleScaffold(connector)}
              >
                <CardBody className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div
                    className={`p-3 rounded-full bg-${connector.color}/10 text-${connector.color}`}
                  >
                    <Icon size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-medium">
                      {connector.name}
                    </p>
                    <p className="text-xs text-default-400 mt-1">
                      {connector.desc}
                    </p>
                  </div>
                  <Badge
                    className="mt-2 text-[10px] uppercase font-bold tracking-wider"
                    color={connector.color}
                    size="sm"
                    variant="flat"
                  >
                    Applied Computer Science
                  </Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
