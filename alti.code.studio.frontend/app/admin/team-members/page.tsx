"use client";

import React from "react";
import { Download, ChevronDown, Trash2 } from "lucide-react";

export default function MembersPage() {
  const mockMembers = [
    { firstName: "Michael", lastName: "Meram", email: "meram.michael@gmail.com", role: "Admin", isYou: true },
    { firstName: "Sarah", lastName: "Connor", email: "sarah.connor@sky-net.com", role: "Admin", isYou: false },
    { firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: "Member", isYou: false },
    { firstName: "Alex", lastName: "Smith", email: "alex.smith@techcorp.com", role: "Member", isYou: false },
    { firstName: "Emily", lastName: "Watson", email: "emily.watson@designco.io", role: "Member", isYou: false },
    { firstName: "David", lastName: "Miller", email: "david.miller@devs.net", role: "Member", isYou: false },
    { firstName: "Jessica", lastName: "Taylor", email: "jessica.taylor@startup.co", role: "Member", isYou: false },
  ];

  const [members, setMembers] = React.useState(mockMembers);
  const [activeDropdownIndex, setActiveDropdownIndex] = React.useState<number | null>(null);
  const [memberToRemove, setMemberToRemove] = React.useState<typeof mockMembers[0] | null>(null);
  const [indexToRemove, setIndexToRemove] = React.useState<number | null>(null);
  const activeDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeDropdownRef.current && !activeDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownIndex]);

  const handleRoleChange = (index: number, newRole: string) => {
    const updatedMembers = [...members];
    updatedMembers[index].role = newRole;
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  return (
    <div className="w-full pt-6">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[20%_20%_42%_18%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>FIRST NAME</div>
          <div>LAST NAME</div>
          <div>EMAIL ADDRESS</div>
          <div>ROLE TYPE</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {members.map((member, i) => (
            <div
              key={i}
              className="group grid grid-cols-[20%_20%_42%_18%] items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              <div>{member.firstName}</div>
              <div>{member.lastName}</div>
              <div>{member.email}</div>
              <div className="flex items-center justify-between w-full pr-0 relative">
                <div className="relative" ref={activeDropdownIndex === i ? activeDropdownRef : null}>
                  {member.isYou ? (
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {member.role}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveDropdownIndex(activeDropdownIndex === i ? null : i)}
                      className="flex items-center gap-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-2 py-1 -mx-2 rounded-lg transition-colors text-left font-medium text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none"
                    >
                      <span>{member.role}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-all duration-200 ${activeDropdownIndex === i ? "opacity-100 rotate-180" : "opacity-0 group-hover:opacity-100"}`} />
                    </button>
                  )}

                  {activeDropdownIndex === i && (
                    <div className="absolute left-0 mt-2 w-28 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-fade-in animate-slide-up">
                      <button
                        type="button"
                        onClick={() => {
                          handleRoleChange(i, "Admin");
                          setActiveDropdownIndex(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs transition-colors ${member.role === "Admin" ? "bg-neutral-50 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white" : "text-neutral-750 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleRoleChange(i, "Member");
                          setActiveDropdownIndex(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs transition-colors ${member.role === "Member" ? "bg-neutral-50 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white" : "text-neutral-750 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                      >
                        Member
                      </button>
                    </div>
                  )}
                </div>
                {member.isYou ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold shrink-0">
                    You
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMemberToRemove(member);
                      setIndexToRemove(i);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all opacity-0 group-hover:opacity-100 focus:outline-none shrink-0"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {memberToRemove !== null && indexToRemove !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Remove Member
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-neutral-800 dark:text-neutral-200">{memberToRemove.firstName} {memberToRemove.lastName}</span> from your team? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  setMemberToRemove(null);
                  setIndexToRemove(null);
                }}
                className="px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRemoveMember(indexToRemove);
                  setMemberToRemove(null);
                  setIndexToRemove(null);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none"
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
