"use client";

import React, { use } from "react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { Database } from "lucide-react";
import { Icon } from "@iconify/react";

const SUPPORTED_DATABASES = [
  { id: "alloydb", name: "AlloyDB", icon: "logos:google-cloud" },
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
  { id: "influxdb", name: "InfluxDB", icon: "logos:influxdb" },
  { id: "knowledge-catalog", name: "Knowledge Catalog", icon: "carbon:ibm-watson-knowledge-catalog" },
  { id: "looker", name: "Looker", icon: "logos:looker" },
  { id: "mariadb", name: "MariaDB", icon: "logos:mariadb" },
  { id: "milvus", name: "Milvus", icon: "logos:milvus" },
  { id: "mongodb", name: "MongoDB", icon: "logos:mongodb-icon" },
  { id: "mysql", name: "MySQL", icon: "logos:mysql" },
  { id: "neo4j", name: "Neo4j", icon: "logos:neo4j" },
  { id: "oracle", name: "Oracle", icon: "logos:oracle" },
  { id: "pinecone", name: "Pinecone", icon: "logos:pinecone" },
  { id: "postgresql", name: "PostgreSQL", icon: "logos:postgresql" },
  { id: "prometheus", name: "Prometheus", icon: "logos:prometheus" },
  { id: "qdrant", name: "Qdrant", icon: "logos:qdrant" },
  { id: "redis", name: "Redis", icon: "logos:redis" },
  { id: "redshift", name: "Redshift", icon: "logos:aws-redshift" },
  { id: "singlestore", name: "SingleStore", icon: "simple-icons:singlestore" },
  { id: "snowflake", name: "Snowflake", icon: "logos:snowflake-icon" },
  { id: "spanner", name: "Spanner", icon: "gcp:cloud-spanner" },
  { id: "sqlserver", name: "SQL Server", icon: "devicon:microsoftsqlserver" },
  { id: "sqlite", name: "SQLite", icon: "logos:sqlite" },
  { id: "tidb", name: "TiDB", icon: "simple-icons:tidb" },
  { id: "timescaledb", name: "TimescaleDB", icon: "logos:timescaledb" },
  { id: "trino", name: "Trino", icon: "logos:trino" },
  { id: "valkey", name: "Valkey", icon: "simple-icons:valkey" },
  { id: "weaviate", name: "Weaviate", icon: "logos:weaviate" },
  { id: "yugabytedb", name: "YugabyteDB", icon: "logos:yugabyte" },
];

export default function DatabasePage({ params }: { params: Promise<{ dbId?: string[] }> }) {
  const unwrappedParams = use(params);
  const dbId = unwrappedParams.dbId?.[0];
  const selectedDb = SUPPORTED_DATABASES.find((db) => db.id === dbId);

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans scrollbar-hide">
        <div className="flex flex-col items-center justify-start min-h-full w-full py-6">
          <div className="w-full max-w-4xl text-left bg-white dark:bg-[#111111] p-8 rounded-3xl border border-default-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-default-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {selectedDb ? (
                    <img src={`/database-logos/${selectedDb.id}.${selectedDb.id === 'alloydb' ? 'png' : 'svg'}`} alt={selectedDb.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <Database className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    {selectedDb ? `${selectedDb.name} Connector` : "Database Connectors"}
                  </h1>
                  <p className="text-sm text-default-500 mt-1">
                    Connect and manage your {selectedDb ? selectedDb.name : "database"} resources using Google MCP Toolbox.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-12 text-default-500">
              {selectedDb ? (
                <img src={`/database-logos/${selectedDb.id}.${selectedDb.id === 'alloydb' ? 'png' : 'svg'}`} alt={selectedDb.name} className="w-12 h-12 mx-auto mb-4 opacity-30" />
              ) : (
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
              )}
              <p>
                {selectedDb
                  ? `${selectedDb.name} connection interface is under construction.`
                  : "Please select a database from the sidebar to connect."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
