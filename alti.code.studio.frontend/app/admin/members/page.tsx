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

  // Custom Modal State for Unified Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setModalTitle("Role Required");
      setModalMessage("Please select a role type before sending an invitation.");
      setModalOpen(true);

      return;
    }
    if (!email.trim()) {
      setModalTitle("Email Required");
      setModalMessage("Email address is required to send an invitation.");
      setModalOpen(true);

      return;
    }
    setLoading(true);
    try {
      await teamAPI.inviteMember({
        email: email.trim(),
        role: role,
      });
      setModalTitle("Invitation Sent");
      setModalMessage(`Successfully invited ${email}!`);
      setModalOpen(true);
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
    } catch (err: any) {
      console.error("Invite member failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send invitation. Please try again.";
      setModalTitle("Invitation Failed");
      setModalMessage(errorMessage);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">
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
              className={`w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 transition-all flex items-center justify-between cursor-pointer ${
                role === ""
                  ? "text-neutral-400 dark:text-neutral-500 font-normal"
                  : "text-neutral-800 dark:text-neutral-200 font-normal"
              }`}
              style={{ fontWeight: 400 }}
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
                <div className="absolute top-full left-0 mt-1.5 w-full bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0">
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
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                        role === item.value
                          ? "text-neutral-900 dark:text-white bg-neutral-50/60 dark:bg-neutral-800/20"
                          : "text-neutral-650 dark:text-neutral-400"
                      }`}
                      style={{ fontWeight: 400 }}
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

      {/* Custom Unified Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                {modalTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-4 leading-normal">
                {modalMessage}
              </p>
            </div>
            
            {/* Horizontal border line */}
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            
            {/* Footer Button Split */}
            <div className="flex w-full">
              <button
                className="flex-1 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
