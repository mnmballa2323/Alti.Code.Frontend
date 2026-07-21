"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { PlatformLogin, DUMMY_LOGINS } from "./data";

import { useAppSelector } from "@/store";

export default function PlatformLoginsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [logins, setLogins] = useState<PlatformLogin[]>([]);
  const ITEMS_PER_PAGE = 8;
  const [loading, setLoading] = useState(true);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );

  const togglePasswordVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setVisiblePasswords((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  useEffect(() => {
    if (status === "authenticated") {
      setLogins(DUMMY_LOGINS);
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const filteredLogins = logins.filter((c) => {
    const query = searchQuery.toLowerCase();

    return (
      c.platform.toLowerCase().includes(query) ||
      c.website.toLowerCase().includes(query) ||
      c.username.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredLogins.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLogins.length);
  const paginatedLogins = filteredLogins.slice(startIndex, endIndex);

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl items-center">
          <div className="col-span-3">Platform Name</div>
          <div className="col-span-3">Website Domain</div>
          <div className="col-span-3">Username</div>
          <div className="col-span-3 flex items-center justify-between pr-2">
            Password
          </div>
        </div>

        {/* Floating Rows */}
        <div className="flex flex-col gap-2 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
              <p className="text-sm text-neutral-500">Loading...</p>
            </div>
          ) : paginatedLogins.length > 0 ? (
            paginatedLogins.map((item) => (
              <div
                key={item.id}
                className="group grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer relative"
                onClick={() => {}}
              >
                <div className="col-span-3 flex items-center min-w-0">
                  <span className="text-neutral-900 dark:text-white font-semibold truncate">
                    {item.platform}
                  </span>
                </div>

                <div className="col-span-3 flex items-center text-neutral-500 dark:text-neutral-400 font-normal truncate pr-4">
                  {item.website}
                </div>

                <div className="col-span-3 flex items-center text-neutral-500 dark:text-neutral-400 font-normal truncate pr-4">
                  {item.username}
                </div>

                <div className="col-span-3 flex items-center justify-between pr-2">
                  <span
                    className={`font-mono text-neutral-500 dark:text-neutral-400 text-xs ${!visiblePasswords.has(item.id) ? "tracking-widest" : ""}`}
                  >
                    {visiblePasswords.has(item.id)
                      ? item.password
                      : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      onClick={(e) => togglePasswordVisibility(e, item.id)}
                    >
                      {visiblePasswords.has(item.id) ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No results found.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredLogins.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredLogins.length}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                className="px-4 py-1.5 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Back
              </button>
            )}
            {currentPage < totalPages && totalPages > 0 && (
              <button
                className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-medium transition-colors"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
