"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

import { useAppSelector } from "@/store";

export default function InvitePage() {
  const profile = useAppSelector((state) => state.user.data);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const planPrices: Record<string, string> = {
    launch: "1,000",
    build: "2,500",
    scale: "5,000",
    cloud: "1,000",
    dedicated: "2,500",
    sovereign: "5,000",
  };
  const currentPlan = profile?.plan?.toLowerCase() || "cloud";
  const currentPrice = planPrices[currentPlan] || "1,000";

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter First Name"
              type="text"
            />
          </div>
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Last Name"
              type="text"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Email Address"
              type="email"
            />
          </div>
          <div ref={dropdownRef} className="flex-1 relative">
            <button
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm flex items-center justify-between text-left focus:outline-none"
              type="button"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span
                className={
                  selectedRole
                    ? "text-neutral-900 dark:text-neutral-100 font-medium"
                    : "text-neutral-400"
                }
              >
                {selectedRole
                  ? selectedRole === "admin"
                    ? "Admin"
                    : "Member"
                  : "Select Role Type"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-fade-in animate-slide-up">
                <button
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  type="button"
                  onClick={() => {
                    setSelectedRole("admin");
                    setIsOpen(false);
                  }}
                >
                  Admin
                </button>
                <button
                  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  type="button"
                  onClick={() => {
                    setSelectedRole("member");
                    setIsOpen(false);
                  }}
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
            Adding a new team member adds an active seat to your plan at $
            {currentPrice}/month.
          </p>
          <button className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg">
            Invite Member
          </button>
        </div>
      </div>
    </div>
  );
}
