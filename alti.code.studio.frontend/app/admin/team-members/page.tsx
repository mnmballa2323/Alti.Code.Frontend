"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { getUserData } from "@/lib/user";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "Jules Verne", email: "jules.verne@alticodestudio.com", role: "developer" },
    { id: "2", name: "Ada Lovelace", email: "ada.lovelace@alticodestudio.com", role: "owner" },
    { id: "3", name: "Grace Hopper", email: "grace.hopper@alticodestudio.com", role: "developer" },
    { id: "4", name: "Alan Turing", email: "alan.turing@alticodestudio.com", role: "manager" }
  ]);
  const [currentUser, setCurrentUser] = useState<any>({
    id: "admin-user",
    name: "Platform Admin",
    email: "admin@alticodestudio.com",
    role: "admin"
  });
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
    fetchMembers();
  }, []);

  const handleRemove = async (id: string, email: string) => {
    if (id === currentUser?.id) {
      alert("You cannot remove yourself from the workspace.");

      return;
    }
    if (
      !confirm(`Are you sure you want to remove ${email} from the workspace?`)
    )
      return;

    try {
      await teamAPI.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      alert("Member removed successfully.");
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member. Please try again.");
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "Developer";
    const r = role.toLowerCase();

    if (r === "admin" || r === "owner") return "Owner";

    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Merge current user into members list if not already returned by the API
  const displayedMembers = [...members];

  if (
    currentUser &&
    !displayedMembers.some((m) => m.email === currentUser.email)
  ) {
    displayedMembers.push({
      id: currentUser.id || "current-user",
      name:
        currentUser.name ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        undefined,
      email: currentUser.email,
      role: currentUser.role || "owner",
    });
  }

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-sm text-neutral-500">
            Loading workspace members...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMembers.length > 0 ? (
            <div className="w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase border-b border-neutral-100 dark:border-neutral-800 mb-4">
                <div className="col-span-8">Email Address</div>
                <div className="col-span-4">Role Type</div>
              </div>

              {/* Table Body */}
              <div className="space-y-3">
                {displayedMembers.map((member) => {
                  const isYou = member.email === currentUser?.email;

                  return (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200"
                    >
                      <div className="col-span-8 flex items-center gap-2 min-w-0">
                        <span className="text-neutral-850 dark:text-neutral-100 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                          {member.email}
                        </span>
                        {isYou && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200/40 dark:border-neutral-700/40">
                            You
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center justify-between">
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          {formatRole(member.role)}
                        </span>
                        {!isYou && (
                          <button
                            className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors ml-auto"
                            onClick={() =>
                              handleRemove(member.id, member.email)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No members configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
