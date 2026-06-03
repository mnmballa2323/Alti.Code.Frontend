"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Search, Plus, Server } from "lucide-react";
import { Input, Button, Chip, cn } from "@heroui/react";

import { SAAS_MOCKS } from "./catalog";
import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";
import { AlertWrapper } from "@/components/ui/AlertWrapper";

type AppIntegration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  logo?: string;
  color: string;
  status: "connected" | "disconnected" | "connecting";
  type: "official" | "custom";
};

type Tool = {
  name: string;
  description: string;
  server?: string;
  inputSchema?: any;
};

// Command Preset Registry for MCP & Google MCP Toolbox
const COMMAND_PRESETS: Record<string, { command: string; args: string[] }> = {
  "mcp_sqlite": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "--file", "database.sqlite"]
  },
  "mcp_github": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"]
  },
  "mcp_fetch": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"]
  },
  "mcp_postgresql": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"]
  },
  "mcp_puppeteer": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"]
  },
  "mcp_brave_search": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"]
  },
  "mcp_everything": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everything"]
  },
  "mcp_memory": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"]
  },
  "mcp_sequential_thinking": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "mcp_time": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-time"]
  },
  "mcp_git": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-git"]
  },
  "mcp_filesystem": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/michaelmeram/workspace/alti.code.studio"]
  },
  "mcp_gitlab": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"]
  },
  "mcp_google_calendar": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-calendar"]
  },
  "mcp_google_maps": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-maps"]
  },
  "mcp_evernote": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-evernote"]
  },
  "mcp_everart": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everart"]
  },
  "mcp_slack": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"]
  },
  "mcp_sentry": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sentry"]
  },
  "mcp_redis": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-redis"]
  },
  "mcp_google_drive": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gdrive"]
  },
  "mcp_aws_kb_retrieval": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-aws-kb-retrieval"]
  },

  // Google MCP Toolbox Preset Databases
  "mcp_toolbox_alloydb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=alloydb"]
  },
  "mcp_toolbox_spanner": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=spanner"]
  },
  "mcp_toolbox_bigquery": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=bigquery"]
  },
  "mcp_toolbox_bigtable": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=bigtable"]
  },
  "mcp_toolbox_cloudsql": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cloudsql"]
  },
  "mcp_toolbox_looker": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=looker"]
  },
  "mcp_toolbox_dataproc": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=dataproc"]
  },
  "mcp_toolbox_monitoring": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=monitoring"]
  },
  "mcp_toolbox_logging": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=logging"]
  },
  "mcp_toolbox_healthcare": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=healthcare"]
  },
  "mcp_toolbox_knowledge_catalog": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=knowledge_catalog"]
  },
  "mcp_toolbox_mssql": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=mssql"]
  },
  "mcp_toolbox_cockroachdb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cockroachdb"]
  },
  "mcp_toolbox_yugabytedb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=yugabytedb"]
  },
  "mcp_toolbox_clickhouse": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=clickhouse"]
  },
  "mcp_toolbox_tidb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=tidb"]
  },
  "mcp_toolbox_oceanbase": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=oceanbase"]
  },
  "mcp_toolbox_firebird": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=firebird"]
  },
  "mcp_toolbox_singlestore": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=singlestore"]
  },
  "mcp_toolbox_mariadb": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=mariadb"]
  },
  "mcp_toolbox_couchbase": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=couchbase"]
  },
  "mcp_toolbox_cassandra": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=cassandra"]
  },
  "mcp_toolbox_dgraph": {
    command: "npx",
    args: ["-y", "@google/mcp-toolbox", "--prebuilt=dgraph"]
  }
};

const CORE_APPS: AppIntegration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories, read PRs, and commit code directly.",
    icon: "mdi:github",
    color: "bg-gray-800 dark:bg-white text-white dark:text-gray-900",
    status: "disconnected",
    type: "official",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Read channel messages and send notifications.",
    icon: "logos:slack-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Manage sprints, update tickets, and track velocity.",
    icon: "logos:jira",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Search internal docs and update knowledge base.",
    icon: "logos:notion-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Modern issue tracking and project management for software teams.",
    icon: "logos:linear",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "googledrive",
    name: "Google Drive",
    description: "Read and write documents directly to Google Workspace.",
    icon: "logos:google-drive",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Interact with community channels, manage roles, and deploy bots.",
    icon: "logos:discord-icon",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
];

const coreAppIds = new Set(CORE_APPS.map((app) => app.id));

const FALLBACK_APPS: AppIntegration[] = [
  ...CORE_APPS,
  ...SAAS_MOCKS.filter((mockApp) => !coreAppIds.has(mockApp.slug)).map(
    (mockApp) => ({
      id: `app-${mockApp.slug}`,
      name: mockApp.name,
      description: mockApp.slug.startsWith("mcp_toolbox_")
        ? `Connect and explore data dynamically within ${mockApp.name} powered by the Google Cloud MCP Toolbox.`
        : `Seamlessly connect and automate workflows directly with ${mockApp.name}.`,
      icon: mockApp.icon,
      color: "bg-white border border-gray-200",
      status: "disconnected" as const,
      type: "official" as const,
    }),
  ),
].sort((a, b) => a.name.localeCompare(b.name));

const AppIcon = ({ app, className = "w-8 h-8" }: { app: AppIntegration; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  if (app.id === "custom-mcp-launcher") {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-primary/10 text-primary rounded-xl", className)}>
        <Plus className="size-4 shrink-0" />
      </div>
    );
  }

  const slug = app.id.replace("app-", "").toLowerCase();
  let cleanSlug = slug.startsWith("_") ? slug.slice(1) : slug;
  if (cleanSlug.startsWith("mcp_toolbox_")) {
    cleanSlug = cleanSlug.slice(12);
  } else if (cleanSlug.startsWith("mcp_")) {
    cleanSlug = cleanSlug.slice(4);
  }

  const localSVGRegistry: Record<string, React.ReactNode> = {
    aws_dynamodb: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5 object-contain">
        <title>Amazon DynamoDB</title>
        <path fill="#4053D6" d="M16.606 20.705v-2.371c-1.263 1.082-3.884 1.795-7.066 1.795-3.184 0-5.805-.714-7.068-1.797v2.369c0 1.168 2.903 2.47 7.068 2.47 4.16 0 7.06-1.3 7.066-2.466zm.001-6.765l.817-.005v.005c0 .517-.258.998-.75 1.441.601.54.75 1.071.75 1.449a1661.7 1661.7 0 0 0 0 3.87c0 1.881-3.389 3.3-7.884 3.3-4.471 0-7.846-1.404-7.88-3.27a583.119 583.119 0 0 1-.003-3.909c.001-.375.15-.9.745-1.437-.592-.538-.743-1.062-.746-1.435v-3.892c.002-.377.153-.903.747-1.438-.593-.54-.744-1.062-.747-1.435 0-1.357-.002-2.735.002-3.897C1.674 1.412 5.056 0 9.54 0c2.159 0 4.233.356 5.689.974l-.315.766c-1.36-.58-3.319-.91-5.374-.91-4.165 0-7.067 1.3-7.067 2.47 0 1.168 2.902 2.47 7.067 2.47.115 0 .222 0 .334-.005l.033.828c-.122.006-.245.006-.367.006-3.184 0-5.805-.714-7.068-1.798v2.38c.005.45.45.843.821 1.093 1.116.736 3.114 1.239 5.34 1.342l-.037.829c-2.254-.105-4.23-.59-5.5-1.332-.318.245-.623.573-.623.952 0 1.168 2.902 2.47 7.067 2.47.411 0 .812-.014 1.203-.042l.06.826c-.41.03-.833.045-1.263.045-3.184 0-5.805-.713-7.068-1.797v2.368c.005.462.449.855.821 1.104 1.275.842 3.67 1.366 6.247 1.366h.182v.83H9.54c-2.62 0-4.99-.507-6.444-1.359-.317.245-.623.574-.623.954 0 1.168 2.902 2.47 7.067 2.47 4.159 0 7.058-1.298 7.066-2.465v-.007c0-.377-.303-.705-.62-.948a5.732 5.732 0 0 1-.662.336l-.316-.764c.3-.128.56-.266.776-.412.376-.254.823-.651.823-1.1zm4.377-6.915h-2.717a.406.406 0 0 1-.332-.173.42.42 0 0 1-.055-.375l1.204-3.597h-5.403l-2.583 4.974h2.623c.128 0 .248.06.325.164a.418.418 0 0 1 .069.36l-2.249 8.365zm1.249-.128l-10.89 11.608a.408.408 0 0 1-.498.075.418.418 0 0 1-.192-.471l2.534-9.426h-2.766a.407.407 0 0 1-.349-.2.418.418 0 0 1-.012-.407l3.014-5.804a.408.408 0 0 1 .36-.222h6.22c.132 0 .256.065.332.174a.422.422 0 0 1 .055.374l-1.204 3.598h3.1c.164 0 .31.099.375.251a.422.422 0 0 1-.08.45zM3.085 20.723a8.107 8.107 0 0 0 1.72.72l.233-.794a7.32 7.32 0 0 1-1.546-.645zm1.72-5.984l.233-.795a7.262 7.262 0 0 1-1.546-.646l-.407.72a8.051 8.051 0 0 0 1.72.72zm-1.72-7.427l.407-.719c.418.244.939.462 1.546.646l-.232.794a8.046 8.046 0 0 1-1.72-.72Z" />
      </svg>
    ),
    ansible: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5 object-contain">
        <title>Ansible</title>
        <path fill="#EE0000" d="M10.617 11.473l4.686 3.695-3.102-7.662zM12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zm5.797 17.305c-.011.471-.403.842-.875.83-.236 0-.416-.09-.664-.293l-6.19-5-2.079 5.203H6.191L11.438 5.44c.124-.314.427-.52.764-.506.326-.014.63.189.742.506l4.774 11.494c.045.111.08.234.08.348-.001.009-.001.009-.001.023z" />
      </svg>
    ),
    anthropic: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5 object-contain">
        <title>Anthropic</title>
        <path fill="#191919" d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
      </svg>
    ),
    apollo_graphql: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5 object-contain">
        <title>Apollo GraphQL</title>
        <path fill="#311C87" d="M12,0C5.372,0 0,5.373 0,12 0,18.628 5.372,24 12,24 18.627,24 24,18.628 24,12A12.014,12.014 0 0 0 23.527,8.657 0.6,0.6 0 0 0 22.4,9.066H22.398C22.663,10.009 22.8,10.994 22.8,12A10.73,10.73 0 0 1 19.637,19.637 10.729,10.729 0 0 1 12,22.8 10.73,10.73 0 0 1 4.363,19.637 10.728,10.728 0 0 1 1.2,12 10.73,10.73 0 0 1 4.363,4.363 10.728,10.728 0 0 1 12,1.2C14.576,1.2 17.013,2.096 18.958,3.74A1.466,1.466 0 1 0 19.82,2.9 11.953,11.953 0 0 0 12,0ZM10.56,5.88 6.36,16.782H8.99L9.677,14.934H13.646L12.927,12.892H10.314L12.014,8.201 15.038,16.781H17.669L13.47,5.88Z" />
      </svg>
    ),
    argocd: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-0.5 object-contain">
        <title>ArgoCD</title>
        <path fill="#EF6A39" d="M12.581 0c.436.037.871.1 1.299.186 1.679.383 3.121 1.213 4.382 2.365 1.161 1.06 1.917 2.372 2.335 3.881.089.321.216.56.586.624.205.035.238.245.239.43.003.646.002 1.294.002 1.94l-.002 1.21c-.001.356-.116.479-.466.474-.211-.003-.293.119-.344.291-.146.489-.33.966-.552 1.426-.818 1.682-2.084 2.938-3.688 3.87-.077.045-.155.088-.233.131-.252.137-.258.146-.155.415.114.299.358.529.664.625.269.096.553.134.827.21a.672.672 0 0 1 .236.094c-.066.082-.156.067-.231.082-.36.073-.713.184-1.086.17a1.275 1.275 0 0 1-.438-.064c-.114-.045-.152-.006-.176.109a5.354 5.354 0 0 0-.084.92c-.015.617-.071 1.23-.112 1.844-.042.598-.018.651.558.842.281.094.563.187.842.286.069.024.15.038.192.117-.04.057-.098.035-.146.035-.493.003-.985.005-1.478.001-.524-.005-.806-.282-.845-.803-.055-.762-.12-1.524-.182-2.286a.947.947 0 0 0-.026-.12c-.079.455-.065.879-.084 1.298-.023.528-.008 1.057-.007 1.584 0 .27.086.388.335.483.359.135.711.295 1.114.262.141-.012.276.062.402.129.032.017.073.033.069.073-.004.043-.049.047-.084.045-.657-.019-1.317.065-1.972-.028-.323-.046-.533-.236-.631-.552-.094-.303-.114-.617-.137-.93-.046-.626-.078-1.253-.116-1.88a.222.222 0 0 0-.061-.171.282.282 0 0 0-.031.193c-.002.956-.002 1.911-.001 2.866 0 .388.123.575.494.708.481.172.976.298 1.47.423.11.028.225.047.242.192h-1.852c-.051-.01-.103-.022-.155-.03-.701-.1-1.001-.372-1.143-1.042l-.067-.331-.226-1.103c-.069.12-.118.25-.144.386-.083.399-.151.802-.243 1.2-.113.493-.444.763-.932.857l-.33.063H8.558c.057-.171.216-.185.355-.221.476-.127.96-.223 1.417-.409a.603.603 0 0 0 .397-.521c.058-.435.002-.865-.013-1.296a1.528 1.528 0 0 0-.078-.315.405.405 0 0 0-.071.207c-.026.296-.049.591-.075.886-.038.432-.273.716-.679.81a1.702 1.702 0 0 1-.37.045c-.557.003-1.115-.001-1.673-.005-.048 0-.109.019-.148-.065.178-.103.377-.168.582-.187a5.67 5.67 0 0 0 .939-.193c.42-.114.522-.249.512-.687-.023-.931-.091-1.86-.069-2.791.004-.184.001-.368.001-.551a2.387 2.387 0 0 0-.05.385 40.299 40.299 0 0 1-.186 2.623c-.052.513-.296.748-.804.805-.446.051-.889.002-1.332-.02-.108-.006-.234.012-.339-.064.043-.066.106-.07.16-.087.362-.115.725-.224 1.086-.344.246-.081.35-.235.355-.492a2.241 2.241 0 0 0-.003-.232 45.315 45.315 0 0 1-.105-2.149 5.487 5.487 0 0 0-.035-.478c-.024-.188-.131-.287-.295-.258-.505.092-.99-.006-1.473-.139-.059-.016-.134-.007-.178-.088a.986.986 0 0 1 .285-.09c.255-.052.507-.121.753-.208.312-.112.564-.347.695-.651.089-.203.056-.317-.112-.398-1.418-.683-2.512-1.73-3.391-3.017a8.152 8.152 0 0 1-1.123-2.447c-.067-.246-.156-.3-.383-.26-.306.053-.401.006-.535-.273v-3.49c.144-.303.205-.341.534-.329.235.01.247-.004.309-.242.396-1.508 1.082-2.861 2.171-3.988C6.9 1.42 8.523.631 10.34.203c.456-.108.922-.15 1.387-.203h.854Zm7.974 8.948a7.34 7.34 0 0 0-.048-.938 8.353 8.353 0 0 0-.099-.65c-.598-2.964-2.344-5.02-5.051-6.268-1.553-.715-3.21-.835-4.878-.511-3.248.633-5.396 2.583-6.539 5.652-.436 1.173-.495 2.406-.37 3.65.087.935.339 1.846.745 2.694.585 1.213 1.444 2.207 2.477 3.058.343.286.719.528 1.121.719.235.111.247.105.245-.146.006-.16.003-.32-.009-.48-.125-1.02-.142-2.045-.169-3.069a.392.392 0 0 0-.184-.353c-.385-.268-.713-.592-.921-1.019-.474-.97-.372-2.361.813-3.215.136-.097.217-.19.198-.373a1.724 1.724 0 0 1 .031-.442c.177-1.187.748-2.138 1.722-2.84.68-.492 1.442-.772 2.286-.782.483-.007.953.11 1.414.244 1.609.467 2.846 2.07 2.845 3.697a.64.64 0 0 0 .268.565c.463.371.821.83.943 1.426.22 1.077-.083 1.982-.979 2.634-.266.194-.347.406-.333.698.002.047 0 .095-.002.142l-.062 1.439c-.025.586-.138 1.165-.117 1.754.008.223.006.226.201.128a7.46 7.46 0 0 0 2.393-1.903c1.32-1.577 2.074-3.372 2.059-5.511ZM9.117 12.102c1.489.021 2.443-1.578 1.716-2.879a1.937 1.937 0 0 0-1.699-.991c-1.094-.004-1.954.822-1.958 1.881-.005 1.148.813 1.985 1.941 1.989Zm5.794 0c1.101.002 1.935-.823 1.935-1.917 0-1.091-.846-1.949-1.92-1.947-1.064.003-1.94.866-1.943 1.915-.003 1.105.831 1.948 1.928 1.949Zm-1.472 1.937c-.208.128-.407.277-.63.384-.536.257-1.063.257-1.579-.048-.158-.094-.308-.201-.464-.298-.047-.028-.092-.103-.15-.062-.044.03-.01.1-.001.151.037.179.064.362.082.544.027.565.293.992.742 1.31a.984.984 0 0 0 .791.186c.565-.119 1.025-.614 1.124-1.218.043-.266.005-.544.109-.803a.133.133 0 0 0-.024-.146Zm-8.78-4.92c-.012-1.102.143-2.055.54-2.961.633-1.443 1.642-2.553 2.98-3.374a.378.378 0 0 1 .459.067c.06.06.036.118.01.178a1.09 1.09 0 0 1-.48.51c-1.079.639-1.829 1.571-2.357 2.688a6.325 6.325 0 0 0-.618 2.986c.055 1.309.439 2.516 1.213 3.588.088.104.148.23.173.365.01.08.059.168-.031.228a.312.312 0 0 1-.288.041.502.502 0 0 1-.234-.185c-.72-.979-1.193-2.056-1.331-3.273-.036-.326-.004-.653-.036-.858ZM8.94 2.34a.373.373 0 0 1 .378-.382c.211.001.409.226.416.473.004.138-.309.39-.476.386-.189-.005-.318-.2-.318-.477Zm-.465 7.48a.609.609 0 0 1 .586-.631c.38-.003.671.271.675.633.004.356-.27.622-.639.621-.38-.002-.621-.241-.622-.623Zm6.496.623c-.381-.002-.625-.255-.621-.646a.635.635 0 0 1 .596-.613.656.656 0 0 1 .669.643c.001.354-.275.618-.644.616Z" />
      </svg>
    ),
  };

  if (localSVGRegistry[cleanSlug]) {
    return (
      <div className={cn("rounded-xl flex items-center justify-center bg-transparent shrink-0", className)}>
        {localSVGRegistry[cleanSlug]}
      </div>
    );
  }

  const localLogoMappings: Record<string, string> = {
    github: "github.png",
    slack: "slack.svg",
    jira: "jira.svg",
    notion: "notion.svg",
    linear: "linear.png",
    googledrive: "google-drive.svg",
    googlesheets: "google-sheets.svg",
    discord: "discord.svg",
    gmail: "gmail.svg",
    git: "git.svg",
    filesystem: "filesystem.svg",
    supabase: "supabase.jpeg",
    posthog: "posthog.svg",
    sentry: "sentry.svg",
    docker: "docker-icon.png",
    kubernetes: "kubernetes.png",
    aws: "aws.svg",
    azure: "azure.svg",
  };

  const simpleIconsMapping: Record<string, string> = {
    aws_dynamodb: "amazondynamodb",
    aws_ec2: "amazonec2",
    aws_lambda: "awslambda",
    aws_s3: "amazons3",
    aws_ecs: "amazonecs",
    aws_cdk: "amazonwebservices",
    aws_kb_retrieval: "amazonwebservices",
    apollo_graphql: "apollographql",
    google_drive: "googledrive",
    google_sheets: "googlesheets",
    google_calendar: "googlecalendar",
    google_maps: "googlemaps",
    bun_runtime: "bun",
    deno_runtime: "deno",
    prisma_orm: "prisma",
    hasura_graphql: "hasura",
    stripe_dev: "stripe",
    teams: "microsoftteams",
    nextjs: "nextdotjs",
    springboot: "springboot",
    brave_search: "brave",
    argocd: "argo",
    ansible: "ansible",
    anthropic: "anthropic",
  };

  const getUrlsToTry = () => {
    const urls: string[] = [];
    const addUrl = (url: string) => {
      if (url && !urls.includes(url)) urls.push(url);
    };

    // 1. Try explicit app.logo if provided
    if (app.logo) {
      addUrl(app.logo);
    }

    // 2. Try local mapped asset (offline-first!)
    const localFile = localLogoMappings[cleanSlug] || localLogoMappings[slug];
    if (localFile) {
      addUrl(`/assets/apps-logos/${localFile}`);
    }

    // 3. Try official jsDelivr/unpkg Simple Icons npm CDN (highly CSP-compliant and fast)
    const simpleIconBrand = simpleIconsMapping[cleanSlug] || cleanSlug.replace(/_/g, "");
    addUrl(`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${simpleIconBrand}.svg`);
    addUrl(`https://unpkg.com/simple-icons@latest/icons/${simpleIconBrand}.svg`);
    addUrl(`https://cdn.simpleicons.org/${simpleIconBrand}`);

    // 4. Try Composio official logo API
    addUrl(`https://logos.composio.dev/api/${cleanSlug.replace(/_/g, "-")}`);
    addUrl(`https://logos.composio.dev/api/${cleanSlug}`);

    // 5. Try Clearbit Logo API
    addUrl(`https://logo.clearbit.com/${simpleIconBrand}.com`);

    return urls;
  };

  const urlsToTry = getUrlsToTry();
  const currentLogoUrl = urlsToTry[urlIndex];

  const handleImageError = () => {
    if (urlIndex < urlsToTry.length - 1) {
      setUrlIndex(urlIndex + 1);
    } else {
      setImageError(true);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-indigo-600 text-white",
      "from-purple-500 to-pink-600 text-white",
      "from-emerald-500 to-teal-600 text-white",
      "from-amber-500 to-orange-600 text-white",
      "from-rose-500 to-red-600 text-white",
      "from-cyan-500 to-blue-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Render the image if we haven't exhausted our fallback options
  if (!imageError && currentLogoUrl) {
    return (
      <img
        src={currentLogoUrl}
        alt={`${app.name} logo`}
        className={cn(className, "object-contain p-0.5 rounded-xl shrink-0")}
        onError={handleImageError}
      />
    );
  }

  // Fallback 1: System custom server icon
  if (app.type === "custom") {
    return (
      <div className={cn("rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0", className)}>
        <Server className="size-4 text-white shrink-0" />
      </div>
    );
  }

  // Fallback 2: Ultimate bulletproof initials box (strictly bypasses broken Iconify components to ensure no blank circles!)
  const initials = app.name.slice(0, 2).toUpperCase();
  const gradientClass = getAvatarColor(app.name);

  return (
    <div className={cn("rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br tracking-tight shrink-0", gradientClass, className)}>
      {initials}
    </div>
  );
};

const MCP_REPOS = [
  {
    name: "servers",
    description: "Official reference implementations for databases, developer tools, and filesystem servers.",
    license: "Apache 2.0 / MIT",
    lang: "TypeScript / Python",
    url: "https://github.com/modelcontextprotocol/servers",
    install: "git clone https://github.com/modelcontextprotocol/servers.git",
    icon: "solar:database-bold-duotone",
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "typescript-sdk",
    description: "Official TypeScript/JavaScript SDK to build custom Model Context Protocol clients and servers.",
    license: "MIT",
    lang: "TypeScript",
    url: "https://github.com/modelcontextprotocol/typescript-sdk",
    install: "npm install @modelcontextprotocol/sdk",
    icon: "logos:typescript-icon",
    color: "from-blue-500 to-indigo-600"
  },
  {
    name: "python-sdk",
    description: "Official Python SDK to build custom Model Context Protocol clients and servers.",
    license: "MIT",
    lang: "Python",
    url: "https://github.com/modelcontextprotocol/python-sdk",
    install: "pip install mcp",
    icon: "logos:python",
    color: "from-sky-400 to-blue-600"
  },
  {
    name: "inspector",
    description: "Official interactive developer tool to inspect, debug, and trace MCP connections.",
    license: "MIT",
    lang: "TypeScript",
    url: "https://github.com/modelcontextprotocol/inspector",
    install: "npx @modelcontextprotocol/inspector",
    icon: "solar:tuning-square-bold-duotone",
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "modelcontextprotocol",
    description: "Official protocol specifications, schema definitions, and enhancement proposals (SEPs).",
    license: "MIT",
    lang: "Markdown / JSON",
    url: "https://github.com/modelcontextprotocol/modelcontextprotocol",
    install: "https://modelcontextprotocol.io",
    icon: "solar:document-bold-duotone",
    color: "from-teal-400 to-emerald-600"
  },
  {
    name: "go-sdk",
    description: "Official Go SDK to build custom Model Context Protocol clients and servers.",
    license: "MIT",
    lang: "Go",
    url: "https://github.com/modelcontextprotocol/go-sdk",
    install: "go get github.com/modelcontextprotocol/go-sdk",
    icon: "logos:go",
    color: "from-cyan-400 to-teal-500"
  },
  {
    name: "rust-sdk",
    description: "Official Rust SDK to build custom Model Context Protocol clients and servers.",
    license: "MIT",
    lang: "Rust",
    url: "https://github.com/modelcontextprotocol/rust-sdk",
    install: "cargo add mcp-sdk",
    icon: "logos:rust",
    color: "from-stone-600 to-neutral-800"
  },
  {
    name: "ext-auth",
    description: "Official supplementary specification defining authorization mechanisms for MCP connections.",
    license: "Apache 2.0",
    lang: "Specification",
    url: "https://github.com/modelcontextprotocol/ext-auth",
    install: "Archived Specification",
    icon: "solar:shield-keyhole-bold-duotone",
    color: "from-red-500 to-rose-600"
  }
];

export default function ConnectAppsPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [apps, setApps] = useState<AppIntegration[]>(FALLBACK_APPS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // States
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
  const [appTriggers, setAppTriggers] = useState<any[]>([]);
  const [appTools, setAppTools] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalTab, setModalTab] = useState("tools");
  const [idleTab, setIdleTab] = useState<"action-hub" | "mcp-explorer">("action-hub");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic Stdio MCP Server Config States
  const [activeTools, setActiveTools] = useState<Tool[]>([]);
  const [command, setCommand] = useState("npx");
  const [argsInput, setArgsInput] = useState("");
  const [isMcpConnecting, setIsMcpConnecting] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);

  // Custom MCP Form States
  const [customServersList, setCustomServersList] = useState<any[]>([]);
  const [mcpTitle, setMcpTitle] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpDescription, setMcpDescription] = useState("");
  const [envInput, setEnvInput] = useState("");

  const cleanSlug = selectedApp ? selectedApp.id.replace("app-", "").toLowerCase() : "";
  const isMcp = cleanSlug.startsWith("mcp_") || cleanSlug.startsWith("mcp_toolbox_") || selectedApp?.type === "custom";
  const isServerActive = activeTools.some((t) => t.server === cleanSlug);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Synchronize dynamic active app with the Sidebar column 2
  useEffect(() => {
    if (selectedApp) {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: selectedApp })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("active-connect-app", { detail: null })
      );
    }
  }, [selectedApp]);

  useEffect(() => {
    const handleSelectApp = (e: any) => {
      const app = e.detail;
      if (app) {
        openAppDetailsModal(app);
      } else {
        setSelectedApp(null);
      }
    };
    window.addEventListener("select-connect-app", handleSelectApp);
    return () => window.removeEventListener("select-connect-app", handleSelectApp);
  }, [activeTools]);

  const fetchActiveTools = async () => {
    try {
      const res = await axios.get(`${API_URL}/mcp/tools/local`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.data.success) {
        setActiveTools(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch active tools", err);
    }
  };

  const openAppDetailsModal = async (app: AppIntegration) => {
    setSelectedApp(app);
    setAppTriggers([]);
    setAppTools([]);
    setModalTab("tools");
    setLoadingDetails(true);
    setMcpError(null);

    const slug = app.id.replace("app-", "");

    if (app.id === "custom-mcp-launcher") {
      setMcpName("");
      setMcpTitle("");
      setMcpDescription("");
      setCommand("npx");
      setArgsInput("");
      setEnvInput("");
      setLoadingDetails(false);
      return;
    }

    if (app.type === "custom") {
      const customConfig = customServersList.find(s => s.name === slug);
      if (customConfig) {
        setMcpName(customConfig.name);
        setMcpTitle(customConfig.title);
        setMcpDescription(customConfig.description);
        setCommand(customConfig.command);
        setArgsInput(customConfig.args.join(" "));
        const envStr = Object.entries(customConfig.env || {})
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");
        setEnvInput(envStr);
      }
      setLoadingDetails(false);
      return;
    }

    const isLocalMcp = slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_");

    if (isLocalMcp) {
      // Ingest Launcher Presets dynamically
      const preset = COMMAND_PRESETS[slug];
      if (preset) {
        setCommand(preset.command);
        setArgsInput(preset.args.join(" "));
      } else {
        setCommand("npx");
        setArgsInput(`-y @modelcontextprotocol/server-${slug.replace("mcp_", "")}`);
      }
      setLoadingDetails(false);
      return;
    }

    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const [triggersRes, toolsRes] = await Promise.all([
        axios
          .get(`${API_URL}/mcp/composio/triggers/${slug}`, { headers })
          .catch(() => ({ data: { success: false, data: [] } })),
        axios
          .get(`${API_URL}/mcp/composio/tools/${slug}`, { headers })
          .catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (triggersRes.data?.success) setAppTriggers(triggersRes.data.data);
      if (toolsRes.data?.success) setAppTools(toolsRes.data.data);
    } catch (err) {
      console.error("Failed to load app details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const fetchConnections = async () => {
      if (!accessToken) {
        setApps(FALLBACK_APPS);
        setLoading(false);
        return;
      }

      try {
        // Sync local active tools first
        await fetchActiveTools();

        // Fetch custom registered MCP servers
        let customServers: any[] = [];
        try {
          const customRes = await axios.get(`${API_URL}/mcp/custom`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (customRes.data && customRes.data.success) {
            customServers = customRes.data.data || [];
            setCustomServersList(customServers);
          }
        } catch (e) {
          console.error("Failed to fetch custom servers", e);
        }

        const res = await axios.get(`${API_URL}/mcp/composio/connections`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const connectedIds = new Set(
            res.data.data.map((c: any) =>
              (c.appId || c.toolkit || c.appName || "").toLowerCase(),
            ),
          );

          // Custom MCP Apps
          const customAppsMapped = customServers.map((s: any) => ({
            id: `app-${s.name}`,
            name: s.title,
            description: s.description,
            icon: "solar:server-square-bold",
            color: "bg-white border border-gray-200",
            status: activeTools.some((t: any) => t.server === s.name) ? ("connected" as const) : ("disconnected" as const),
            type: "custom" as const
          }));

          // Standard SaaS & Presets
          const standardAppsMapped = FALLBACK_APPS.map((app) => {
            const slug = app.id.replace("app-", "").toLowerCase();

            if (slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_")) {
              const active = activeTools.some((t: any) => t.server === slug);
              return { ...app, status: active ? ("connected" as const) : ("disconnected" as const) };
            }

            if (connectedIds.has(slug)) {
              return { ...app, status: "connected" as const };
            }
            if (app.status === "connecting") return app;

            return { ...app, status: "disconnected" as const };
          });

          // Sort all custom + standard apps alphabetically by name
          const otherAppsSorted = [...customAppsMapped, ...standardAppsMapped].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setApps(otherAppsSorted);
          window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        }
      } catch (err) {
        console.error("Failed to fetch connections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    const isConnecting = apps.some((a) => a.status === "connecting");
    if (isConnecting) {
      pollInterval = setInterval(fetchConnections, 3000);
    }

    return () => clearInterval(pollInterval);
  }, [apps.some((a) => a.status === "connecting"), accessToken, activeTools.length]);

  const handleConnect = async (id: string) => {
    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" as const } : app,
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      return next;
    });

    try {
      const slug = id.replace("app-", "");
      const res = await axios.post(
        `${API_URL}/mcp/composio/connect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
      );

      if (res.data && res.data.success && res.data.data?.redirectUrl) {
        window.open(res.data.data.redirectUrl, "_blank");
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      } else {
        throw new Error("No redirect URL returned from backend");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" as const } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    }
  };

  const handleLaunchMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    setMcpError(null);
    const slug = selectedApp.id.replace("app-", "");
    const parsedArgs = argsInput.trim() ? argsInput.split(/\s+/) : [];

    // Parse KEY=VALUE env input
    const parsedEnv: Record<string, string> = {};
    if (envInput.trim()) {
      envInput.split("\n").forEach(line => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();
          if (key) parsedEnv[key] = value;
        }
      });
    }

    try {
      await axios.post(
        `${API_URL}/mcp/connect`,
        {
          name: slug,
          command,
          args: parsedArgs,
          env: parsedEnv
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      await fetchActiveTools();
      // Sync local status mapping
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status: "connected" as const } : app
        )
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err: any) {
      setMcpError(err.response?.data?.message || "Launch failed. Ensure paths and commands are accurate.");
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDisconnectMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    const slug = selectedApp.id.replace("app-", "");

    try {
      // Direct REST dynamic transport disconnect triggers
      await axios.post(
        `${API_URL}/mcp/composio/disconnect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      await fetchActiveTools();
      setApps((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status: "disconnected" as const } : app
        )
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err) {
      console.error("Failed to disconnect server", err);
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleRegisterCustomMcp = async () => {
    if (!mcpName.trim() || !command.trim()) {
      setMcpError("Server slug name and launcher command are required.");
      return;
    }

    setIsMcpConnecting(true);
    setMcpError(null);

    const parsedEnv: Record<string, string> = {};
    if (envInput.trim()) {
      envInput.split("\n").forEach(line => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();
          if (key) parsedEnv[key] = value;
        }
      });
    }

    const parsedArgs = argsInput.trim() ? argsInput.split(/\s+/) : [];
    const cleanName = mcpName.trim().replace(/\s+/g, "_").toLowerCase();

    try {
      const res = await axios.post(
        `${API_URL}/mcp/custom`,
        {
          name: cleanName,
          title: mcpTitle.trim(),
          description: mcpDescription.trim(),
          command,
          args: parsedArgs,
          env: parsedEnv
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );

      if (res.data && res.data.success) {
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        
        const newAppId = `app-${cleanName}`;
        const newAppItem = {
          id: newAppId,
          name: mcpTitle.trim() || mcpName.trim(),
          description: mcpDescription.trim() || `Custom Model Context Protocol server running via ${command}`,
          icon: "solar:server-square-bold",
          color: "bg-white border border-gray-200",
          status: "disconnected" as const,
          type: "custom" as const
        };
        
        setSelectedApp(newAppItem);
        setMcpName("");
        setMcpTitle("");
        setMcpDescription("");
      }
    } catch (err: any) {
      setMcpError(err.response?.data?.message || "Failed to register custom MCP server.");
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDeleteCustomMcpServer = async () => {
    if (!selectedApp) return;
    setIsMcpConnecting(true);
    const slug = selectedApp.id.replace("app-", "");

    try {
      await axios.delete(
        `${API_URL}/mcp/custom/${slug}`,
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      setSelectedApp(null);
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
    } catch (err: any) {
      setMcpError(err.response?.data?.message || "Failed to delete custom server.");
    } finally {
      setIsMcpConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    setApps((prev) => {
      const next = prev.map((app) =>
        app.id === id ? { ...app, status: "connecting" as const } : app,
      );
      window.dispatchEvent(new CustomEvent("sync-connect-apps"));
      return next;
    });
    try {
      const slug = id.replace("app-", "");

      await axios.post(
        `${API_URL}/mcp/composio/disconnect`,
        { appName: slug },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
      );
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "disconnected" as const } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    } catch (err) {
      console.error("Disconnect failed:", err);
      setApps((prev) => {
        const next = prev.map((app) =>
          app.id === id ? { ...app, status: "connected" as const } : app,
        );
        window.dispatchEvent(new CustomEvent("sync-connect-apps"));
        return next;
      });
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "connected" && app.status === "connected");

    return matchesSearch && matchesTab;
  });

  // Extract tools belonging to the active MCP server
  const activeMcpTools = activeTools.filter((t) => t.server === cleanSlug);

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">


        {/* Master-Detail Split Screen Container */}
        <div className="flex flex-1 w-full overflow-hidden bg-white dark:bg-[#0A0A0A]">
          {/* Right Column: Center Presentation Area */}
          <div className="flex-1 bg-white dark:bg-[#0A0A0A] flex flex-col h-full overflow-y-auto relative">
            <AnimatePresence mode="wait">
              {!selectedApp ? (
                /* Idle Hub View */
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 flex flex-col items-center justify-start p-8 ${
                    idleTab === "mcp-explorer" ? "max-w-5xl" : "max-w-2xl"
                  } mx-auto text-center gap-8 min-h-full py-12 w-full`}
                >
                  {/* Sliding Tab Pill Selector */}
                  <div className="flex-none p-1 bg-default-100 dark:bg-default-50/5 rounded-full flex gap-1 items-center relative shadow-inner mb-2 border border-default-200/50">
                    <button
                      onClick={() => setIdleTab("action-hub")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                        idleTab === "action-hub"
                          ? "bg-white dark:bg-default-200 text-default-900 shadow-sm"
                          : "text-default-500 hover:text-default-800"
                      }`}
                    >
                      <Icon icon="solar:stars-line-bold" />
                      <span>Isolated Action Hub</span>
                    </button>
                    <button
                      onClick={() => setIdleTab("mcp-explorer")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                        idleTab === "mcp-explorer"
                          ? "bg-white dark:bg-default-200 text-default-900 shadow-sm"
                          : "text-default-500 hover:text-default-800"
                      }`}
                    >
                      <Icon icon="mdi:github" />
                      <span>MCP Repositories Explorer</span>
                    </button>
                  </div>

                  {idleTab === "action-hub" ? (
                    <>
                      <div className="flex flex-col items-center gap-4">
                        {/* Blue Spars Circle Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white bg-gradient-to-br from-primary to-indigo-600 shrink-0">
                          <Icon icon="solar:stars-line-bold" className="text-3xl" />
                        </div>

                        <h2 className="text-2xl font-bold text-default-900 tracking-tight">
                          Isolated Action Hub
                        </h2>
                        <p className="text-sm text-default-500 max-w-md leading-relaxed">
                          Connect and prompt individual web applications securely. Select an application in the sidebar to configure authentication and interact with its tools in a focused, zero-hallucination agent session.
                        </p>
                      </div>

                      {/* Dual Bottom Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
                        <div className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-2.5 bg-[#f4f4f5]/30 dark:bg-default-50/5 hover:border-default-300 dark:hover:border-default-100 transition-all">
                          <div className="flex items-center gap-2 text-primary">
                            <Icon icon="solar:shield-keyhole-bold" className="text-xl" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              100% Isolated Scoping
                            </span>
                          </div>
                          <p className="text-xs text-default-500 leading-normal">
                            Tools are locked dynamically to ensure strict deterministic execution.
                          </p>
                        </div>

                        <div className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-2.5 bg-[#f4f4f5]/30 dark:bg-default-50/5 hover:border-default-300 dark:hover:border-default-100 transition-all">
                          <div className="flex items-center gap-2 text-primary">
                            <Icon icon="solar:key-bold" className="text-xl" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Composio MCP Auth
                            </span>
                          </div>
                          <p className="text-xs text-default-500 leading-normal">
                            Universal OAuth management handles complex authentications seamlessly.
                          </p>
                        </div>

                        <div className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-2.5 bg-[#f4f4f5]/30 dark:bg-default-50/5 hover:border-default-300 dark:hover:border-default-100 transition-all">
                          <div className="flex items-center gap-2 text-success">
                            <Icon icon="solar:verified-check-bold" className="text-xl" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Data Privacy Guarantee
                            </span>
                          </div>
                          <p className="text-xs text-default-500 leading-normal">
                            SOC2/HIPAA compliant architecture. Zero data retention and strict no-training policies enforced.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Deeply Integrated MCP Explorer View */
                    <div className="w-full flex flex-col gap-6 text-left">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-default-900 tracking-tight flex items-center gap-2">
                          <Icon icon="logos:mcp" className="text-2xl animate-pulse" />
                          <span>Official MCP Repositories Explorer</span>
                        </h2>
                        <p className="text-xs text-default-500 max-w-2xl leading-relaxed">
                          Browse and integrate official, secure repositories directly from the <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">modelcontextprotocol</a> organization. All reference packages are fully licensed under Apache-2.0 or MIT for open enterprise deployment.
                        </p>
                      </div>

                      {/* Repos Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {MCP_REPOS.map((repo) => (
                          <div
                            key={repo.name}
                            className="p-5 border border-default-200 dark:border-default-100/50 rounded-2xl flex flex-col gap-3 bg-[#f4f4f5]/30 dark:bg-[#0E0E10]/30 hover:border-default-300 dark:hover:border-default-100 transition-all relative overflow-hidden group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${repo.color} flex items-center justify-center text-white text-base shadow-sm`}>
                                  <Icon icon={repo.icon} />
                                </div>
                                <div className="flex flex-col">
                                  <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-bold text-default-900 hover:text-primary transition-colors flex items-center gap-1"
                                  >
                                    <span>{repo.name}</span>
                                    <Icon icon="solar:arrow-left-up-bold" className="rotate-90 text-[10px]" />
                                  </a>
                                  <span className="text-[10px] text-default-400 font-medium">{repo.lang}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                repo.license.includes("Apache") 
                                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              }`}>
                                {repo.license}
                              </span>
                            </div>

                            <p className="text-xs text-default-500 leading-normal min-h-[36px]">
                              {repo.description}
                            </p>

                            {/* Command Install Block */}
                            <div className="flex items-center justify-between gap-2 p-2 bg-[#f4f4f5] dark:bg-[#0F0F11] rounded-lg border border-default-200/50 dark:border-default-100/20 select-all font-mono text-[10px] text-default-600 dark:text-default-400">
                              <span className="truncate">{repo.install}</span>
                              <button
                                onClick={() => handleCopy(repo.install)}
                                className="flex-none p-1 rounded hover:bg-default-200 dark:hover:bg-default-100 text-default-400 hover:text-default-800 transition-all"
                              >
                                <Icon
                                  icon={copiedText === repo.install ? "solar:check-read-bold" : "solar:copy-bold"}
                                  className={copiedText === repo.install ? "text-emerald-500 animate-bounce" : "text-sm"}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : isMcp ? (
                /* MCP Server Details Panel (Studio Presets + Stdio Transport Configs) */
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                >
                  {mcpError && (
                    <AlertWrapper className="w-full" variant="danger">
                      <div className="flex items-center gap-2 text-xs">
                        <Icon icon="solar:danger-triangle-bold" />
                        <span>{mcpError}</span>
                      </div>
                    </AlertWrapper>
                  )}

                  {selectedApp.id === "custom-mcp-launcher" ? (
                    /* 🆕 ADD CUSTOM MCP SERVER FORM */
                    <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col gap-6">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                          <Icon icon="solar:add-circle-bold" className="text-2xl animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl font-bold text-default-900">Add Custom MCP Server</h2>
                          <p className="text-xs text-default-500 max-w-sm">
                            Configure standard input/output transport parameters to launch and dynamically register any local or community MCP server.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Input
                          label="Display Title"
                          placeholder="e.g. Local Database SQLite"
                          value={mcpTitle}
                          variant="bordered"
                          onValueChange={setMcpTitle}
                          isRequired
                        />
                        
                        <div className="flex gap-4">
                          <Input
                            className="w-1/2"
                            label="Server Slug ID"
                            placeholder="e.g. local_sqlite"
                            value={mcpName}
                            variant="bordered"
                            onValueChange={setMcpName}
                            isRequired
                          />
                          <Input
                            className="w-1/2"
                            label="Command"
                            placeholder="npx"
                            value={command}
                            variant="bordered"
                            onValueChange={setCommand}
                            isRequired
                          />
                        </div>

                        <Input
                          label="Description"
                          placeholder="Brief description of capabilities exposed by this server"
                          value={mcpDescription}
                          variant="bordered"
                          onValueChange={setMcpDescription}
                        />

                        <Input
                          label="Arguments"
                          placeholder="e.g. -y @modelcontextprotocol/server-sqlite --file db.sqlite"
                          value={argsInput}
                          variant="bordered"
                          onValueChange={setArgsInput}
                        />

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-default-600 pl-1">Environment Variables (Optional)</label>
                          <textarea
                            placeholder="KEY=VALUE&#10;GITHUB_TOKEN=token123"
                            value={envInput}
                            onChange={(e) => setEnvInput(e.target.value)}
                            className="w-full h-24 p-3 bg-transparent border border-default-200 dark:border-default-100 rounded-xl font-mono text-[10px] text-default-800 focus:outline-none focus:border-primary placeholder:text-default-400"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isMcpConnecting}
                          onClick={handleRegisterCustomMcp}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 mt-2"
                        >
                          {isMcpConnecting ? (
                            <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />
                          ) : (
                            <Icon icon="solar:disk-bold" className="text-base" />
                          )}
                          Register & Launch Server
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EXISTING PRESETS OR CUSTOM SERVERS */
                    <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                        <AppIcon app={selectedApp} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex flex-col gap-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-xl font-bold text-default-900">
                            {selectedApp.name}
                          </h2>
                          {isServerActive && (
                            <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] font-semibold">
                              Active
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-default-400 font-mono">
                          source: {cleanSlug}
                        </p>
                        <p className="text-xs text-default-500 leading-relaxed px-2 mt-2">
                          {selectedApp.description}
                        </p>
                      </div>

                      {/* Stdio Transport Parameters input fields */}
                      <div className="w-full flex flex-col gap-3">
                        <div className="flex gap-3">
                          <Input
                            className="w-1/3"
                            label="Command"
                            placeholder="npx"
                            value={command}
                            variant="bordered"
                            onValueChange={setCommand}
                          />
                          <Input
                            className="w-2/3"
                            label="Arguments"
                            placeholder="-y @modelcontextprotocol/server-sqlite"
                            value={argsInput}
                            variant="bordered"
                            onValueChange={setArgsInput}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 mt-1">
                          <label className="text-[11px] font-semibold text-default-600 pl-1">Environment Variables (Optional)</label>
                          <textarea
                            placeholder="KEY=VALUE&#10;GITHUB_TOKEN=token123"
                            value={envInput}
                            onChange={(e) => setEnvInput(e.target.value)}
                            className="w-full h-20 p-2.5 bg-transparent border border-default-200 dark:border-default-100 rounded-xl font-mono text-[10px] text-default-800 focus:outline-none focus:border-primary placeholder:text-default-400"
                          />
                        </div>

                        {isServerActive ? (
                          <button
                            type="button"
                            disabled={isMcpConnecting}
                            onClick={handleDisconnectMcpServer}
                            className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20 mt-2"
                          >
                            {isMcpConnecting ? (
                              <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />
                            ) : (
                              <Icon icon="solar:stop-circle-bold" className="text-base" />
                            )}
                            Stop MCP Server
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isMcpConnecting}
                            onClick={handleLaunchMcpServer}
                            className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 mt-2"
                          >
                            {isMcpConnecting ? (
                              <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />
                            ) : (
                              <Icon icon="solar:play-circle-bold" className="text-base" />
                            )}
                            Launch MCP Server
                          </button>
                        )}

                        {selectedApp.type === "custom" && (
                          <button
                            type="button"
                            disabled={isMcpConnecting}
                            onClick={handleDeleteCustomMcpServer}
                            className="w-full font-bold text-xs h-10 rounded-xl bg-default-100 hover:bg-danger/10 hover:text-danger active:scale-95 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-danger/20 mt-1"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                            Delete Custom Integration
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                        <Icon icon="solar:server-square-bold" className="text-xs text-primary" />
                        Ingested seamlessly via secure Stdio pipeline
                      </div>
                    </div>
                  )}

                  {/* Ingested Server Tools Tab list */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        type="button"
                        className="pb-2.5 text-xs font-bold border-b-2 border-primary text-primary px-1"
                      >
                        Ingested Capabilities ({activeMcpTools.length})
                      </button>
                    </div>

                    <div className="w-full">
                      {activeMcpTools.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                          <span className="text-xs text-default-400 italic">
                            {isServerActive 
                              ? "No tools registered for this active server."
                              : "Launch the MCP server to dynamically ingest its standard capabilities."}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {activeMcpTools.map((tool) => (
                            <div
                              key={tool.name}
                              className="flex flex-col p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="text-primary text-base shrink-0" icon="solar:bolt-circle-bold" />
                                <p className="font-bold text-xs text-default-800 truncate">{tool.name}</p>
                              </div>
                              <p className="text-[11px] text-default-500 leading-normal pl-6">
                                {tool.description}
                              </p>
                              {tool.inputSchema?.required && (
                                <div className="flex gap-1.5 flex-wrap mt-2 pl-6">
                                  {tool.inputSchema.required.map((req: string) => (
                                    <Chip key={req} size="sm" color="danger" variant="flat" className="h-4 text-[8px] px-1.5 font-mono">
                                      {req}*
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Selected App Connection details & Capabilities */
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-start p-8 max-w-xl mx-auto w-full gap-6 min-h-full py-12"
                >
                  {/* Connect App Card Wrapper */}
                  <div className="w-full p-8 border border-default-200 dark:border-default-100/50 bg-[#F9F9FB]/50 dark:bg-[#0E0E10]/30 rounded-3xl shadow-sm flex flex-col items-center text-center gap-6">
                    {/* App logo inside custom box */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-black border border-default-200 dark:border-default-100/50 shadow-sm shrink-0 overflow-hidden">
                      <AppIcon app={selectedApp} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl font-bold text-default-900">
                        Connect {selectedApp.name}
                      </h2>
                      <p className="text-xs text-default-500 leading-relaxed px-2">
                        Integrate {selectedApp.name} to seamlessly execute automated workflows, synchronize data, and orchestrate {selectedApp.name} actions directly within Alti.
                      </p>
                    </div>

                    {/* Authorize button triggers */}
                    <div className="w-full">
                      {selectedApp.status === "disconnected" ? (
                        <button
                          type="button"
                          onClick={() => handleConnect(selectedApp.id)}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                        >
                          <Icon icon="solar:key-bold" className="text-base" />
                          Authorize Connection
                        </button>
                      ) : selectedApp.status === "connecting" ? (
                        <button
                          disabled
                          type="button"
                          className="w-full font-bold text-sm h-12 rounded-xl bg-default-100 dark:bg-default-200 text-default-400 flex items-center justify-center gap-2 cursor-wait"
                        >
                          <Icon icon="line-md:loading-twotone-loop" className="text-base" />
                          Authenticating Connection...
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(selectedApp.id)}
                          className="w-full font-bold text-sm h-12 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-danger/20"
                        >
                          Disconnect Connection
                        </button>
                      )}
                    </div>

                    {/* Footnote */}
                    <div className="flex items-center gap-1.5 text-[10px] text-default-400 font-medium">
                      <Icon icon="solar:lock-bold" className="text-xs" />
                      Authenticated securely via Composio protocol
                    </div>
                  </div>

                  {/* Capabilities Accordion Tab Views inside the details page */}
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <div className="flex border-b border-default-200 dark:border-default-100/50">
                      <button
                        type="button"
                        className={`pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "tools"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        onClick={() => setModalTab("tools")}
                      >
                        Capabilities (Tools)
                      </button>
                      <button
                        type="button"
                        className={`ml-6 pb-2.5 text-xs font-bold border-b-2 transition-colors px-1 ${
                          modalTab === "triggers"
                            ? "border-primary text-primary"
                            : "border-transparent text-default-400 hover:text-default-700"
                        }`}
                        onClick={() => setModalTab("triggers")}
                      >
                        Webhooks (Triggers)
                      </button>
                    </div>

                    {/* Tab contents list */}
                    <div className="w-full">
                      {loadingDetails ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                          <Icon className="text-xl text-primary animate-spin" icon="line-md:loading-twotone-loop" />
                          <span className="text-[11px] text-default-400">Syncing with Composio...</span>
                        </div>
                      ) : modalTab === "tools" ? (
                        appTools.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                            <span className="text-xs text-default-400">No capabilities found</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {appTools.map((tool) => (
                              <div
                                key={tool.id}
                                className="flex flex-col p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="text-primary text-base shrink-0" icon="solar:bolt-circle-bold" />
                                  <p className="font-bold text-xs text-default-800 truncate">{tool.name}</p>
                                </div>
                                <p className="text-[11px] text-default-500 leading-normal pl-6">
                                  {tool.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )
                      ) : appTriggers.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-default-200 dark:border-default-100 rounded-2xl">
                          <span className="text-xs text-default-400">No webhooks found</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {appTriggers.map((trigger) => (
                            <div
                              key={trigger.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl border border-default-200 dark:border-default-100 bg-[#F9F9FB]/30 dark:bg-default-50/5 hover:border-primary/20 transition-all"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="font-bold text-xs text-default-800 truncate mb-0.5">{trigger.name}</p>
                                <p className="text-[9px] text-default-400 font-mono truncate">{trigger.id}</p>
                              </div>
                              <button className="px-3 h-7 bg-default-100 hover:bg-success hover:text-white rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider shrink-0">
                                Enable
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
