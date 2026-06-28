"use client";

import React from "react";
import { Download } from "lucide-react";

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

  return (
    <div className="w-full pt-6">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[18%_18%_48%_16%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>FIRST NAME</div>
          <div>LAST NAME</div>
          <div>EMAIL ADDRESS</div>
          <div>ROLE TYPE</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {mockMembers.map((member, i) => (
            <div
              key={i}
              className="grid grid-cols-[18%_18%_48%_16%] items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              <div>{member.firstName}</div>
              <div>{member.lastName}</div>
              <div className="flex items-center gap-2">
                {member.email}
                {member.isYou && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold">
                    You
                  </span>
                )}
              </div>
              <div>{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
