"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { CustomerInfo, DUMMY_CUSTOMERS } from "./data";

import { useAppSelector } from "@/store";

export default function CustomersPage() {
  const router = useRouter();
  const { status } = useSession();
  const [customers, setCustomers] = useState<CustomerInfo[]>(DUMMY_CUSTOMERS);
  const ITEMS_PER_PAGE = 8;
  const [loading, setLoading] = useState(false);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "authenticated") {
      setCustomers(DUMMY_CUSTOMERS);
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  // Filter based on search query
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();

    return (
      c.name.toLowerCase().includes(query) ||
      (c.domain && c.domain.toLowerCase().includes(query)) ||
      (c.owner && c.owner.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredCustomers.length,
  );
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const getPrice = (type: string) => {
    if (type === "Cloud") return "$250/mo";
    if (type === "Dedicated") return "$2,500/mo";
    if (type === "Sovereign") return "$5,000/mo";

    return "$0/mo";
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl items-center">
          <div className="col-span-3">Account Name</div>
          <div className="col-span-3">Owner Email</div>
          <div className="col-span-2 pl-10">Type</div>
          <div className="col-span-2 flex justify-center pr-8">Members</div>
          <div className="col-span-2 flex items-center justify-between pr-2">
            Price
          </div>
        </div>

        {/* Floating Rows */}
        <div className="flex flex-col gap-2 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
              <p className="text-sm text-neutral-500">Loading customers...</p>
            </div>
          ) : paginatedCustomers.length > 0 ? (
            paginatedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer relative"
                onClick={() => router.push(`/owner/customers/${customer.id}`)}
              >
                {/* Account Name */}
                <div className="col-span-3 flex items-center min-w-0">
                  <span className="text-neutral-900 dark:text-white font-semibold truncate">
                    {customer.name}
                  </span>
                </div>

                {/* Owner Email */}
                <div className="col-span-3 flex items-center text-neutral-500 dark:text-neutral-400 font-normal">
                  {customer.owner}
                </div>

                {/* Account Type */}
                <div className="col-span-2 pl-10 flex items-center text-neutral-500 dark:text-neutral-400 font-normal">
                  {customer.type}
                </div>

                {/* Members (No "members" text) */}
                <div className="col-span-2 flex justify-center pr-8 text-neutral-600 dark:text-neutral-400 font-normal">
                  {customer.userCount.toLocaleString()}
                </div>

                {/* Price */}
                <div className="col-span-2 flex items-center justify-between pr-2">
                  <span className="text-neutral-800 dark:text-neutral-200 font-normal text-sm">
                    {getPrice(customer.type)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No customers match your filter or search query.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredCustomers.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredCustomers.length}
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
