"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { teamAPI } from "@/lib/enterprise-api";
import { useAppSelector } from "@/store";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  subscriptionPrice?: number;
}

interface TeamInfo {
  id: string;
  name: string;
  description: string;
  members: Member[];
}

export default function EnterprisePage() {
  const router = useRouter();
  const { status } = useSession();
  const currentUserFromStore = useAppSelector(
    (state) => state.user.data,
  ) as any;
  const [currentUser, setCurrentUser] = useState<any>({
    id: "admin-user",
    name: "Platform Admin",
    email: "admin@alticodestudio.com",
    role: "admin",
  });
  const [members, setMembers] = useState<Member[]>([
    {
      id: "2",
      name: "Ada Lovelace",
      email: "ada.lovelace@alticodestudio.com",
      role: "admin",
    },
    {
      id: "4",
      name: "Alan Turing",
      email: "alan.turing@alticodestudio.com",
      role: "manager",
    },
    {
      id: "3",
      name: "Grace Hopper",
      email: "grace.hopper@alticodestudio.com",
      role: "developer",
    },
    {
      id: "1",
      name: "Jules Verne",
      email: "jules.verne@alticodestudio.com",
      role: "developer",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMembers = async () => {
    try {
      const res = await teamAPI.members();

      if (res && res.members && res.members.length > 0) {
        setMembers(res.members);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMembers();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (currentUserFromStore && currentUserFromStore.email) {
      setCurrentUser(currentUserFromStore);
    }
  }, [currentUserFromStore]);

  // Merge current user into members list if not already present
  const allMembers = [...members];

  if (currentUser && !allMembers.some((m) => m.email === currentUser.email)) {
    allMembers.push({
      id: currentUser.id || currentUser._id || "current-user",
      name:
        currentUser.name ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        undefined,
      email: currentUser.email,
      role: currentUser.role || "admin",
    });
  }

  // Categorize members into teams dynamically, using email address as the team name
  const rawTeams: TeamInfo[] = [
    {
      id: "engineering",
      name: "admin@insocode.com",
      description: "",
      members: allMembers.filter((m) => {
        const r = (m.role || "").toLowerCase();
        return r === "developer" || r === "dev";
      }),
    },
    {
      id: "product-design",
      name: "owner@insocode.com",
      description: "",
      members: allMembers.filter((m) => {
        const r = (m.role || "").toLowerCase();
        return (
          r === "manager" ||
          (r === "admin" &&
            m.email !== "owner@insocode.com" &&
            m.email !== "admin@insocode.com")
        );
      }),
    },
    {
      id: "ops-support",
      name: "ada.lovelace@alticodestudio.com",
      description: "",
      members: allMembers.filter((m) => {
        const r = (m.role || "").toLowerCase();
        return (
          r === "owner" ||
          m.email === "owner@insocode.com" ||
          m.email === "admin@insocode.com"
        );
      }),
    },
  ];

  // Filter teams based on search query
  const filteredTeams = rawTeams.filter((team) => {
    const query = searchQuery.toLowerCase();

    return (
      team.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 animate-fade-in">
      <div className="space-y-4">
        {/* Sticky Header Wrapper */}
          <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <input
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-850 dark:text-neutral-100 placeholder-neutral-450 dark:placeholder-neutral-500"
                placeholder="Search enterprise accounts..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
              <div className="col-span-9">Email Address</div>
              <div className="col-span-3 text-right pr-12">Members</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="space-y-3 mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                <p className="text-sm text-neutral-500">Loading workspace enterprise accounts...</p>
              </div>
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 cursor-pointer"
                  onClick={() => router.push(`/admin/enterprise/${team.id}`)}
                >
                  <div className="col-span-9 flex items-center gap-2">
                    <span className="text-neutral-600 dark:text-neutral-300 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {team.name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-3 pr-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full border border-neutral-200/50 dark:border-neutral-750">
                      {team.members.length === 1
                        ? "1 member"
                        : `${team.members.length} members`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                No enterprise accounts match your search query.
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
