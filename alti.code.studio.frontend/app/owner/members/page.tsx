"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Trash2 } from "lucide-react";
import { useAppSelector } from "@/store";

export default function MembersPage() {
  const baseMockMembers = [
    {
      firstName: "Michael",
      lastName: "Meram",
      email: "meram.michael@gmail.com",
      role: "Admin",
      isYou: true,
      tokens: "41.2M",
    },
    {
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah.connor@sky-net.com",
      role: "Admin",
      isYou: false,
      tokens: "12.8M",
    },
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Member",
      isYou: false,
      tokens: "4.5M",
    },
    {
      firstName: "Alex",
      lastName: "Smith",
      email: "alex.smith@techcorp.com",
      role: "Member",
      isYou: false,
      tokens: "890K",
    },
    {
      firstName: "Emily",
      lastName: "Watson",
      email: "emily.watson@designco.io",
      role: "Member",
      isYou: false,
      tokens: "1.2M",
    },
    {
      firstName: "David",
      lastName: "Miller",
      email: "david.miller@devs.net",
      role: "Member",
      isYou: false,
      tokens: "3.4M",
    },
    {
      firstName: "Jessica",
      lastName: "Taylor",
      email: "jessica.taylor@startup.co",
      role: "Member",
      isYou: false,
      tokens: "120K",
    },
  ];

  const mockMembers = Array.from({ length: 55 }, (_, i) => {
    if (i < baseMockMembers.length) return baseMockMembers[i];
    return {
      firstName: "Test",
      lastName: `User ${i + 1}`,
      email: `test.user${i + 1}@example.com`,
      role: "Member",
      isYou: false,
      tokens: "0K",
    };
  });

  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [members, setMembers] = React.useState(mockMembers);
  const [memberToRemove, setMemberToRemove] = React.useState<
    (typeof mockMembers)[0] | null
  >(null);
  const [indexToRemove, setIndexToRemove] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function loadMembers() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/admin/all-user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const result = await res.json();
          // If the backend returns users list
          const usersList = result?.data || result;

          if (Array.isArray(usersList)) {
            const formatted = usersList.map((u) => {
              const emailStr = u.email || "";
              const nameParts = (u.name || "").split(" ");

              return {
                firstName: u.firstName || nameParts[0] || "User",
                lastName: u.lastName || nameParts[1] || "",
                email: emailStr,
                tokens: "0K",
                role: u.role === "admin" ? "Admin" : "Member",
                isYou: emailStr.toLowerCase() === "meram.michael@gmail.com",
              };
            });
            // Keep the 'You' admin row at the top or ensure it exists
            const hasYou = formatted.some((u) => u.isYou);

            if (!hasYou) {
              setMembers([mockMembers[0], ...formatted]);
            } else {
              setMembers(formatted);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load members from database:", err);
      }
    }
    loadMembers();
  }, []);

  const handleRemoveMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);

    setMembers(updatedMembers);
  };

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(q) ||
      member.lastName.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q)
    );
  });

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[30%_30%_40%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>FIRST NAME</div>
          <div>LAST NAME</div>
          <div>EMAIL ADDRESS</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {paginatedMembers.map((member, i) => (
            <Link
              key={startIndex + i}
              className="group grid grid-cols-[30%_30%_40%] items-center px-6 py-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              href={`/owner/members/${encodeURIComponent(member.email)}`}
            >
              <div>{member.firstName}</div>
              <div>{member.lastName}</div>
              <div className="flex items-center justify-between w-full">
                <span>{member.email}</span>
                {member.isYou ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold shrink-0">
                    You
                  </span>
                ) : (
                  <button
                    className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all opacity-0 group-hover:opacity-100 focus:outline-none shrink-0"
                    title="Remove member"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setMemberToRemove(member);
                      setIndexToRemove(i);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredMembers.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredMembers.length}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-1.5 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium transition-colors"
              >
                Back
              </button>
            )}
            {currentPage < totalPages && totalPages > 0 && (
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-medium transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {memberToRemove !== null && indexToRemove !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161b22] w-auto min-w-[300px] max-w-2xl px-2 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-1.5">
                Remove Member
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                Are you sure you want to remove{" "}
                <span>
                  {memberToRemove.firstName} {memberToRemove.lastName}
                </span>
              </p>
            </div>
            <div className="flex border-t border-neutral-200 dark:border-neutral-700">
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                type="button"
                onClick={() => {
                  setMemberToRemove(null);
                  setIndexToRemove(null);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                type="button"
                onClick={() => {
                  handleRemoveMember(indexToRemove);
                  setMemberToRemove(null);
                  setIndexToRemove(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
