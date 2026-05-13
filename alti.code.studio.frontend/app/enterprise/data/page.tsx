"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Spinner, Button } from "@heroui/react";
import {
  Database,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CalendarClock,
} from "lucide-react";

import { dataAPI } from "@/lib/enterprise-api";

export default function DataPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await dataAPI.stats();

        setStats(s);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Data Hub...</span>
      </div>
    );
  }

  const formats = [
    {
      name: "JSON",
      icon: <FileJson className="w-5 h-5" />,
      ext: ".json",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "CSV",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      ext: ".csv",
      color: "from-emerald-500 to-green-600",
    },
    {
      name: "XML",
      icon: <FileJson className="w-5 h-5" />,
      ext: ".xml",
      color: "from-blue-500 to-cyan-600",
    },
    {
      name: "Parquet",
      icon: <Database className="w-5 h-5" />,
      ext: ".parquet",
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Data Export & Import
          </h2>
          <p className="text-sm text-default-400">
            Bulk data operations with scheduling and format conversion
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
            size="sm"
            startContent={<Download className="w-4 h-4" />}
          >
            New Export
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
            size="sm"
            startContent={<Upload className="w-4 h-4" />}
          >
            Import Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalExports ?? 0}
              </div>
              <div className="text-sm text-default-300">Exports</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalImports ?? 0}
              </div>
              <div className="text-sm text-default-300">Imports</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.scheduledJobs ?? 0}
              </div>
              <div className="text-sm text-default-300">Scheduled</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-sm text-default-300">Formats</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Supported Formats */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Supported Formats</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formats.map((fmt, i) => (
              <Card
                key={i}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <CardBody className="py-4 px-5 text-center">
                  <div
                    className={`mx-auto p-3 rounded-xl bg-gradient-to-br ${fmt.color} shadow-lg w-fit mb-3`}
                  >
                    <div className="text-white">{fmt.icon}</div>
                  </div>
                  <div className="text-white font-bold">{fmt.name}</div>
                  <div className="text-xs text-default-500 font-mono">
                    {fmt.ext}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/20">
          <CardBody className="py-5 px-6">
            <div className="flex items-start gap-4">
              <Download className="w-8 h-8 text-emerald-400 mt-1" />
              <div>
                <div className="text-white font-bold mb-2">Export Features</div>
                <ul className="text-sm text-default-400 space-y-1">
                  <li>• Field selection & custom filters</li>
                  <li>• Scheduled recurring exports</li>
                  <li>• 6 delivery targets (S3, GCS, Azure, SFTP…)</li>
                  <li>• Progress tracking with ETA</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20">
          <CardBody className="py-5 px-6">
            <div className="flex items-start gap-4">
              <Upload className="w-8 h-8 text-blue-400 mt-1" />
              <div>
                <div className="text-white font-bold mb-2">Import Features</div>
                <ul className="text-sm text-default-400 space-y-1">
                  <li>• Auto field mapping</li>
                  <li>• 4 conflict strategies (skip/overwrite/merge/error)</li>
                  <li>• Dry-run validation mode</li>
                  <li>• Rollback on failure</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
