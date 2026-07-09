"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { DUMMY_API_KEYS } from "../api-keys/data";
import { DUMMY_EMAILS } from "../email-accounts/data";
import { DUMMY_LOGINS } from "../platform-logins/data";

type TabType = "api" | "email" | "login";

export default function AddNewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("api");
  const [showPopup, setShowPopup] = useState(false);

  // API Key Form State
  const [apiName, setApiName] = useState("");
  const [apiPrefix, setApiPrefix] = useState("");

  // Email Account Form State
  const [emailAddress, setEmailAddress] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // Account Login Form State
  const [loginPlatform, setLoginPlatform] = useState("");
  const [loginWebsite, setLoginWebsite] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleSave = () => {
    // Basic validation based on active tab
    if (activeTab === "api" && (!apiName || !apiPrefix)) return;
    if (activeTab === "email" && (!emailAddress || !emailPassword)) return;
    if (
      activeTab === "login" &&
      (!loginPlatform || !loginWebsite || !loginUsername || !loginPassword)
    )
      return;

    const newId = Math.random().toString(36).substring(2, 9);

    if (activeTab === "api") {
      DUMMY_API_KEYS.unshift({
        id: newId,
        name: apiName,
        prefix: apiPrefix,
        created: "Just now",
        lastUsed: "Never",
        status: "Active",
      });
    } else if (activeTab === "email") {
      DUMMY_EMAILS.unshift({
        id: newId,
        address: emailAddress,
        password: emailPassword,
      });
    } else if (activeTab === "login") {
      DUMMY_LOGINS.unshift({
        id: newId,
        platform: loginPlatform,
        website: loginWebsite,
        username: loginUsername,
        password: loginPassword,
      });
    }

    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (activeTab === "api") router.push("/owner/api-keys");
    if (activeTab === "email") router.push("/owner/email-accounts");
    if (activeTab === "login") router.push("/owner/platform-logins");
  };

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col">
        {/* Header and Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1 p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "api"
                  ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("api")}
            >
              API Key
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "email"
                  ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email Account
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Account Login
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex flex-col gap-6 max-w-3xl">
          {activeTab === "api" && (
            <>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Account Name"
                  type="text"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                />
              </div>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Secret Key"
                  type="text"
                  value={apiPrefix}
                  onChange={(e) => setApiPrefix(e.target.value)}
                />
              </div>
            </>
          )}

          {activeTab === "email" && (
            <>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Email Address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Password"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {activeTab === "login" && (
            <>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Platform Name"
                  type="text"
                  value={loginPlatform}
                  onChange={(e) => setLoginPlatform(e.target.value)}
                />
              </div>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Website Domain"
                  type="text"
                  value={loginWebsite}
                  onChange={(e) => setLoginWebsite(e.target.value)}
                />
              </div>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              <div className="w-full">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
                  placeholder="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="w-full mt-2">
            <button
              className="w-full h-11 px-5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-normal rounded-xl"
              onClick={handleSave}
            >
              Save
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
                Successfully Added
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                The new{" "}
                {activeTab === "api"
                  ? "API Key"
                  : activeTab === "email"
                    ? "Email Account"
                    : "Account Login"}{" "}
                has been saved.
              </p>
            </div>
            <div className="flex border-t border-neutral-200 dark:border-neutral-700">
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={handleClosePopup}
              >
                {activeTab === "api"
                  ? "View API Keys"
                  : activeTab === "email"
                    ? "View Email Accounts"
                    : "View Account Logins"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
