"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Mail, Shield, User, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

import { teamAPI } from "@/lib/enterprise-api";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveMemberName } from "@/store/uiSlice";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status } = useSession();
  
  const teamId = params.id as string;
  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  let teamName = "Team Directory";
  let teamDesc = "Workspace team members";

  if (teamId === "engineering") {
    teamName = "Engineering Team";
    teamDesc = "Core platform engineering and development";
  } else if (teamId === "product-design") {
    teamName = "Product & Design Team";
    teamDesc = "Product management and UI/UX design";
  } else if (teamId === "ops-support") {
    teamName = "Operations & Support Team";
    teamDesc = "Infrastructure, security, and customer support";
  }

  useEffect(() => {
    dispatch(setActiveMemberName(teamName));
    return () => {
      dispatch(setActiveMemberName(null));
    };
  }, [dispatch, teamName]);

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

  // Merge current user if not already in members
  const allMembers = [...members];
  if (
    currentUser &&
    !allMembers.some((m) => m.email === currentUser.email)
  ) {
    allMembers.push({
      id: currentUser.id || "current-user",
      name:
        currentUser.name ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        undefined,
      email: currentUser.email,
      role: currentUser.role || "admin",
    });
  }

  // Filter members belonging to this specific team
  const teamMembers = allMembers.filter((m) => {
    const roleLower = (m.role || "").toLowerCase();
    if (teamId === "engineering") {
      return roleLower === "developer" || roleLower === "dev";
    } else if (teamId === "product-design") {
      return (
        roleLower === "manager" ||
        (roleLower === "admin" &&
          m.email !== "owner@insocode.com" &&
          m.email !== "admin@insocode.com")
      );
    } else if (teamId === "ops-support") {
      return (
        roleLower === "owner" ||
        m.email === "owner@insocode.com" ||
        m.email === "admin@insocode.com"
      );
    }
    return false;
  });

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 animate-fade-in">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-sm text-neutral-500">Loading team details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team Header card */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {teamName}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-450 mt-1">
              {teamDesc}
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-850 rounded-full">
                {teamMembers.length} {teamMembers.length === 1 ? "Member" : "Members"}
              </span>
            </div>
          </div>

          {/* Members list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => {
                const isYou = currentUser && member.email === currentUser.email;

                return (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-start gap-4 transition-all hover:border-neutral-350 dark:hover:border-neutral-700 shadow-sm"
                  >
                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-850 dark:text-neutral-100 truncate text-[15px]">
                          {member.name || member.email.split("@")[0]}
                        </span>
                        {isYou && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200/40 dark:border-neutral-700/40 uppercase">
                            You
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-450 mt-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-455 mt-1">
                        <Shield className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                No members currently in this team.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
