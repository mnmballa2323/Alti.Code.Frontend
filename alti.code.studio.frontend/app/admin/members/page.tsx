"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";

export default function InvitePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      alert("Please select a role type");

      return;
    }
    if (!email.trim()) {
      alert("Email address is required");

      return;
    }
    setLoading(true);
    try {
      await teamAPI.inviteMember({
        email: email.trim(),
        role: role,
      });
      alert(`Successfully invited ${email}!`);
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          "Failed to send invitation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      <form className="space-y-6" onSubmit={handleInvite}>
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Enter First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Enter Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            required
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Enter Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all flex items-center justify-between cursor-pointer ${
                role === ""
                  ? "text-neutral-400 dark:text-neutral-500 font-normal"
                  : "text-neutral-800 dark:text-neutral-200 font-semibold"
              }`}
            >
              <span>
                {role === ""
                  ? "Select Role Type"
                  : role === "developer"
                  ? "Developer"
                  : role === "manager"
                  ? "Manager"
                  : "Admin"}
              </span>
              <svg
                className={`fill-current h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                {/* Dropdown Options */}
                <div className="absolute top-full left-0 mt-1.5 w-full bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  {[
                    { value: "developer", label: "Developer" },
                    { value: "manager", label: "Manager" },
                    { value: "admin", label: "Admin" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setRole(item.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                        role === item.value
                          ? "text-neutral-900 dark:text-white font-bold bg-neutral-50/60 dark:bg-neutral-800/20"
                          : "text-neutral-600 dark:text-neutral-450 font-semibold"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer info & action button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            Billing notice: Adding a new team member adds an active seat to your
            plan at $20.00/month.
          </p>
          <button
            className="h-10 px-6 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-950 font-semibold rounded-xl text-sm transition-all shadow-md shadow-neutral-800/10 flex items-center justify-center gap-2 self-end md:self-auto"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Inviting...
              </>
            ) : (
              "Send Invitation"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
