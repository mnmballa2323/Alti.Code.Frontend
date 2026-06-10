"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { teamAPI } from "@/lib/enterprise-api";
import { getUserData } from "@/lib/user";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (token) {
        const userRes = await getUserData(token);
        if (userRes?.success && userRes?.data) {
          setCurrentUser(userRes.data);
        }
      }

      const res = await teamAPI.members();
      if (res && res.members) {
        setMembers(res.members);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRemove = async (id: string, email: string) => {
    if (id === currentUser?.id) {
      alert("You cannot remove yourself from the workspace.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${email} from the workspace?`)) return;

    try {
      await teamAPI.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      alert("Member removed successfully.");
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Members
        </h1>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-500" />
          Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-sm text-neutral-500">Loading workspace members...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.length > 0 ? (
            members.map((member) => {
              const isYou = member.email === currentUser?.email;
              
              // Try to split name into first and last, or extract from email
              const nameParts = member.name ? member.name.trim().split(/\s+/) : [];
              const firstName = nameParts[0] || member.email.split("@")[0];
              const lastName = nameParts.slice(1).join(" ") || "";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all shadow-sm duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Initials Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-650 dark:text-neutral-300 font-semibold shrink-0 uppercase">
                      {firstName.substring(0, 1)}
                      {lastName ? lastName.substring(0, 1) : ""}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-center ml-2">
                      <div className="md:col-span-1">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                          First Name
                        </p>
                        <p className="font-semibold text-neutral-800 dark:text-white text-sm capitalize">
                          {firstName}
                        </p>
                      </div>
                      <div className="md:col-span-1">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                          Last Name
                        </p>
                        <p className="font-semibold text-neutral-800 dark:text-white text-sm capitalize">
                          {lastName || "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                          Email Address
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">
                            {member.email}
                          </p>
                          {isYou && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-100 dark:bg-neutral-850 text-neutral-550 dark:text-neutral-400 rounded border border-neutral-200/50 dark:border-neutral-700/50">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pr-6 text-right">
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                        Role Type
                      </p>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg capitalize">
                        {member.role || "developer"}
                      </span>
                    </div>
                  </div>

                  {!isYou && (
                    <button
                      onClick={() => handleRemove(member.id, member.email)}
                      className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No members configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
