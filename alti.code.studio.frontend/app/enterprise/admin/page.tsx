"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Shield,
  Users,
  Flag,
  Megaphone,
  UserPlus,
  Settings,
  Building,
  Key,
} from "lucide-react";

import { adminAPI } from "@/lib/enterprise-api";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, f] = await Promise.allSettled([
          adminAPI.stats(),
          adminAPI.listTenants(),
          adminAPI.flags(),
        ]);

        if (s.status === "fulfilled") setStats(s.value);
        if (t.status === "fulfilled")
          setTenants(Array.isArray(t.value) ? t.value : t.value?.tenants || []);
        if (f.status === "fulfilled")
          setFlags(Array.isArray(f.value) ? f.value : f.value?.flags || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Admin Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Console</h2>
          <p className="text-sm text-default-400">
            Tenant management, feature flags, and system operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
            size="sm"
            startContent={<Building className="w-4 h-4" />}
          >
            Create Tenant
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg"
            size="sm"
            startContent={<Megaphone className="w-4 h-4" />}
          >
            Announcement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalTenants ?? tenants.length}
              </div>
              <div className="text-sm text-default-300">Tenants</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalUsers ?? 0}
              </div>
              <div className="text-sm text-default-300">Users</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.featureFlags ?? flags.length}
              </div>
              <div className="text-sm text-default-300">Feature Flags</div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/5 border border-white/10">
          <CardBody className="py-4 px-5 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.teams ?? 0}
              </div>
              <div className="text-sm text-default-300">Teams</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10 flex justify-between">
          <h3 className="text-lg font-bold text-white">Tenants</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table isStriped removeWrapper aria-label="Tenants">
            <TableHeader>
              <TableColumn>TENANT</TableColumn>
              <TableColumn>PLAN</TableColumn>
              <TableColumn>USERS</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No tenants yet. Create your first tenant.">
              {tenants.map((t: any, i: number) => (
                <TableRow key={t.id || i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-default-400" />
                      <span className="font-semibold">{t.name || t.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color="secondary" size="sm" variant="flat">
                      {t.plan || "free"}
                    </Chip>
                  </TableCell>
                  <TableCell>{t.userCount ?? t.users?.length ?? 0}</TableCell>
                  <TableCell>
                    <Chip
                      color={t.status === "active" ? "success" : "warning"}
                      size="sm"
                      variant="dot"
                    >
                      {t.status || "active"}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Feature Flags */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Feature Flags</h3>
        </CardHeader>
        <CardBody>
          {flags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {flags.map((flag: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-white font-medium">
                      {flag.name || flag.id}
                    </span>
                  </div>
                  <Chip
                    color={flag.enabled ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {flag.enabled ? "ON" : "OFF"}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-default-400">
              <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No feature flags configured</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer">
          <CardBody className="py-5 px-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-violet-400" />
              <div>
                <div className="text-white font-bold">Bulk Invite</div>
                <div className="text-xs text-default-400">
                  Invite multiple users at once via CSV
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer">
          <CardBody className="py-5 px-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-white font-bold">Maintenance Mode</div>
                <div className="text-xs text-default-400">
                  Schedule system maintenance windows
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer">
          <CardBody className="py-5 px-6">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-white font-bold">Audit Trail</div>
                <div className="text-xs text-default-400">
                  View complete admin activity history
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
