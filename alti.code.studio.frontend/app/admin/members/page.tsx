"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function InvitePage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Invite
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter First Name"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Last Name"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter Email Address"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <div className="flex-1 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm flex items-center justify-between text-left focus:outline-none"
            >
              <span className={selectedRole ? "text-neutral-900 dark:text-neutral-100 font-medium" : "text-neutral-400"}>
                {selectedRole ? (selectedRole === "admin" ? "Admin" : "Member") : "Select Role Type"}
              </span>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-fade-in animate-slide-up">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("admin");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("member");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Member
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-neutral-500 tracking-wide">
            <span className="font-bold text-neutral-900 dark:text-neutral-200">
              Billing notice:
            </span>{" "}
            Adding a new team member adds an active seat to your plan at $25.00/month.
          </p>
          <button className="px-5 py-2.5 bg-neutral-500 hover:bg-neutral-600 transition-colors text-white text-xs font-semibold rounded-lg">
            Invite Member
          </button>
        </div>
      </div>
    </div>
  );
}
