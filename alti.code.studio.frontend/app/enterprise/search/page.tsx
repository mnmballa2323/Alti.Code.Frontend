"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Loader2,
  Activity,
  TrendingUp,
  Users,
  Database,
  FileText,
  Settings,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { searchAPI } from "@/lib/enterprise-api";

function SearchDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>({ types: {}, tenants: {} });
  const [total, setTotal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filters
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeTenant, setActiveTenant] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, activeType, activeTenant);
    } else {
      setResults([]);
      setTotal(0);
      setDuration(0);
    }
  }, [initialQuery, activeType, activeTenant]);

  const fetchAnalytics = async () => {
    try {
      const stats = await searchAPI.analytics();

      setAnalytics(stats);
    } catch (error) {
      console.error("Error fetching search analytics:", error);
    }
  };

  const performSearch = async (
    q: string,
    type: string | null = null,
    tenant: string | null = null,
  ) => {
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await searchAPI.search(q, {
        limit: 50,
        type: type || undefined,
        tenantId: tenant || undefined,
        fuzzy: true,
      });

      setResults(res.results || []);
      setFacets(res.facets || { types: {}, tenants: {} });
      setTotal(res.total || 0);
      setDuration(res.duration || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to execute search query");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/enterprise/search?q=${encodeURIComponent(query)}`);
      setActiveType(null);
      setActiveTenant(null);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "agent":
        return <Cpu className="h-5 w-5 text-blue-400" />;
      case "tenant":
        return <Users className="h-5 w-5 text-green-400" />;
      case "workflow":
        return <Activity className="h-5 w-5 text-amber-400" />;
      case "pipeline":
        return <Database className="h-5 w-5 text-indigo-400" />;
      case "secret":
        return <Settings className="h-5 w-5 text-stone-400" />;
      case "log":
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case "dispatch":
        return <FileText className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Search className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Enterprise Search
            </h1>
          </div>

          <div className="flex flex-1 items-center justify-center px-8">
            <form
              className="relative w-full max-w-2xl"
              onSubmit={handleSearchSubmit}
            >
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="Search across all enterprise entities..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar Facets & Analytics */}
          <div className="w-full shrink-0 space-y-8 md:w-64">
            {/* Search Analytics Summary */}
            {analytics && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Global Search Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Total Queries Evaluated
                    </p>
                    <p className="font-mono text-2xl font-light text-zinc-100">
                      {analytics.totalSearches.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">
                      Platform Trending Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analytics.popularTerms
                        ?.slice(0, 5)
                        .map((term: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded bg-zinc-800/80 px-2 py-0.5 text-xs font-medium text-zinc-300"
                          >
                            {term.term}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Faceted Filtering */}
            {total > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Refine Results
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Entity Type Facet */}
                  {Object.keys(facets.types || {}).length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Entity Type
                      </h4>
                      <div className="space-y-1.5">
                        {Object.entries(facets.types).map(([type, count]) => (
                          <button
                            key={type}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                              activeType === type
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                            }`}
                            onClick={() =>
                              setActiveType(activeType === type ? null : type)
                            }
                          >
                            <span className="capitalize">{type}</span>
                            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500">
                              {count as number}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tenant Facet */}
                  {Object.keys(facets.tenants || {}).length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Tenant Namespace
                      </h4>
                      <div className="space-y-1.5">
                        {Object.entries(facets.tenants).map(
                          ([tenant, count]) => (
                            <button
                              key={tenant}
                              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors ${
                                activeTenant === tenant
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                              }`}
                              onClick={() =>
                                setActiveTenant(
                                  activeTenant === tenant ? null : tenant,
                                )
                              }
                            >
                              <span className="truncate pr-2">
                                {tenant.replace("tenant_", "")}
                              </span>
                              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500">
                                {count as number}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Results Area */}
          <div className="flex-1">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" />
              </div>
            ) : initialQuery && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-32 text-center">
                <Search className="mb-4 h-12 w-12 text-zinc-800" />
                <h3 className="mb-1 text-lg font-medium text-zinc-300">
                  No matches found
                </h3>
                <p className="text-sm text-zinc-500">
                  Try adjusting your keywords or clearing the active facet
                  filters.
                </p>
                {(activeType || activeTenant) && (
                  <button
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setActiveType(null);
                      setActiveTenant(null);
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : initialQuery ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                  <div className="text-sm text-zinc-400">
                    Showing{" "}
                    <span className="font-medium text-zinc-200">
                      {results.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-200">{total}</span>{" "}
                    results for "
                    <span className="font-medium text-white">
                      {initialQuery}
                    </span>
                    "
                  </div>
                  <div className="text-xs text-zinc-600">
                    Engine parse time: {duration}ms (TF-IDF Scored)
                  </div>
                </div>

                {/* Result List */}
                <div className="space-y-3">
                  {results.map((result, idx) => (
                    <motion.div
                      key={result.id}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex flex-col gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-5 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded border border-zinc-800 bg-zinc-950 p-2">
                            {getEntityIcon(result.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-medium text-zinc-100 group-hover:text-blue-400 transition-colors">
                                {result.title}
                              </h3>
                              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                {result.type}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                              {result.body}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="font-mono text-[10px] text-zinc-600">
                            SCORE_{result.score.toFixed(3)}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(result.indexedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Deep Object Field Badges */}
                      {Object.keys(result.fields || {}).length > 0 && (
                        <div className="ml-12 mt-2 flex flex-wrap gap-2">
                          {Object.entries(result.fields)
                            .slice(0, 3)
                            .map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center rounded-md border border-zinc-800/80 bg-black/50 px-2 py-1 text-[10px] text-zinc-400"
                              >
                                <span className="font-semibold text-zinc-500 mr-1">
                                  {k}:
                                </span>
                                <span className="truncate max-w-[150px]">
                                  {String(v)}
                                </span>
                              </span>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-32 text-center">
                <Search className="mb-4 h-12 w-12 text-zinc-800" />
                <h3 className="mb-1 text-lg font-medium text-zinc-300">
                  Phase 50: Enterprise Search Engine
                </h3>
                <p className="max-w-md text-sm text-zinc-500 leading-relaxed">
                  Enter a query above to execute a TF-IDF scored full-text
                  search across all indexed enterprise modules, multi-tenant
                  databases, isolated workflows, and data pipelines.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <SearchDashboard />
    </Suspense>
  );
}
