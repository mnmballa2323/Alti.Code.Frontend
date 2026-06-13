"use client";

import React from "react";

export default function DatabaseConnectorsSection() {
  const databases = [
    {
      name: "PostgreSQL",
      icon: (
        <img
          alt="PostgreSQL"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/postgresql.svg"
        />
      ),
    },
    {
      name: "MongoDB",
      icon: (
        <img
          alt="MongoDB"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/mongodb-icon.svg"
        />
      ),
    },
    {
      name: "MySQL",
      icon: (
        <img
          alt="MySQL"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/mysql-icon.svg"
        />
      ),
    },
    {
      name: "Redis",
      icon: (
        <img
          alt="Redis"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/redis.svg"
        />
      ),
    },
    {
      name: "Elasticsearch",
      icon: (
        <img
          alt="Elasticsearch"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/elasticsearch.svg"
        />
      ),
    },
    {
      name: "DynamoDB",
      icon: (
        <img
          alt="DynamoDB"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/aws-dynamodb.svg"
        />
      ),
    },
    {
      name: "Cassandra",
      icon: (
        <img
          alt="Cassandra"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/cassandra.svg"
        />
      ),
    },
    {
      name: "Firebase",
      icon: (
        <img
          alt="Firebase"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/firebase.svg"
        />
      ),
    },
    {
      name: "Snowflake",
      icon: (
        <img
          alt="Snowflake"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/snowflake-icon.svg"
        />
      ),
    },
    {
      name: "ClickHouse",
      icon: (
        <img
          alt="ClickHouse"
          className="w-8 h-8 object-contain"
          src="https://cdn.simpleicons.org/clickhouse"
        />
      ),
    },
    {
      name: "Neo4j",
      icon: (
        <img
          alt="Neo4j"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/neo4j.svg"
        />
      ),
    },
    {
      name: "Supabase",
      icon: (
        <img
          alt="Supabase"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/supabase-icon.svg"
        />
      ),
    },
    {
      name: "SQLite",
      icon: (
        <img
          alt="SQLite"
          className="h-8 w-auto object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/sqlite.svg"
        />
      ),
    },
    {
      name: "MariaDB",
      icon: (
        <img
          alt="MariaDB"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/mariadb-icon.svg"
        />
      ),
    },
    {
      name: "Qdrant",
      icon: (
        <img
          alt="Qdrant"
          className="w-8 h-8 object-contain"
          src="https://cdn.simpleicons.org/qdrant"
        />
      ),
    },
    {
      name: "Milvus",
      icon: (
        <img
          alt="Milvus"
          className="w-8 h-8 object-contain"
          src="https://cdn.simpleicons.org/milvus"
        />
      ),
    },
    {
      name: "SurrealDB",
      icon: (
        <img
          alt="SurrealDB"
          className="w-8 h-8 object-contain"
          src="https://cdn.simpleicons.org/surrealdb"
        />
      ),
    },
    {
      name: "InfluxDB",
      icon: (
        <img
          alt="InfluxDB"
          className="w-8 h-8 object-contain"
          src="https://cdn.simpleicons.org/influxdb"
        />
      ),
    },
  ];

  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeDatabases = [...databases, ...databases];

  return (
    <section className="w-full py-32 bg-gray-50 text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 items-center text-center">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            18 Database Connectors. <br />
            <span className="text-[#10B981]">Instant data layer access.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium mx-auto">
            Securely connect your agents to SQL, NoSQL, and vector databases.{" "}
            <br className="hidden md:block" />
            Inspect schemas, generate optimized queries, and manage migrations
            safely.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden py-10 fade-edges">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-scroll-right {
              animation: scroll-right 40s linear infinite;
              width: max-content;
            }
            .fade-edges {
              mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
          `,
            }}
          />

          <div className="flex animate-scroll-right hover:[animation-play-state:paused] gap-8">
            {marqueeDatabases.map((db, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white border border-gray-200 shadow-sm whitespace-nowrap group hover:border-gray-400 transition-colors cursor-pointer"
              >
                {db.icon}
                <span className="text-lg font-semibold tracking-tight text-gray-700 group-hover:text-black transition-colors">
                  {db.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
