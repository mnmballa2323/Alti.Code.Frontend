"use client";

import React, { useState } from "react";
import { teamAPI } from "@/lib/enterprise-api";
import { Loader2 } from "lucide-react";

export default function InvitePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

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
      alert(err.response?.data?.error || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">

      <form onSubmit={handleInvite} className="space-y-6">
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          <input
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all appearance-none cursor-pointer ${
                role === "" ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-800 dark:text-neutral-200"
              }`}
            >
              <option value="" disabled hidden>Select Role Type</option>
              <option value="developer" className="text-neutral-800 dark:text-neutral-200">Developer</option>
              <option value="manager" className="text-neutral-800 dark:text-neutral-200">Manager</option>
              <option value="admin" className="text-neutral-800 dark:text-neutral-200">Admin</option>
            </select>
            {/* Custom chevron indicator */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer info & action button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            Billing notice: Adding a new team member adds an active seat to your plan at $20.00/month.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-950 font-semibold rounded-xl text-sm transition-all shadow-md shadow-neutral-800/10 flex items-center justify-center gap-2 self-end md:self-auto"
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
