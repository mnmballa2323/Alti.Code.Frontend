"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Scale, Check } from "lucide-react";
import { cn } from "@heroui/react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";

type AvailableLicense = {
  id: string;
  name: string;
  type: "Permissive" | "Copyleft" | "Strong Copyleft" | "Public Domain" | "Restricted" | "Source-Available";
  desc: string;
};

const AVAILABLE_LICENSES: AvailableLicense[] = [
  { id: "MIT", name: "MIT License", type: "Permissive", desc: "Simple and permissive. Allows commercial use, modification, distribution, and private use." },
  { id: "Apache 2.0", name: "Apache 2.0", type: "Permissive", desc: "Permissive license with patent grant clauses. Requires preservation of copyright and license notices." },
  { id: "GPL v3", name: "GPL v3", type: "Strong Copyleft", desc: "Strong copyleft license. Modifications must be released under the same license and open-source." },
  { id: "BSD 3-Clause", name: "BSD 3-Clause", type: "Permissive", desc: "Permissive license similar to MIT but with restrictions on endorsement using creator names." },
  { id: "BSD 2-Clause", name: "BSD 2-Clause", type: "Permissive", desc: "Simplified BSD license. Allows almost unrestricted distribution and use." },
  { id: "LGPL v3", name: "LGPL v3", type: "Copyleft", desc: "Allows linking to proprietary code, but modifications to the library must be open-sourced." },
  { id: "CC0 1.0", name: "CC0 1.0", type: "Public Domain", desc: "Explicit public domain dedication. Waives copyright and database rights globally." },
  { id: "ISC", name: "ISC License", type: "Permissive", desc: "Equivalent to the BSD 2-Clause and MIT licenses, with simpler language." },
  { id: "GPL v2", name: "GPL v2", type: "Strong Copyleft", desc: "Legacy strong copyleft. Prevents integration into closed-source proprietary codebases." },
  { id: "AGPL v3", name: "AGPL v3", type: "Strong Copyleft", desc: "Network copyleft. Requires network services using modified code to make source code available." },
  { id: "Mozilla Public 2.0", name: "Mozilla Public 2.0", type: "Copyleft", desc: "Weak copyleft. Modifications must be open sourced, but can be combined with proprietary files." },
  { id: "Unlicense", name: "The Unlicense", type: "Public Domain", desc: "Dedicated to the public domain. Completely waives all copyright rights globally." },
  { id: "CC-BY 4.0", name: "CC-BY 4.0", type: "Permissive", desc: "Attribution-only license designed for non-code assets, docs, and databases." },
  { id: "LGPL v2.1", name: "LGPL v2.1", type: "Copyleft", desc: "Older weak copyleft license allowing linking, but library modifications must be open source." },
  { id: "Meta Llama", name: "Meta Llama License", type: "Source-Available", desc: "Allows commercial use under 700M active users. Requires attribution." },
  { id: "OpenRAIL", name: "OpenRAIL License", type: "Permissive", desc: "AI-specific license focusing on responsible use and downstream behavioral restrictions." },
  { id: "BSL 1.1", name: "Business Source License 1.1", type: "Source-Available", desc: "Public source code, non-production use only until a Change Date when it becomes open-source." },
  { id: "SSPL", name: "Server Side Public License", type: "Strong Copyleft", desc: "Requires offering the entire service management stack as open source if run as a service." },
  { id: "ELv2", name: "Elastic License v2", type: "Source-Available", desc: "Allows free use, modification, and redistribution, but bars hosting it as a managed service." },
  { id: "EPL 2.0", name: "EPL 2.0", type: "Copyleft", desc: "Weak copyleft. Modifications must be under EPL, but can be linked with proprietary code." },
  { id: "CC-BY-SA 4.0", name: "CC-BY-SA 4.0", type: "Copyleft", desc: "Creative Commons Attribution-ShareAlike. Derivative works must share under same terms." },
  { id: "CDDL 1.0", name: "CDDL 1.0", type: "Copyleft", desc: "Sun Microsystems weak copyleft. File-level copyleft often used for OpenZFS." },
  { id: "PSF 2.0", name: "Python Software Foundation License 2.0", type: "Permissive", desc: "Permissive license used by Python core and various third-party Python modules." },
  { id: "zlib", name: "zlib/libpng License", type: "Permissive", desc: "Permissive license commonly used in game engines, compression, and graphics libraries." },
  { id: "OFL 1.1", name: "SIL Open Font License 1.1", type: "Permissive", desc: "Industry-standard license for open-source fonts and typography on GitHub." },
  { id: "PostgreSQL", name: "PostgreSQL License", type: "Permissive", desc: "Permissive MIT-like license used by the PostgreSQL Database project." },
  { id: "Ruby", name: "Ruby License", type: "Permissive", desc: "Permissive dual-license used by the Ruby programming language core." },
  { id: "PHP 3.01", name: "PHP License 3.01", type: "Permissive", desc: "Permissive license used by the PHP Group for PHP and associated extensions." },
  { id: "WTFPL", name: "WTFPL", type: "Public Domain", desc: "Do What the Fuck You Want to Public License. Extremely simple waiver of copyright." },
  { id: "Beerware", name: "Beerware License", type: "Permissive", desc: "Informal permissive license. Retain notice and buy the author a beer if you meet." },
  { id: "CC-BY-NC 4.0", name: "CC-BY-NC 4.0", type: "Restricted", desc: "Creative Commons Attribution-NonCommercial. Restricts use to non-commercial purposes." },
  { id: "CC-BY-NC-SA 4.0", name: "CC-BY-NC-SA 4.0", type: "Restricted", desc: "Creative Commons Attribution-NonCommercial-ShareAlike media/asset license." },
  { id: "CC-BY-ND 4.0", name: "CC-BY-ND 4.0", type: "Restricted", desc: "Creative Commons Attribution-NoDerivatives. Allows sharing but no derivatives." },
  { id: "CC-BY-NC-ND 4.0", name: "CC-BY-NC-ND 4.0", type: "Restricted", desc: "Creative Commons Attribution-NonCommercial-NoDerivatives. Most restrictive media license." },
  { id: "Proprietary", name: "Proprietary / Custom", type: "Restricted", desc: "Strictly custom or commercial rules. Requires legal team sign-off for ingestion." },
  { id: "JSON", name: "JSON License", type: "Restricted", desc: "MIT-based license with an added clause: 'The Software shall be used for Good, not Evil.'" },
  { id: "MulanPSL-2.0", name: "MulanPSL-2.0", type: "Permissive", desc: "Mulan Permissive Software License. The first Chinese open-source license approved by OSI." },
  { id: "LAL 1.3", name: "LAL 1.3 (Licence Art Libre)", type: "Copyleft", desc: "Free Art License. A European copyleft license designed for artistic and creative works." },
  { id: "CPL 1.0", name: "Common Public License 1.0", type: "Copyleft", desc: "IBM's early copyleft license and predecessor to the Eclipse Public License." },
  { id: "SPL 1.0", name: "Sun Public License 1.0", type: "Copyleft", desc: "Sun Microsystems' early copyleft license used for NetBeans and other projects." },
  { id: "Nokia", name: "Nokia Open Source License", type: "Copyleft", desc: "Nokia's historical open-source license for early Symbian/mobile codebases." },
  { id: "wxWindows", name: "wxWindows Library License", type: "Copyleft", desc: "Custom LGPL-derivative license used by the wxWidgets library." },
  { id: "Yahoo 1.1", name: "Yahoo! Public License 1.1", type: "Copyleft", desc: "Yahoo's historical open-source license for early web platform projects." },
  { id: "Sleepycat", name: "Sleepycat License", type: "Strong Copyleft", desc: "Historically used for Berkeley DB. Requires open-sourcing the entire application." },
  { id: "IPL 1.0", name: "IBM Public License 1.0", type: "Copyleft", desc: "IBM's early copyleft license, predecessor to the Eclipse Public License." },
  { id: "NPL 1.1", name: "Netscape Public License 1.1", type: "Copyleft", desc: "Historical copyleft license created for the open-source Netscape Navigator components." },
  { id: "Lucent 1.02", name: "Lucent Public License 1.02", type: "Copyleft", desc: "Lucent Technologies open-source license, historically used for Plan 9 code." },
  { id: "NCSA", name: "NCSA Open Source License", type: "Permissive", desc: "University of Illinois/NCSA permissive license. Formerly used by the LLVM project." },
  { id: "OSL 3.0", name: "Open Software License 3.0", type: "Copyleft", desc: "Copyleft license featuring explicit patent grants and network distribution clauses." },
  { id: "Fair", name: "Fair License", type: "Permissive", desc: "Extremely short, simple two-sentence permissive open-source license." },
  { id: "MirOS", name: "MirOS License", type: "Permissive", desc: "Permissive BSD/MIT derivative popular in European and German BSD projects." },
  { id: "RPL 1.5", name: "Reciprocal Public License 1.5", type: "Strong Copyleft", desc: "Aggressive copyleft requiring source disclosure even for internal private use." },
  { id: "UPL 1.0", name: "Universal Permissive License 1.0", type: "Permissive", desc: "Oracle's permissive license providing explicit patent grant clauses." }
];

export default function LicensesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedLicenses, setSelectedLicenses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    // Synchronize initial state from localStorage
    const handleSyncFromSidebar = () => {
      const saved = localStorage.getItem("selected_licenses");
      if (saved) {
        try {
          setSelectedLicenses(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse selected_licenses in page", e);
        }
      }
    };

    window.addEventListener("sync-licenses-page", handleSyncFromSidebar);
    handleSyncFromSidebar(); // Initial sync

    return () => {
      window.removeEventListener("sync-licenses-page", handleSyncFromSidebar);
    };
  }, [dispatch]);

  const handleToggleLicense = (license: AvailableLicense) => {
    let nextLicenses;
    const isAlreadySelected = selectedLicenses.some((l) => l.id === license.id);

    if (isAlreadySelected) {
      nextLicenses = selectedLicenses.filter((l) => l.id !== license.id);
    } else {
      nextLicenses = [...selectedLicenses, { id: license.id, name: license.name }];
    }

    setSelectedLicenses(nextLicenses);
    localStorage.setItem("selected_licenses", JSON.stringify(nextLicenses));
    window.dispatchEvent(new CustomEvent("sync-licenses"));
  };

  const getBadgeColor = (type: AvailableLicense["type"]) => {
    switch (type) {
      case "Permissive":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Copyleft":
      case "Strong Copyleft":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Public Domain":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Restricted":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "Source-Available":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-default-100 text-default-600 border-default-200";
    }
  };



  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-transparent flex flex-col h-full font-sans text-foreground">
        <div className="relative flex flex-col w-full items-center justify-start py-12 px-6 md:px-12">
          {/* Visual abstract overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none blur-sm mix-blend-screen">
            <AgentCommandCenter />
          </div>

          <div className="flex w-full max-w-4xl flex-col gap-6 z-10">
            {/* Interactive Grid of Licenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {AVAILABLE_LICENSES.map((license) => {
                const isSelected = selectedLicenses.some((l) => l.id === license.id);

                return (
                  <div
                    key={license.id}
                    onClick={() => handleToggleLicense(license)}
                    className={cn(
                      "group border rounded-2xl p-5 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 relative overflow-hidden",
                      isSelected
                        ? "border-blue-500/80 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-950/15 shadow-sm shadow-blue-500/5 scale-[1.01]"
                        : "border-default-200/60 bg-white dark:bg-default-50 hover:border-default-400 hover:shadow-sm"
                    )}
                  >
                    {/* Circle Selection Indicator on the top right */}
                    <div className={cn(
                      "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-20",
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white scale-100"
                        : "border-default-300 group-hover:border-default-400 group-hover:scale-105 bg-transparent"
                    )}>
                      {isSelected && <Check className="size-3" strokeWidth={3} />}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between pr-6">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {license.name}
                        </h3>
                      </div>

                      <p className="text-xs text-default-500 leading-relaxed pr-2">
                        {license.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
