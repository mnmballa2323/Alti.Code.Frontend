"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";

export default function InvitePage() {
  const profile = useAppSelector((state) => state.user.data);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSendInvite = () => {
    if (!firstName || !lastName || !email) return;
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <input
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <button
              onClick={handleSendInvite}
              className="w-full h-11 px-5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-normal rounded-xl"
            >
              Send Invite
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161b22] w-auto min-w-[300px] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-1.5">
                Invitation Sent
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                You invited <span className="font-medium text-neutral-700 dark:text-neutral-300">{firstName} {lastName}</span> to the support platform
              </p>
            </div>
            <div className="flex border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
