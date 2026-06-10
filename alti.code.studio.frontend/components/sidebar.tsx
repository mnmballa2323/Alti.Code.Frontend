"use client";

import type { ComponentProps } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  cn,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Input,
} from "@heroui/react";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Search,
  ChevronDown,
  BookOpen,
  Shield,
  Plus,
  Code,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Cloud,
  Server,
  LayoutGrid,
  Bot,
  Database,
} from "lucide-react";
import { useSession } from "next-auth/react";

import MyAccountDropdown from "./MyAccountDropdown";

import {
  removeRepository,
  removeDocument,
  setActiveWorkspace,
} from "@/store/systemSlice";
import { RootState } from "@/store";
import { useModalStore } from "@/store/useModalStore";
import useFetchChatHistory from "@/hooks/useFetchChatHistory";
import { startNewChat } from "@/store/messagesSlice";
import { SAAS_MOCKS } from "@/app/connect-apps/catalog";

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

const SUPPORTED_DATABASES = [
  { id: "aerospike", name: "Aerospike", icon: "logos:aerospike-icon" },
  { id: "alloydb", name: "AlloyDB", icon: "logos:google-cloud" },
  { id: "amazon-aurora", name: "Amazon Aurora", icon: "logos:aws-aurora" },
  { id: "bigquery", name: "BigQuery", icon: "gcp:bigquery" },
  { id: "bigtable", name: "Bigtable", icon: "logos:google-cloud" },
  { id: "cassandra", name: "Cassandra", icon: "logos:cassandra" },
  { id: "chroma", name: "Chroma", icon: "logos:chroma" },
  { id: "clickhouse", name: "ClickHouse", icon: "logos:clickhouse" },
  { id: "cockroachdb", name: "CockroachDB", icon: "logos:cockroachlabs" },
  { id: "cosmosdb", name: "Cosmos DB", icon: "logos:cosmos" },
  { id: "couchbase", name: "Couchbase", icon: "logos:couchbase" },
  { id: "couchdb", name: "CouchDB", icon: "logos:couchdb" },
  { id: "databricks", name: "Databricks", icon: "simple-icons:databricks" },
  { id: "dgraph", name: "Dgraph", icon: "simple-icons:dgraph" },
  { id: "dynamodb", name: "DynamoDB", icon: "logos:aws-dynamodb" },
  { id: "elasticsearch", name: "Elasticsearch", icon: "logos:elasticsearch" },
  { id: "firestore", name: "Firestore", icon: "gcp:firestore" },
  { id: "ibm-db2", name: "IBM Db2", icon: "logos:ibm" },
  { id: "influxdb", name: "InfluxDB", icon: "logos:influxdb" },
  {
    id: "knowledge-catalog",
    name: "Knowledge Catalog",
    icon: "carbon:ibm-watson-knowledge-catalog",
  },
  { id: "looker", name: "Looker", icon: "logos:looker" },
  { id: "mariadb", name: "MariaDB", icon: "logos:mariadb" },
  { id: "memcached", name: "Memcached", icon: "logos:memcached" },
  { id: "milvus", name: "Milvus", icon: "logos:milvus" },
  { id: "mongodb", name: "MongoDB", icon: "logos:mongodb-icon" },
  { id: "mysql", name: "MySQL", icon: "logos:mysql" },
  { id: "neo4j", name: "Neo4j", icon: "logos:neo4j" },
  { id: "neon", name: "Neon", icon: "logos:neon-icon" },
  { id: "oracle", name: "Oracle", icon: "logos:oracle" },
  { id: "pinecone", name: "Pinecone", icon: "logos:pinecone" },
  { id: "planetscale", name: "PlanetScale", icon: "logos:planetscale" },
  { id: "postgresql", name: "PostgreSQL", icon: "logos:postgresql" },
  { id: "prometheus", name: "Prometheus", icon: "logos:prometheus" },
  { id: "qdrant", name: "Qdrant", icon: "logos:qdrant" },
  { id: "redis", name: "Redis", icon: "logos:redis" },
  { id: "redshift", name: "Redshift", icon: "logos:aws-redshift" },
  { id: "sap-hana", name: "SAP HANA", icon: "logos:sap" },
  { id: "singlestore", name: "SingleStore", icon: "simple-icons:singlestore" },
  { id: "snowflake", name: "Snowflake", icon: "logos:snowflake-icon" },
  { id: "spanner", name: "Spanner", icon: "gcp:cloud-spanner" },
  { id: "sqlserver", name: "SQL Server", icon: "devicon:microsoftsqlserver" },
  { id: "sqlite", name: "SQLite", icon: "logos:sqlite" },
  { id: "supabase", name: "Supabase", icon: "logos:supabase-icon" },
  { id: "teradata", name: "Teradata", icon: "simple-icons:teradata" },
  { id: "tidb", name: "TiDB", icon: "simple-icons:tidb" },
  { id: "timescaledb", name: "TimescaleDB", icon: "logos:timescaledb" },
  { id: "trino", name: "Trino", icon: "logos:trino" },
  { id: "valkey", name: "Valkey", icon: "simple-icons:valkey" },
  { id: "weaviate", name: "Weaviate", icon: "logos:weaviate" },
  { id: "yugabytedb", name: "YugabyteDB", icon: "logos:yugabyte" },
];

const AppIcon = ({
  app,
  className = "w-8 h-8",
}: {
  app: AppIntegration;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  if (app.id === "custom-mcp-launcher") {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-primary/10 text-primary rounded-lg",
          className,
        )}
      >
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
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Amazon DynamoDB</title>
        <path
          d="M16.606 20.705v-2.371c-1.263 1.082-3.884 1.795-7.066 1.795-3.184 0-5.805-.714-7.068-1.797v2.369c0 1.168 2.903 2.47 7.068 2.47 4.16 0 7.06-1.3 7.066-2.466zm.001-6.765l.817-.005v.005c0 .517-.258.998-.75 1.441.601.54.75 1.071.75 1.449a1661.7 1661.7 0 0 0 0 3.87c0 1.881-3.389 3.3-7.884 3.3-4.471 0-7.846-1.404-7.88-3.27a583.119 583.119 0 0 1-.003-3.909c.001-.375.15-.9.745-1.437-.592-.538-.743-1.062-.746-1.435v-3.892c.002-.377.153-.903.747-1.438-.593-.54-.744-1.062-.747-1.435 0-1.357-.002-2.735.002-3.897C1.674 1.412 5.056 0 9.54 0c2.159 0 4.233.356 5.689.974l-.315.766c-1.36-.58-3.319-.91-5.374-.91-4.165 0-7.067 1.3-7.067 2.47 0 1.168 2.902 2.47 7.067 2.47.115 0 .222 0 .334-.005l.033.828c-.122.006-.245.006-.367.006-3.184 0-5.805-.714-7.068-1.798v2.38c.005.45.45.843.821 1.093 1.116.736 3.114 1.239 5.34 1.342l-.037.829c-2.254-.105-4.23-.59-5.5-1.332-.318.245-.623.573-.623.952 0 1.168 2.902 2.47 7.067 2.47.411 0 .812-.014 1.203-.042l.06.826c-.41.03-.833.045-1.263.045-3.184 0-5.805-.713-7.068-1.797v2.368c.005.462.449.855.821 1.104 1.275.842 3.67 1.366 6.247 1.366h.182v.83H9.54c-2.62 0-4.99-.507-6.444-1.359-.317.245-.623.574-.623.954 0 1.168 2.902 2.47 7.067 2.47 4.159 0 7.058-1.298 7.066-2.465v-.007c0-.377-.303-.705-.62-.948a5.732 5.732 0 0 1-.662.336l-.316-.764c.3-.128.56-.266.776-.412.376-.254.823-.651.823-1.1zm4.377-6.915h-2.717a.406.406 0 0 1-.332-.173.42.42 0 0 1-.055-.375l1.204-3.597h-5.403l-2.583 4.974h2.623c.128 0 .248.06.325.164a.418.418 0 0 1 .069.36l-2.249 8.365zm1.249-.128l-10.89 11.608a.408.408 0 0 1-.498.075.418.418 0 0 1-.192-.471l2.534-9.426h-2.766a.407.407 0 0 1-.349-.2.418.418 0 0 1-.012-.407l3.014-5.804a.408.408 0 0 1 .36-.222h6.22c.132 0 .256.065.332.174a.422.422 0 0 1 .055.374l-1.204 3.598h3.1c.164 0 .31.099.375.251a.422.422 0 0 1-.08.45zM3.085 20.723a8.107 8.107 0 0 0 1.72.72l.233-.794a7.32 7.32 0 0 1-1.546-.645zm1.72-5.984l.233-.795a7.262 7.262 0 0 1-1.546-.646l-.407.72a8.051 8.051 0 0 0 1.72.72zm-1.72-7.427l.407-.719c.418.244.939.462 1.546.646l-.232.794a8.046 8.046 0 0 1-1.72-.72Z"
          fill="#4053D6"
        />
      </svg>
    ),
    ansible: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Ansible</title>
        <path
          d="M10.617 11.473l4.686 3.695-3.102-7.662zM12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zm5.797 17.305c-.011.471-.403.842-.875.83-.236 0-.416-.09-.664-.293l-6.19-5-2.079 5.203H6.191L11.438 5.44c.124-.314.427-.52.764-.506.326-.014.63.189.742.506l4.774 11.494c.045.111.08.234.08.348-.001.009-.001.009-.001.023z"
          fill="#EE0000"
        />
      </svg>
    ),
    anthropic: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Anthropic</title>
        <path
          d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"
          fill="#191919"
        />
      </svg>
    ),
    apollo_graphql: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Apollo GraphQL</title>
        <path
          d="M12,0C5.372,0 0,5.373 0,12 0,18.628 5.372,24 12,24 18.627,24 24,18.628 24,12A12.014,12.014 0 0 0 23.527,8.657 0.6,0.6 0 0 0 22.4,9.066H22.398C22.663,10.009 22.8,10.994 22.8,12A10.73,10.73 0 0 1 19.637,19.637 10.729,10.729 0 0 1 12,22.8 10.73,10.73 0 0 1 4.363,19.637 10.728,10.728 0 0 1 1.2,12 10.73,10.73 0 0 1 4.363,4.363 10.728,10.728 0 0 1 12,1.2C14.576,1.2 17.013,2.096 18.958,3.74A1.466,1.466 0 1 0 19.82,2.9 11.953,11.953 0 0 0 12,0ZM10.56,5.88 6.36,16.782H8.99L9.677,14.934H13.646L12.927,12.892H10.314L12.014,8.201 15.038,16.781H17.669L13.47,5.88Z"
          fill="#311C87"
        />
      </svg>
    ),
    argocd: (
      <svg
        className="w-full h-full p-0.5 object-contain"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>ArgoCD</title>
        <path
          d="M12.581 0c.436.037.871.1 1.299.186 1.679.383 3.121 1.213 4.382 2.365 1.161 1.06 1.917 2.372 2.335 3.881.089.321.216.56.586.624.205.035.238.245.239.43.003.646.002 1.294.002 1.94l-.002 1.21c-.001.356-.116.479-.466.474-.211-.003-.293.119-.344.291-.146.489-.33.966-.552 1.426-.818 1.682-2.084 2.938-3.688 3.87-.077.045-.155.088-.233.131-.252.137-.258.146-.155.415.114.299.358.529.664.625.269.096.553.134.827.21a.672.672 0 0 1 .236.094c-.066.082-.156.067-.231.082-.36.073-.713.184-1.086.17a1.275 1.275 0 0 1-.438-.064c-.114-.045-.152-.006-.176.109a5.354 5.354 0 0 0-.084.92c-.015.617-.071 1.23-.112 1.844-.042.598-.018.651.558.842.281.094.563.187.842.286.069.024.15.038.192.117-.04.057-.098.035-.146.035-.493.003-.985.005-1.478.001-.524-.005-.806-.282-.845-.803-.055-.762-.12-1.524-.182-2.286a.947.947 0 0 0-.026-.12c-.079.455-.065.879-.084 1.298-.023.528-.008 1.057-.007 1.584 0 .27.086.388.335.483.359.135.711.295 1.114.262.141-.012.276.062.402.129.032.017.073.033.069.073-.004.043-.049.047-.084.045-.657-.019-1.317.065-1.972-.028-.323-.046-.533-.236-.631-.552-.094-.303-.114-.617-.137-.93-.046-.626-.078-1.253-.116-1.88a.222.222 0 0 0-.061-.171.282.282 0 0 0-.031.193c-.002.956-.002 1.911-.001 2.866 0 .388.123.575.494.708.481.172.976.298 1.47.423.11.028.225.047.242.192h-1.852c-.051-.01-.103-.022-.155-.03-.701-.1-1.001-.372-1.143-1.042l-.067-.331-.226-1.103c-.069.12-.118.25-.144.386-.083.399-.151.802-.243 1.2-.113.493-.444.763-.932.857l-.33.063H8.558c.057-.171.216-.185.355-.221.476-.127.96-.223 1.417-.409a.603.603 0 0 0 .397-.521c.058-.435.002-.865-.013-1.296a1.528 1.528 0 0 0-.078-.315.405.405 0 0 0-.071.207c-.026.296-.049.591-.075.886-.038.432-.273.716-.679.81a1.702 1.702 0 0 1-.37.045c-.557.003-1.115-.001-1.673-.005-.048 0-.109.019-.148-.065.178-.103.377-.168.582-.187a5.67 5.67 0 0 0 .939-.193c.42-.114.522-.249.512-.687-.023-.931-.091-1.86-.069-2.791.004-.184.001-.368.001-.551a2.387 2.387 0 0 0-.05.385 40.299 40.299 0 0 1-.186 2.623c-.052.513-.296.748-.804.805-.446.051-.889.002-1.332-.02-.108-.006-.234.012-.339-.064.043-.066.106-.07.16-.087.362-.115.725-.224 1.086-.344.246-.081.35-.235.355-.492a2.241 2.241 0 0 0-.003-.232 45.315 45.315 0 0 1-.105-2.149 5.487 5.487 0 0 0-.035-.478c-.024-.188-.131-.287-.295-.258-.505.092-.99-.006-1.473-.139-.059-.016-.134-.007-.178-.088a.986.986 0 0 1 .285-.09c.255-.052.507-.121.753-.208.312-.112.564-.347.695-.651.089-.203.056-.317-.112-.398-1.418-.683-2.512-1.73-3.391-3.017a8.152 8.152 0 0 1-1.123-2.447c-.067-.246-.156-.3-.383-.26-.306.053-.401.006-.535-.273v-3.49c.144-.303.205-.341.534-.329.235.01.247-.004.309-.242.396-1.508 1.082-2.861 2.171-3.988C6.9 1.42 8.523.631 10.34.203c.456-.108.922-.15 1.387-.203h.854Zm7.974 8.948a7.34 7.34 0 0 0-.048-.938 8.353 8.353 0 0 0-.099-.65c-.598-2.964-2.344-5.02-5.051-6.268-1.553-.715-3.21-.835-4.878-.511-3.248.633-5.396 2.583-6.539 5.652-.436 1.173-.495 2.406-.37 3.65.087.935.339 1.846.745 2.694.585 1.213 1.444 2.207 2.477 3.058.343.286.719.528 1.121.719.235.111.247.105.245-.146.006-.16.003-.32-.009-.48-.125-1.02-.142-2.045-.169-3.069a.392.392 0 0 0-.184-.353c-.385-.268-.713-.592-.921-1.019-.474-.97-.372-2.361.813-3.215.136-.097.217-.19.198-.373a1.724 1.724 0 0 1 .031-.442c.177-1.187.748-2.138 1.722-2.84.68-.492 1.442-.772 2.286-.782.483-.007.953.11 1.414.244 1.609.467 2.846 2.07 2.845 3.697a.64.64 0 0 0 .268.565c.463.371.821.83.943 1.426.22 1.077-.083 1.982-.979 2.634-.266.194-.347.406-.333.698.002.047 0 .095-.002.142l-.062 1.439c-.025.586-.138 1.165-.117 1.754.008.223.006.226.201.128a7.46 7.46 0 0 0 2.393-1.903c1.32-1.577 2.074-3.372 2.059-5.511ZM9.117 12.102c1.489.021 2.443-1.578 1.716-2.879a1.937 1.937 0 0 0-1.699-.991c-1.094-.004-1.954.822-1.958 1.881-.005 1.148.813 1.985 1.941 1.989Zm5.794 0c1.101.002 1.935-.823 1.935-1.917 0-1.091-.846-1.949-1.92-1.947-1.064.003-1.94.866-1.943 1.915-.003 1.105.831 1.948 1.928 1.949Zm-1.472 1.937c-.208.128-.407.277-.63.384-.536.257-1.063.257-1.579-.048-.158-.094-.308-.201-.464-.298-.047-.028-.092-.103-.15-.062-.044.03-.01.1-.001.151.037.179.064.362.082.544.027.565.293.992.742 1.31a.984.984 0 0 0 .791.186c.565-.119 1.025-.614 1.124-1.218.043-.266.005-.544.109-.803a.133.133 0 0 0-.024-.146Zm-8.78-4.92c-.012-1.102.143-2.055.54-2.961.633-1.443 1.642-2.553 2.98-3.374a.378.378 0 0 1 .459.067c.06.06.036.118.01.178a1.09 1.09 0 0 1-.48.51c-1.079.639-1.829 1.571-2.357 2.688a6.325 6.325 0 0 0-.618 2.986c.055 1.309.439 2.516 1.213 3.588.088.104.148.23.173.365.01.08.059.168-.031.228a.312.312 0 0 1-.288.041.502.502 0 0 1-.234-.185c-.72-.979-1.193-2.056-1.331-3.273-.036-.326-.004-.653-.036-.858ZM8.94 2.34a.373.373 0 0 1 .378-.382c.211.001.409.226.416.473.004.138-.309.39-.476.386-.189-.005-.318-.2-.318-.477Zm-.465 7.48a.609.609 0 0 1 .586-.631c.38-.003.671.271.675.633.004.356-.27.622-.639.621-.38-.002-.621-.241-.622-.623Zm6.496.623c-.381-.002-.625-.255-.621-.646a.635.635 0 0 1 .596-.613.656.656 0 0 1 .669.643c.001.354-.275.618-.644.616Z"
          fill="#EF6A39"
        />
      </svg>
    ),
  };

  if (localSVGRegistry[cleanSlug]) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center bg-transparent shrink-0",
          className,
        )}
      >
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
    const simpleIconBrand =
      simpleIconsMapping[cleanSlug] || cleanSlug.replace(/_/g, "");

    addUrl(
      `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${simpleIconBrand}.svg`,
    );
    addUrl(
      `https://unpkg.com/simple-icons@latest/icons/${simpleIconBrand}.svg`,
    );
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
        alt={`${app.name} logo`}
        className={cn(className, "object-contain p-0.5 rounded-lg shrink-0")}
        src={currentLogoUrl}
        onError={handleImageError}
      />
    );
  }

  // Fallback 1: System custom server icon
  if (app.type === "custom") {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0",
          className,
        )}
      >
        <Server className="size-4 text-white shrink-0" />
      </div>
    );
  }

  // Fallback 2: Ultimate bulletproof initials box (strictly bypasses broken Iconify components to ensure no blank circles!)
  const initials = app.name.slice(0, 2).toUpperCase();
  const gradientClass = getAvatarColor(app.name);

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold text-[10px] bg-gradient-to-br tracking-tight shrink-0",
        gradientClass,
        className,
      )}
    >
      {initials}
    </div>
  );
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
    description:
      "Modern issue tracking and project management for software teams.",
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
    id: "salesforce",
    name: "Salesforce",
    description:
      "CRM integration to manage leads, contacts, and custom objects.",
    icon: "logos:salesforce",
    color: "bg-white border border-gray-200",
    status: "disconnected",
    type: "official",
  },
  {
    id: "discord",
    name: "Discord",
    description:
      "Interact with community channels, manage roles, and deploy bots.",
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
      description: `Seamlessly connect and automate workflows directly with ${mockApp.name}.`,
      icon: mockApp.icon,
      color: "bg-white border border-gray-200",
      status: "disconnected" as const,
      type: "official" as const,
    }),
  ),
].sort((a, b) => a.name.localeCompare(b.name));

import { AppDispatch } from "@/store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Define types for the responses
type AiItem = {
  _id: string;
  prompt: string;
  reply: string;
};

type AiSession = {
  _id: string;
  user?: string;
  sessionId?: string;
  createdAt: string;
  responses: AiItem[];
};

type ApiResponse = {
  success: boolean;
  data: {
    llamaAiSessions: AiSession[];
  };
};

// Code-related chat history
const codeHistory = [
  {
    topic: "React Component Lifecycle Methods",
    chat: [
      {
        from: "user",
        message: "When should I use componentDidMount vs useEffect in React?",
      },
      {
        from: "assistant",
        message:
          "componentDidMount is for class components and runs once after initial render. For functional components, use useEffect with an empty dependency array (useEffect(() => {}, [])) to achieve the same behavior.",
      },
    ],
  },
  {
    topic: "CSS Grid Layout Issues",
    chat: [
      {
        from: "user",
        message: "My grid items aren't respecting the defined column sizes",
      },
      {
        from: "assistant",
        message:
          "Try adding grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) to your grid container. Also check for min-width constraints on child elements that might be overriding your grid layout.",
      },
    ],
  },
  {
    topic: "API Fetch Error Handling",
    chat: [
      {
        from: "user",
        message: "How can I properly handle 404 errors from my API calls?",
      },
      {
        from: "assistant",
        message:
          "Wrap your fetch in a try-catch block and check response.ok. For example: `if (!response.ok) throw new Error('Not found');` Then display appropriate UI in your catch block.",
      },
    ],
  },
  {
    topic: "TypeScript Interface vs Type",
    chat: [
      {
        from: "user",
        message: "When should I use interface versus type in TypeScript?",
      },
      {
        from: "assistant",
        message:
          "Use interfaces for object shapes that may be extended or implemented. Use type for unions, tuples, or complex type compositions. For simple object shapes, either works but interfaces are generally preferred.",
      },
    ],
  },
  {
    topic: "Deploying to Vercel",
    chat: [
      {
        from: "user",
        message: "My Next.js app deployment fails with 'Module not found'",
      },
      {
        from: "assistant",
        message:
          "This typically happens when dependencies aren't properly installed. Try deleting node_modules and package-lock.json, then run 'npm install' before redeploying. Also verify all imports match your package.json.",
      },
    ],
  },
];

// Chat-related history
const chatHistory = [
  {
    topic: "Planning a Weekend Trip",
    chat: [
      {
        from: "user",
        message:
          "I want to plan a weekend getaway. Any suggestions for a relaxing destination?",
      },
      {
        from: "assistant",
        message:
          "Consider visiting a mountain cabin or a lakeside retreat. Both offer peaceful environments away from city noise. What kind of activities do you enjoy - hiking, reading, or water sports?",
      },
    ],
  },
  {
    topic: "Healthy Meal Prep Ideas",
    chat: [
      {
        from: "user",
        message: "I need some healthy meal prep ideas for the week",
      },
      {
        from: "assistant",
        message:
          "Try preparing quinoa bowls with various toppings, overnight oats for breakfast, and sheet pan vegetables. Batch cooking proteins like grilled chicken or baked tofu saves time too.",
      },
    ],
  },
  {
    topic: "Book Recommendations",
    chat: [
      {
        from: "user",
        message: "Can you recommend some good fiction books?",
      },
      {
        from: "assistant",
        message:
          "Based on popular choices: 'The Seven Husbands of Evelyn Hugo' for contemporary fiction, 'The Name of the Wind' for fantasy, or 'Where the Crawdads Sing' for literary fiction. What genres do you usually enjoy?",
      },
    ],
  },
  {
    topic: "Learning a New Language",
    chat: [
      {
        from: "user",
        message: "What's the best way to start learning Spanish?",
      },
      {
        from: "assistant",
        message:
          "Start with basic conversational phrases, use apps like Duolingo or Babbel for daily practice, and try to consume Spanish media with subtitles. Consistent daily practice, even 15 minutes, is more effective than longer sporadic sessions.",
      },
    ],
  },
  {
    topic: "Home Organization Tips",
    chat: [
      {
        from: "user",
        message: "My home feels cluttered. How can I organize it better?",
      },
      {
        from: "assistant",
        message:
          "Start with one room at a time using the 'keep, donate, trash' method. Invest in storage solutions that fit your space, and follow the 'one in, one out' rule to prevent future clutter buildup.",
      },
    ],
  },
];

function AvatarDropdownIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3076_10614)">
        <path
          d="M6.6665 7.50008L9.99984 4.16675L13.3332 7.50008"
          stroke="#A1A1AA"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.3332 12.5L9.99984 15.8333L6.6665 12.5"
          stroke="#A1A1AA"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3076_10614">
          <rect fill="white" height="20" width="20" />
        </clipPath>
      </defs>
    </svg>
  );
}

function RecentPromptDropdown() {
  // const dispatch = useDispatch();
  return (
    <Dropdown className="min-w-fit p-0 rounded-lg">
      <DropdownTrigger>
        <Icon
          className="text-default-500 opacity-0 group-hover:opacity-100"
          icon="solar:menu-dots-bold"
          width={24}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dropdown menu with icons"
        className="p-0 w-fit"
        variant="faded"
      >
        <DropdownItem
          // onClick={() => {
          //   dispatch(setDeleteModel(true));
          // }}
          key="delete"
          className="dark:text-white text-black dark:data-[hover=true]:text-white data-[hover=true]:text-black"
          color="danger"
          startContent={
            <Icon
              className="dark:text-white text-black"
              height={20}
              icon="solar:trash-bin-minimalistic-linear"
              width={20}
            />
          }
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default function Sidebar() {
  const { isOpen, onOpenChange } = useDisclosure();
  const { onOpen } = useModalStore();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [repoSearch, setRepoSearch] = useState("");
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__TAURI_INTERNALS__ !== undefined
    ) {
      setIsTauri(true);
    }
  }, []);
  const selectedRepo =
    useSelector((state: RootState) => state.system.activeWorkspace) ||
    "alti.code.studio";

  const [vaultSecrets, setVaultSecrets] = useState([
    { id: "sec-1", name: "Primary Build Agent", service: "AWS Bedrock" },
    {
      id: "sec-2",
      name: "Synapse Production Analytics",
      service: "Azure OpenAI Foundry",
    },
    { id: "sec-3", name: "Telepathy Inference", service: "GCP Vertex AI" },
  ]);

  useEffect(() => {
    const handleNewSecret = (e: any) => {
      const newSecret = e.detail;

      setVaultSecrets((prev) => {
        const exists = prev.find((s) => s.id === newSecret.id);

        if (exists) {
          return prev.map((s) => (s.id === newSecret.id ? newSecret : s));
        }

        return [newSecret, ...prev];
      });
    };
    const handleDeleteSecret = (e: any) => {
      setVaultSecrets((prev) => prev.filter((s) => s.id !== e.detail));
    };

    window.addEventListener("update-vault-secret", handleNewSecret);
    window.addEventListener("delete-vault-secret", handleDeleteSecret);

    return () => {
      window.removeEventListener("update-vault-secret", handleNewSecret);
      window.removeEventListener("delete-vault-secret", handleDeleteSecret);
    };
  }, []);

  // Prefetch all key sidebar routes on mount to ensure instant 0ms transitions!
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/chat");
    router.prefetch("/agents-showcase");
    router.prefetch("/vault");
    router.prefetch("/cloud");
    router.prefetch("/instructions");
    router.prefetch("/guardrails");
    router.prefetch("/repositories");
    router.prefetch("/documents");
    router.prefetch("/connect-apps");
  }, [router]);

  const getHistoryTitle = () => {
    if (pathname?.startsWith("/chat/")) return "Chat";

    switch (pathname) {
      case "/":
        return "Code";
      case "/chat":
        return "Chat";
      case "/agents-showcase":
        return "Agent Arcade";
      case "/documents":
        return "Documentation";
      case "/instructions":
        return "Instructions";
      case "/guardrails":
        return "Guardrails";
      case "/knowledge":
        return "Knowledge";
      case "/repositories":
        return "Repositories";
      case "/connect-apps":
      case "/integrations":
        return "Integrations";

      case "/vault":
        return "Vault";
      case "/cloud":
        return "Cloud";

      default:
        return "Code";
    }
  };
  // const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState<"chat" | "code">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leftSidebarSearch, setLeftSidebarSearch] = useState("");

  const navigationItems = [
    {
      label: "Code",
      icon: Code,
      path: "/new-chat",
      isActive: pathname === "/new-chat" || pathname === "/code",
      onClick: () => {
        dispatch(startNewChat());
        router.push("/new-chat");
      },
    },
    {
      label: "Chat",
      icon: MessageSquare,
      path: "/chat",
      isActive: pathname.startsWith("/chat"),
      onClick: () => {
        router.push("/chat");
      },
    },
    {
      label: "Agents",
      icon: Bot,
      path: "/agents",
      isActive: pathname === "/agents" || pathname.startsWith("/agents/"),
      onClick: () => {
        router.push("/agents");
      },
    },
    {
      label: "Instructions",
      icon: BookOpen,
      path: "/instructions",
      isActive: pathname === "/instructions",
      onClick: () => {
        router.push("/instructions");
      },
    },
    {
      label: "Guardrails",
      icon: Shield,
      path: "/guardrails",
      isActive: pathname === "/guardrails",
      onClick: () => {
        router.push("/guardrails");
      },
    },
    {
      label: "Knowledge",
      icon: Database,
      path: "/knowledge",
      isActive: pathname === "/knowledge",
      onClick: () => {
        router.push("/knowledge");
      },
    },
    {
      label: "Vault",
      icon: Lock,
      path: "/vault",
      isActive: pathname === "/vault",
      onClick: () => {
        if (pathname === "/vault") {
          window.dispatchEvent(
            new CustomEvent("select-secret", { detail: null }),
          );
        }
        router.push("/vault");
      },
    },
  ];

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(leftSidebarSearch.toLowerCase()),
  );

  const getPlusTooltipContent = () => {
    if (pathname === "/" || pathname === "/code") return "New Code";
    if (pathname.startsWith("/chat")) return "New Chat";
    if (pathname === "/vault") return "New Vault";
    if (pathname === "/instructions") return "New Instruction";
    if (pathname === "/guardrails") return "New Guardrail";
    if (pathname === "/knowledge") return "New Knowledge";
    if (pathname === "/repositories") return "New Repository";
    if (pathname === "/documents") return "New Documentation";

    return "New";
  };

  const [dataFolders, setDataFolders] = useState<
    { id: string; name: string }[]
  >([]);
  const [instructions, setInstructions] = useState<
    { id: string; name: string }[]
  >([]);
  const repositories = useSelector(
    (state: RootState) => state.system.repositories || [],
  );
  const [guardrails, setGuardrails] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [knowledgeFolders, setKnowledgeFolders] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedKnowledgeFolderId, setSelectedKnowledgeFolderId] = useState<
    string | null
  >(null);

  const [customAgents, setCustomAgents] = useState<
    { id: string; name: string; prompt: string }[]
  >([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const agentIdParam = searchParams?.get("agentId");
  const agentNameParam = searchParams?.get("name");

  useEffect(() => {
    if (agentIdParam && agentNameParam) {
      setCustomAgents((prev) => {
        if (!prev.find((a) => a.id === agentIdParam)) {
          return [
            ...prev,
            { id: agentIdParam, name: agentNameParam, prompt: "" },
          ];
        }

        return prev;
      });
      setSelectedAgentId(agentIdParam);
    }
  }, [agentIdParam, agentNameParam]);

  // States and dynamic handlers for integrations / connect-apps catalog
  const [apps, setApps] = useState<AppIntegration[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Prefetch all navigation routes on mount to ensure instant, zero-latency page transitions
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/chat");
    router.prefetch("/agents-showcase");
    router.prefetch("/vault");
    router.prefetch("/cloud");
    router.prefetch("/instructions");
    router.prefetch("/guardrails");
    router.prefetch("/knowledge");
    router.prefetch("/repositories");
    router.prefetch("/documents");
    router.prefetch("/connect-apps");
  }, [router]);

  useEffect(() => {
    setLeftSidebarSearch("");
  }, [pathname]);

  useEffect(() => {
    const handleActiveApp = (e: any) => {
      setSelectedAppId(e.detail?.id || null);
    };

    window.addEventListener("active-connect-app", handleActiveApp);

    return () =>
      window.removeEventListener("active-connect-app", handleActiveApp);
  }, []);

  useEffect(() => {
    if (pathname !== "/connect-apps") return;

    const fetchConnections = async () => {
      if (!token) {
        setApps(FALLBACK_APPS);
        setLoadingApps(false);

        return;
      }

      try {
        // Fetch local active tools first
        let activeTools: any[] = [];

        try {
          const toolsRes = await axios.get(`${API_URL}/mcp/tools/local`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (toolsRes.data && toolsRes.data.success) {
            activeTools = toolsRes.data.data || [];
          }
        } catch (e) {
          console.error("Failed to fetch active tools in sidebar:", e);
        }

        // Fetch custom registered MCP servers
        let customServers: any[] = [];

        try {
          const customRes = await axios.get(`${API_URL}/mcp/custom`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (customRes.data && customRes.data.success) {
            customServers = customRes.data.data || [];
          }
        } catch (e) {
          console.error("Failed to fetch custom servers in sidebar:", e);
        }

        const res = await axios.get(`${API_URL}/mcp/composio/connections`, {
          headers: { Authorization: `Bearer ${token}` },
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
            status: activeTools.some((t: any) => t.server === s.name)
              ? ("connected" as const)
              : ("disconnected" as const),
            type: "custom" as const,
          }));

          // Standard SaaS & Presets
          const standardAppsMapped = FALLBACK_APPS.map((app) => {
            const slug = app.id.replace("app-", "").toLowerCase();

            if (slug.startsWith("mcp_") || slug.startsWith("mcp_toolbox_")) {
              const active = activeTools.some((t: any) => t.server === slug);

              return {
                ...app,
                status: active
                  ? ("connected" as const)
                  : ("disconnected" as const),
              };
            }

            if (connectedIds.has(slug)) {
              return { ...app, status: "connected" as const };
            }
            if (app.status === "connecting") return app;

            return { ...app, status: "disconnected" as const };
          });

          // Sort all custom + standard apps alphabetically by name
          const otherAppsSorted = [
            ...customAppsMapped,
            ...standardAppsMapped,
          ].sort((a, b) => a.name.localeCompare(b.name));

          setApps(otherAppsSorted);
        }
      } catch (err) {
        console.error("Failed to fetch connections in sidebar:", err);
      } finally {
        setLoadingApps(false);
      }
    };

    // Initialize list
    setApps(FALLBACK_APPS);
    fetchConnections();

    // Listen for sync event to re-fetch connection statuses
    const handleSync = () => {
      fetchConnections();
    };

    window.addEventListener("sync-connect-apps", handleSync);

    return () => {
      window.removeEventListener("sync-connect-apps", handleSync);
    };
  }, [pathname, token]);

  const { data: rulesData } = useQuery({
    queryKey: ["codebase-rules", token, selectedRepo],
    queryFn: async () => {
      if (!token) return { instructions: [], guardrails: [] };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      return data.success ? data.data : { instructions: [], guardrails: [] };
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache rules for 5 minutes to prevent blocking fetches on page transition
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (rulesData) {
      setInstructions(rulesData.instructions || []);
      setGuardrails(rulesData.guardrails || []);
      setIsInitialLoad(false);
    }
  }, [rulesData]);

  useEffect(() => {
    if (isInitialLoad || !token) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post(
          `${API_URL}/rules`,
          {
            instructions,
            guardrails,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (err) {
        console.error("Failed to save codebase rules:", err);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [instructions, guardrails, token, isInitialLoad]);

  const documents = useSelector(
    (state: RootState) => state.system.documents || [],
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "instruction" | "guardrail";
  } | null>(null);

  const {
    isOpen: isKnowledgeModalOpen,
    onOpen: openKnowledgeModal,
    onClose: closeKnowledgeModal,
  } = useDisclosure();
  const [knowledgeFolderName, setKnowledgeFolderName] = useState("");

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "instruction") {
      setInstructions((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    } else if (itemToDelete.type === "guardrail") {
      setGuardrails((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    }
    closeDeleteModal();
    setItemToDelete(null);
  };

  useEffect(() => {
    const handleAddInstruction = (e: any) =>
      setInstructions((prev) => [
        ...prev,
        { id: "inst-" + Date.now(), name: e.detail },
      ]);
    const handleUpdateInstruction = (e: any) =>
      setInstructions((prev) =>
        prev.map((i) =>
          i.id === e.detail.id ? { ...i, name: e.detail.name } : i,
        ),
      );
    const handleDeleteInstruction = (e: any) => {
      setItemToDelete({ id: e.detail, type: "instruction" });
      openDeleteModal();
    };

    const handleAddGuardrail = (e: any) =>
      setGuardrails((prev) => [
        ...prev,
        { id: "gr-" + Date.now(), name: e.detail },
      ]);
    const handleUpdateGuardrail = (e: any) =>
      setGuardrails((prev) =>
        prev.map((i) =>
          i.id === e.detail.id ? { ...i, name: e.detail.name } : i,
        ),
      );
    const handleDeleteGuardrail = (e: any) => {
      setItemToDelete({ id: e.detail, type: "guardrail" });
      openDeleteModal();
    };

    const handleOpenKnowledgeModal = () => {
      setKnowledgeFolderName("");
      openKnowledgeModal();
    };

    const handleCreateAgent = (e: any) => {
      const newAgentId = "agent-" + Date.now();
      let newAgent;

      if (typeof e.detail === "string") {
        const prompt = e.detail;
        const nameMatch = prompt.split(" ").slice(0, 3).join(" ") + "...";

        newAgent = { id: newAgentId, name: nameMatch, prompt: prompt };
      } else {
        newAgent = {
          id: newAgentId,
          name: e.detail.name || "Untitled Agent",
          prompt: e.detail.instructions || "",
          ...e.detail,
        };
      }

      setCustomAgents((prev) => [...prev, newAgent]);
      setSelectedAgentId(newAgentId);

      // Navigate to the newly created agent
      router.push(
        `/agents?agentId=${newAgentId}&name=${encodeURIComponent(newAgent.name)}`,
      );
    };

    window.addEventListener("add-instruction", handleAddInstruction);
    window.addEventListener("update-instruction", handleUpdateInstruction);
    window.addEventListener("delete-instruction", handleDeleteInstruction);
    window.addEventListener("add-guardrail", handleAddGuardrail);
    window.addEventListener("update-guardrail", handleUpdateGuardrail);
    window.addEventListener("delete-guardrail", handleDeleteGuardrail);
    window.addEventListener("open-knowledge-modal", handleOpenKnowledgeModal);
    window.addEventListener("create-agent", handleCreateAgent);

    return () => {
      window.removeEventListener("add-instruction", handleAddInstruction);
      window.removeEventListener("update-instruction", handleUpdateInstruction);
      window.removeEventListener("delete-instruction", handleDeleteInstruction);
      window.removeEventListener("add-guardrail", handleAddGuardrail);
      window.removeEventListener("update-guardrail", handleUpdateGuardrail);
      window.removeEventListener("delete-guardrail", handleDeleteGuardrail);
      window.removeEventListener(
        "open-knowledge-modal",
        handleOpenKnowledgeModal,
      );
      window.removeEventListener("create-agent", handleCreateAgent);
    };
  }, []);

  const {
    data: aiSessions,
    isLoading,
    error,
    refetch,
  } = useFetchChatHistory(token);

  const sortedChats = aiSessions
    ? [...aiSessions].sort(
        (a, b) =>
          new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime(),
      )
    : [];

  const submitForm = useCallback(
    (sessionId: string) => {
      router.push(`/chat/${sessionId}`);
    },
    [router],
  );

  const getCurrentHistory = () => {
    return currentMode === "code" ? codeHistory : chatHistory;
  };

  const [logoHovered, setLogoHovered] = useState(false);

  const handleLogoMouseEnter = () => {
    if (!isSidebarOpen) {
      setLogoHovered(true);
    }
  };

  const toggleLeftSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { data: repos = [], isFetching: isRepoLoading } = useQuery({
    queryKey: ["repos", token, repoSearch],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/git/repositories?q=${repoSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      return data.success ? data.data : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleRepoSearch = (val: string) => {
    setRepoSearch(val);
  };

  const content = (
    <div className="flex h-full z-20 bg-white dark:bg-[#0A0A0A]">
      {/* Primary Column (Left Side Menu) */}
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-300 bg-white dark:bg-black border-r border-default-200",
          isSidebarOpen ? "w-64" : "w-10",
        )}
      >
        {/* Top Section - Brand & Toggle */}
        <div
          className={cn(
            "h-[56px] flex items-center justify-between border-b border-default-200",
            isSidebarOpen ? "pl-4 pr-4" : "px-0 justify-center",
          )}
        >
          <div
            className={cn(
              "flex-1 min-w-0 flex items-center justify-start",
              !isSidebarOpen && "hidden",
            )}
          >
            {/* Light Mode: Icon + Text */}
            <div className="flex items-center gap-2 dark:hidden">
              <Image
                alt="Inso Logo Icon"
                className={cn(
                  "w-auto object-contain",
                  isTauri ? "h-[18px]" : "h-6",
                )}
                height={24}
                src="/assets/logo-icon-black.png?v=2"
                width={28}
              />
              {!isTauri && (
                <Image
                  alt="Inso Code"
                  className="h-4 w-auto object-contain"
                  height={16}
                  src="/inso-logo-black.png"
                  width={80}
                />
              )}
            </div>
            {/* Dark Mode: Icon + Text */}
            <div className="hidden dark:flex items-center gap-2">
              <Image
                alt="Inso Logo Icon"
                className={cn(
                  "w-auto object-contain",
                  isTauri ? "h-[18px]" : "h-6",
                )}
                height={24}
                src="/assets/logo-icon-white.png?v=2"
                width={28}
              />
              {!isTauri && (
                <Image
                  alt="Inso Code"
                  className="h-4 w-auto object-contain"
                  height={16}
                  src="/inso-logo-white.png"
                  width={80}
                />
              )}
            </div>
          </div>
          <Button
            isIconOnly
            className="-mr-2 text-default-400 hover:text-default-600"
            size="sm"
            variant="light"
            onClick={toggleLeftSidebar}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        {/* Repository Dropdown Section */}
        <div
          className={cn(
            "border-b border-default-200 px-3 py-2",
            !isSidebarOpen && "hidden",
          )}
        >
          <Dropdown
            className="w-[240px] min-w-[240px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-2xl p-1"
            placement="bottom-start"
          >
            <DropdownTrigger>
              <div className="relative">
                <div className="flex w-full items-center gap-2 px-2 py-2 rounded-xl hover:bg-default-200 dark:hover:bg-default-300 transition-all border-none group cursor-pointer bg-transparent">
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="flex items-center w-full">
                      <span className="text-[14px] font-semibold tracking-tight text-default-900 truncate">
                        {selectedRepo}
                      </span>
                      <ChevronDown className="size-3 text-default-400 ml-auto shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Select Workspace"
              className="p-2"
              disabledKeys={isRepoLoading ? ["searching"] : []}
            >
              <DropdownItem
                key="search-section"
                isReadOnly
                className="cursor-default hover:bg-transparent p-0 mb-2"
              >
                <div className="px-2 py-1 relative">
                  <input
                    autoFocus
                    className="w-full bg-default-100 border border-default-200 rounded-lg px-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Search repositories..."
                    value={repoSearch}
                    onChange={(e) => handleRepoSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
                  {isRepoLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </DropdownItem>

              <DropdownItem
                key="current-header"
                isReadOnly
                className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-2 mb-1"
              >
                Available Repositories
              </DropdownItem>

              {repos.map((repo: any) => (
                <DropdownItem
                  key={repo.fullName}
                  className="rounded-lg h-10 px-2 hover:bg-primary/5 transition-colors"
                  description={repo.private ? "Private" : "Public"}
                  startContent={
                    <div className="p-1.5 rounded-md bg-default-100 text-default-500">
                      <Icon className="size-3.5" icon="solar:folder-2-linear" />
                    </div>
                  }
                  onClick={() => dispatch(setActiveWorkspace(repo.name))}
                >
                  <span className="text-xs font-medium text-default-700">
                    {repo.name}
                  </span>
                </DropdownItem>
              ))}

              {repos.length === 0 && !isRepoLoading && (
                <DropdownItem
                  key="no-repos"
                  isReadOnly
                  className="text-center py-4 text-xs text-default-400 italic"
                >
                  No repositories found
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Search bar and + icon on the same line below the line */}
        <div
          className={cn(
            "px-3 py-3 flex items-center gap-2 border-b border-default-200",
            !isSidebarOpen && "hidden",
          )}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
            <input
              className="w-full bg-[#F4F4F6] dark:bg-default-100 border border-default-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
              placeholder="Search..."
              value={leftSidebarSearch}
              onChange={(e) => setLeftSidebarSearch(e.target.value)}
            />
          </div>
          <Tooltip
            showArrow
            classNames={{
              content:
                "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
            closeDelay={0}
            content={getPlusTooltipContent()}
            delay={0}
            placement="top"
          >
            <Button
              isIconOnly
              className="bg-[#F4F4F6] dark:bg-default-100 border border-default-200 rounded-lg text-default-600 flex-shrink-0"
              size="sm"
              variant="flat"
              onClick={() => {
                if (pathname === "/vault") {
                  window.dispatchEvent(new CustomEvent("open-vault-modal"));
                } else if (pathname === "/repositories") {
                  window.dispatchEvent(
                    new CustomEvent("open-repository-modal"),
                  );
                } else if (pathname === "/documents") {
                  window.dispatchEvent(new CustomEvent("open-document-modal"));
                } else if (pathname === "/knowledge") {
                  window.dispatchEvent(new CustomEvent("open-knowledge-modal"));
                } else {
                  dispatch(startNewChat());
                  router.push("/new-chat");
                }
              }}
              onMouseEnter={() => {
                if (pathname === "/vault") {
                  router.prefetch("/vault");
                } else if (pathname === "/repositories") {
                  router.prefetch("/repositories");
                } else if (pathname === "/documents") {
                  router.prefetch("/documents");
                } else {
                  router.prefetch("/new-chat");
                }
              }}
            >
              <Plus className="size-3.5" />
            </Button>
          </Tooltip>
        </div>

        {/* Connectors */}
        <div
          className={cn(
            "px-3 py-3 flex items-center gap-2 border-b border-default-200",
            !isSidebarOpen && "hidden",
          )}
        >
          <Tooltip
            showArrow
            classNames={{
              content:
                "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
            closeDelay={0}
            content="App Connections"
            delay={0}
            placement="top"
          >
            <Button
              isIconOnly
              className={cn(
                "border rounded-lg flex-shrink-0 flex-1",
                pathname === "/connect-apps"
                  ? "bg-primary/10 border-primary text-primary-500 shadow-sm"
                  : "bg-[#F4F4F6] dark:bg-default-100 border-default-200 text-default-600 hover:text-default-800",
              )}
              size="sm"
              variant="flat"
              onClick={() => {
                router.push("/connect-apps");
              }}
              onMouseEnter={() => {
                router.prefetch("/connect-apps");
              }}
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip
            showArrow
            classNames={{
              content:
                "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
            closeDelay={0}
            content="Database Connectors"
            delay={0}
            placement="top"
          >
            <Button
              isIconOnly
              className={cn(
                "border rounded-lg flex-shrink-0 flex-1",
                pathname.startsWith("/database")
                  ? "bg-primary/10 border-primary text-primary-500 shadow-sm"
                  : "bg-[#F4F4F6] dark:bg-default-100 border-default-200 text-default-600 hover:text-default-800",
              )}
              size="sm"
              variant="flat"
              onClick={() => {
                router.push("/database");
              }}
              onMouseEnter={() => {
                router.prefetch("/database");
              }}
            >
              <Database className="size-3.5" />
            </Button>
          </Tooltip>
          <Tooltip
            showArrow
            classNames={{
              content:
                "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
            }}
            closeDelay={0}
            content="Cloud Connections"
            delay={0}
            placement="top"
          >
            <Button
              isIconOnly
              className={cn(
                "border rounded-lg flex-shrink-0 flex-1",
                pathname === "/cloud"
                  ? "bg-primary/10 border-primary text-primary-500 shadow-sm"
                  : "bg-[#F4F4F6] dark:bg-default-100 border-default-200 text-default-600 hover:text-default-800",
              )}
              size="sm"
              variant="flat"
              onClick={() => {
                router.push("/cloud");
              }}
              onMouseEnter={() => {
                router.prefetch("/cloud");
              }}
            >
              <Cloud className="size-3.5" />
            </Button>
          </Tooltip>
        </div>

        {/* 6 navigation icons toggle container */}
        <div
          className={cn(
            "border-b border-default-200",
            isSidebarOpen ? "px-3 py-2" : "py-2 px-1",
          )}
        >
          <div
            className={cn(
              "bg-[#F4F4F6] dark:bg-default-50 rounded-xl p-1",
              isSidebarOpen
                ? "grid grid-cols-7 gap-0.5"
                : "flex flex-col items-center gap-2",
            )}
          >
            {filteredNavigationItems.map((item) => {
              const IconComponent = item.icon;

              return (
                <Tooltip
                  key={item.label}
                  showArrow
                  classNames={{
                    content:
                      "bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg",
                  }}
                  closeDelay={0}
                  content={item.label}
                  delay={0}
                  placement={isSidebarOpen ? "top" : "right"}
                >
                  <Button
                    isIconOnly
                    className={cn(
                      "flex items-center justify-center transition-all duration-200 relative group min-w-0 min-h-0",
                      isSidebarOpen
                        ? "h-[30px] w-full rounded-md"
                        : "h-[30px] w-[30px] rounded-md",
                      item.isActive
                        ? "bg-white dark:bg-default-100 border border-default-200 text-default-900 dark:text-white shadow-sm"
                        : "bg-transparent border-transparent text-default-400 hover:text-default-700 dark:hover:text-default-200",
                    )}
                    onClick={item.onClick}
                    onMouseEnter={() => {
                      router.prefetch(item.path);
                    }}
                  >
                    <IconComponent className="size-3.5" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </Tooltip>
              );
            })}
            {isSidebarOpen && filteredNavigationItems.length === 0 && (
              <div className="col-span-6 text-center py-2 text-xs text-default-400 italic">
                No results found
              </div>
            )}
          </div>
        </div>

        {!isSidebarOpen && <div className="flex-1" />}

        {isSidebarOpen && (
          <ScrollShadow
            hideScrollBar
            className="flex-1 px-2 mt-1 min-h-0 w-full scrollbar-hide overflow-y-auto"
          >
            {pathname === "/connect-apps" ? (
              <div className="flex flex-1 overflow-y-auto p-1.5 flex-col gap-1 w-full">
                {loadingApps ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Icon
                      className="text-2xl text-primary animate-spin"
                      icon="line-md:loading-twotone-loop"
                    />
                    <span className="text-xs text-default-400">
                      Loading catalog...
                    </span>
                  </div>
                ) : (
                  (() => {
                    const filtered = apps.filter(
                      (app) =>
                        app.name
                          .toLowerCase()
                          .includes(leftSidebarSearch.toLowerCase()) ||
                        app.description
                          .toLowerCase()
                          .includes(leftSidebarSearch.toLowerCase()),
                    );

                    if (filtered.length === 0) {
                      return (
                        <span className="text-xs text-default-400 text-center py-12">
                          No apps found
                        </span>
                      );
                    }

                    return filtered.map((app) => {
                      const isActive = selectedAppId === app.id;

                      return (
                        <button
                          key={app.id}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary dark:text-primary-400 font-semibold"
                              : "hover:bg-default-100 dark:hover:bg-default-200/20 text-default-700 dark:text-default-300",
                          )}
                          onClick={() => {
                            setSelectedAppId(app.id);
                            window.dispatchEvent(
                              new CustomEvent("select-connect-app", {
                                detail: app,
                              }),
                            );
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Dynamic Mini App Logo/Icon */}
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-default-200/50 overflow-hidden",
                                isActive
                                  ? "bg-white dark:bg-black"
                                  : "bg-[#f4f4f5] dark:bg-[#27272a]",
                              )}
                            >
                              <AppIcon
                                app={app}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-xs text-left truncate pr-2">
                              {app.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {app.status === "connected" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            )}
                            <Icon
                              className={cn(
                                "text-xs text-default-400 transition-transform",
                                isActive ? "translate-x-0.5 text-primary" : "",
                              )}
                              icon="solar:alt-arrow-right-linear"
                            />
                          </div>
                        </button>
                      );
                    });
                  })()
                )}
              </div>
            ) : pathname.startsWith("/database") ? (
              <div className="flex flex-1 overflow-y-auto p-1.5 flex-col gap-1 w-full">
                {(() => {
                  const filtered = SUPPORTED_DATABASES.filter((db) =>
                    db.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (filtered.length === 0) {
                    return (
                      <span className="text-xs text-default-400 text-center py-12">
                        No databases found
                      </span>
                    );
                  }

                  return filtered.map((db) => {
                    const isActive = pathname === `/database/${db.id}`;

                    return (
                      <button
                        key={db.id}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary dark:text-primary-400 font-semibold"
                            : "hover:bg-default-100 dark:hover:bg-default-200/20 text-default-700 dark:text-default-300",
                        )}
                        onClick={() => {
                          router.push(`/database/${db.id}`, { scroll: false });
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-default-200/50 overflow-hidden",
                              isActive
                                ? "bg-white dark:bg-black"
                                : "bg-[#f4f4f5] dark:bg-[#27272a]",
                            )}
                          >
                            <img
                              alt={db.name}
                              className="w-5 h-5 object-contain"
                              src={`/database-logos/${db.id}.${db.id === "alloydb" ? "png" : "svg"}`}
                            />
                          </div>
                          <span className="text-xs text-left truncate pr-2">
                            {db.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Icon
                            className={cn(
                              "text-xs text-default-400 transition-transform",
                              isActive ? "translate-x-0.5 text-primary" : "",
                            )}
                            icon="solar:alt-arrow-right-linear"
                          />
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            ) : pathname === "/vault" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = vaultSecrets.filter((stream) =>
                    stream.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:lock-keyhole-minimalistic-linear"
                        />
                        <span className="text-xs text-default-400">
                          {leftSidebarSearch
                            ? "No results found"
                            : "No secrets added yet"}
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((stream) => (
                    <button
                      key={stream.id}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate flex items-center justify-between group"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("select-secret", {
                            detail: stream.id,
                          }),
                        )
                      }
                    >
                      <span>{stream.name}</span>
                      <Lock
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        size={14}
                      />
                    </button>
                  ));
                })()}
              </div>
            ) : pathname === "/instructions" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = instructions.filter((inst) =>
                    inst.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (instructions.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:document-text-linear"
                        />
                        <span className="text-xs text-default-400">
                          No instructions added yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:document-text-linear"
                        />
                        <span className="text-xs text-default-400">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((inst) => (
                    <div
                      key={inst.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate">{inst.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Instruction options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="edit"
                            className="text-default-700 data-[hover=true]:bg-default-100 data-[hover=true]:text-foreground rounded-lg transition-colors py-2"
                            startContent={
                              <Edit2 className="text-default-500" size={14} />
                            }
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("edit-instruction", {
                                  detail: inst,
                                }),
                              )
                            }
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("delete-instruction", {
                                  detail: inst.id,
                                }),
                              )
                            }
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/guardrails" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = guardrails.filter((gr) =>
                    gr.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (guardrails.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:shield-warning-linear"
                        />
                        <span className="text-xs text-default-400">
                          No guardrails added yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:shield-warning-linear"
                        />
                        <span className="text-xs text-default-400">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((gr) => (
                    <div
                      key={gr.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="truncate">{gr.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Guardrail options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="edit"
                            className="text-default-700 data-[hover=true]:bg-default-100 data-[hover=true]:text-foreground rounded-lg transition-colors py-2"
                            startContent={
                              <Edit2 className="text-default-500" size={14} />
                            }
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("edit-guardrail", {
                                  detail: gr,
                                }),
                              )
                            }
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent("delete-guardrail", {
                                  detail: gr.id,
                                }),
                              )
                            }
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/knowledge" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = knowledgeFolders.filter((kf) =>
                    kf.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (knowledgeFolders.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 h-full text-center w-full">
                        <span className="text-xs text-default-500 font-medium">
                          No knowledge folders yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 h-full text-center w-full">
                        <span className="text-xs text-default-500 font-medium">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((kf) => (
                    <button
                      key={kf.id}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-left text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        kf.id === selectedKnowledgeFolderId
                          ? "bg-black/5 dark:bg-white/5 font-medium text-black dark:text-white"
                          : ""
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedKnowledgeFolderId(kf.id);
                        router.push(
                          `/knowledge?folderId=${kf.id}&folderName=${encodeURIComponent(kf.name)}`,
                        );
                        window.dispatchEvent(
                          new CustomEvent("select-knowledge-folder", {
                            detail: kf,
                          }),
                        );
                      }}
                    >
                      <span className="truncate">{kf.name}</span>
                    </button>
                  ));
                })()}
              </div>
            ) : pathname === "/agents" || pathname.startsWith("/agents/") ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = customAgents.filter((agent) =>
                    agent.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (customAgents.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <span className="text-xs text-default-400">
                          No agents created yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <span className="text-xs text-default-400">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((agent) => (
                    <button
                      key={agent.id}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-left text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        agent.id === selectedAgentId
                          ? "bg-black/5 dark:bg-white/5 font-medium text-black dark:text-white"
                          : ""
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                        router.push(
                          `/agents?agentId=${agent.id}&name=${encodeURIComponent(agent.name)}`,
                        );
                      }}
                    >
                      <span className="truncate">{agent.name}</span>
                    </button>
                  ));
                })()}
              </div>
            ) : pathname === "/repositories" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = repositories.filter((repo) =>
                    repo.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (repositories.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:folder-2-linear"
                        />
                        <span className="text-xs text-default-400">
                          No repositories added yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:folder-2-linear"
                        />
                        <span className="text-xs text-default-400">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((repo) => (
                    <div
                      key={repo.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("edit-repository", { detail: repo }),
                        )
                      }
                    >
                      <span className="truncate">{repo.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Repository options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeRepository(repo.id));
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/documents" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = documents.filter((doc) =>
                    doc.name
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (documents.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:book-open-linear"
                        />
                        <span className="text-xs text-default-400">
                          No documents added yet
                        </span>
                      </div>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:book-open-linear"
                        />
                        <span className="text-xs text-default-400">
                          No results found
                        </span>
                      </div>
                    );
                  }

                  return filtered.map((doc) => (
                    <div
                      key={doc.id}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("edit-document", { detail: doc }),
                        )
                      }
                    >
                      <span className="truncate">{doc.name}</span>
                      <Dropdown
                        className="min-w-[120px] bg-white dark:bg-default-50 border border-default-200 shadow-lg rounded-xl p-1"
                        placement="bottom-end"
                      >
                        <DropdownTrigger>
                          <button
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Document options"
                          className="p-0"
                          variant="flat"
                        >
                          <DropdownItem
                            key="delete"
                            className="text-danger data-[hover=true]:bg-danger/10 data-[hover=true]:text-danger rounded-lg transition-colors py-2"
                            color="danger"
                            startContent={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeDocument(doc.id));
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ));
                })()}
              </div>
            ) : pathname === "/cloud" ? (
              <div className="flex flex-col gap-0.5 px-2 mt-2 pb-6 w-full">
                {(() => {
                  const groups = [
                    {
                      category: "Hyperscalers & Core Cloud",
                      providers: [
                        "Amazon Web Services",
                        "Google Cloud Platform",
                        "Microsoft Azure",
                        "Oracle Cloud",
                        "IBM Cloud",
                        "Alibaba Cloud",
                      ],
                    },
                    {
                      category: "PaaS & Deployment",
                      providers: [
                        "Vercel",
                        "Heroku",
                        "Netlify",
                        "Render",
                        "DigitalOcean",
                        "Fly.io",
                        "Railway",
                        "Porter",
                        "Zeet",
                        "AWS Amplify",
                        "Google Firebase",
                      ],
                    },
                    {
                      category: "Databases & BaaS",
                      providers: [
                        "Supabase",
                        "MongoDB Atlas",
                        "Neon",
                        "PlanetScale",
                        "Upstash",
                        "Redis Enterprise Cloud",
                        "Snowflake",
                        "Databricks",
                        "SingleStore",
                        "CockroachLabs",
                        "Fauna",
                        "Xata",
                        "Convex",
                        "Turso",
                        "Appwrite",
                      ],
                    },
                    {
                      category: "Vector Databases",
                      providers: [
                        "Pinecone",
                        "Weaviate",
                        "Qdrant",
                        "Milvus",
                        "Chroma",
                      ],
                    },
                    {
                      category: "Edge, CDN & Networking",
                      providers: [
                        "Cloudflare",
                        "Fastly",
                        "Akamai",
                        "AWS CloudFront",
                        "Edgio",
                        "Tailscale",
                        "Ngrok",
                      ],
                    },
                    {
                      category: "Containers & Orchestration",
                      providers: [
                        "Docker Hub",
                        "Kubernetes",
                        "Amazon ECS",
                        "Google Cloud Run",
                        "HashiCorp Nomad",
                      ],
                    },
                    {
                      category: "Serverless & Compute",
                      providers: [
                        "AWS Lambda",
                        "Google Cloud Functions",
                        "Azure Functions",
                        "Cloudflare Workers",
                        "Deno Deploy",
                      ],
                    },
                    {
                      category: "CI/CD & DevOps",
                      providers: [
                        "GitHub Actions",
                        "GitLab CI",
                        "Bitbucket Pipelines",
                        "CircleCI",
                        "Travis CI",
                        "AWS CodePipeline",
                        "ArgoCD",
                        "Spinnaker",
                      ],
                    },
                    {
                      category: "Event Streaming",
                      providers: [
                        "Confluent",
                        "RabbitMQ Cloud",
                        "Amazon SQS/SNS",
                        "Google Cloud Pub/Sub",
                      ],
                    },
                  ];

                  const groupRenderData = groups
                    .map((group) => {
                      const filteredProviders = group.providers.filter(
                        (provider) =>
                          provider
                            .toLowerCase()
                            .includes(leftSidebarSearch.toLowerCase()),
                      );

                      return { ...group, providers: filteredProviders };
                    })
                    .filter((group) => group.providers.length > 0);

                  if (groupRenderData.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon="solar:cloud-linear"
                        />
                        <span className="text-xs text-default-400">
                          {leftSidebarSearch
                            ? "No results found"
                            : "No cloud nodes added yet"}
                        </span>
                      </div>
                    );
                  }

                  return groupRenderData.map((group) => (
                    <div key={group.category} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {group.category}
                      </div>
                      {group.providers.map((provider) => (
                        <button
                          key={provider}
                          className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 truncate"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("select-cloud-provider", {
                                detail: provider,
                              }),
                            )
                          }
                        >
                          <Cloud
                            className="text-gray-400 flex-shrink-0"
                            size={14}
                          />
                          <span className="truncate">{provider}</span>
                        </button>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            ) : isLoading ? (
              <div className="space-y-4 px-4 mt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-default-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 px-2 mt-2 w-full">
                {(() => {
                  const filtered = sortedChats.filter((item) =>
                    (item?.responses[0]?.prompt || "Untitled Chat")
                      .toLowerCase()
                      .includes(leftSidebarSearch.toLowerCase()),
                  );

                  if (sortedChats.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                        <Icon
                          className="text-2xl text-default-400 mb-2"
                          icon={
                            pathname === "/" || pathname === "/code"
                              ? "solar:code-square-linear"
                              : "solar:chat-square-linear"
                          }
                        />
                        <span className="text-xs text-default-400">
                          {pathname === "/" || pathname === "/code"
                            ? "No code history yet"
                            : "No chat history yet"}
                        </span>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-8 text-center text-xs text-default-400">
                        No results found
                      </div>
                    );
                  }

                  return filtered.map((item) => (
                    <button
                      key={item?._id}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate"
                      onClick={() =>
                        item?.sessionId && submitForm(item?.sessionId)
                      }
                    >
                      {item?.responses[0]?.prompt || "Untitled Chat"}
                    </button>
                  ));
                })()}
              </div>
            )}
          </ScrollShadow>
        )}

        <div
          className={cn(
            "mt-auto border-t border-default-200",
            isSidebarOpen ? "px-5 pb-5 pt-4" : "px-1 pb-4 pt-4",
          )}
        >
          {status === "unauthenticated" ? (
            <div className={cn("flex gap-2", !isSidebarOpen && "hidden")}>
              <Button
                className="flex-1 h-9 bg-black text-white text-[13px] font-medium rounded-md"
                onClick={() => (window.location.href = "/login")}
              >
                Login
              </Button>
            </div>
          ) : (
            <div className={cn("flex w-full", !isSidebarOpen && "hidden")}>
              <MyAccountDropdown />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex h-full border-r border-default-200 bg-white dark:bg-[#0A0A0A] w-[56px] transition-all" />
    );
  }

  return (
    <div className="flex h-full border-r border-default-200">
      {content}
      <Modal
        backdrop="opaque"
        classNames={{ backdrop: "bg-black/20 backdrop-blur-sm" }}
        isOpen={isDeleteModalOpen}
        size="sm"
        onClose={closeDeleteModal}
      >
        <ModalContent className="bg-white dark:bg-default-50 border border-default-200 shadow-2xl rounded-2xl p-2">
          <ModalHeader className="flex flex-col gap-1 text-black dark:text-white">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this item?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-xl transition-colors"
              onPress={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              onPress={confirmDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        hideCloseButton
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/20 backdrop-blur-sm",
          base: "bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden shadow-2xl max-w-[420px] p-0",
        }}
        isOpen={isKnowledgeModalOpen}
        placement="center"
        onClose={closeKnowledgeModal}
      >
        <ModalContent>
          <div className="flex flex-col items-center pt-8 pb-6 px-6 gap-2">
            <h2 className="text-lg font-bold text-black dark:text-white">
              Create Knowledge Folder
            </h2>
            <div className="w-full mt-4">
              <Input
                autoFocus
                classNames={{
                  inputWrapper:
                    "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5] shadow-none",
                }}
                placeholder="Enter Folder Name"
                size="md"
                value={knowledgeFolderName}
                variant="flat"
                onChange={(e) => setKnowledgeFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && knowledgeFolderName) {
                    e.preventDefault();
                    const newFolder = {
                      id: "kf-" + Date.now(),
                      name: knowledgeFolderName,
                    };

                    setKnowledgeFolders((prev) => [...prev, newFolder]);
                    setSelectedKnowledgeFolderId(newFolder.id);
                    window.dispatchEvent(
                      new CustomEvent("select-knowledge-folder", {
                        detail: newFolder,
                      }),
                    );
                    closeKnowledgeModal();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-row border-t border-gray-200 dark:border-gray-800 w-full">
            <Button
              disableRipple
              className="flex-1 bg-transparent hover:bg-default-100 rounded-none h-14 text-black dark:text-white font-medium text-sm"
              onPress={closeKnowledgeModal}
            >
              Cancel
            </Button>
            <div className="w-[1px] shrink-0 bg-gray-200 dark:bg-gray-800 h-14" />
            <Button
              disableRipple
              className="flex-1 bg-transparent hover:bg-default-100 rounded-none h-14 text-black dark:text-white font-medium text-sm"
              isDisabled={!knowledgeFolderName}
              onPress={() => {
                const newFolder = {
                  id: "kf-" + Date.now(),
                  name: knowledgeFolderName,
                };

                setKnowledgeFolders((prev) => [...prev, newFolder]);
                setSelectedKnowledgeFolderId(newFolder.id);
                window.dispatchEvent(
                  new CustomEvent("select-knowledge-folder", {
                    detail: newFolder,
                  }),
                );
                closeKnowledgeModal();
              }}
            >
              Create
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
