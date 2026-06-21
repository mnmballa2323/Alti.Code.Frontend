"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Check } from "lucide-react";
import { cn } from "@heroui/react";
import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";

type AvailableLicense = {
  id: string;
  name: string;
  type:
    | "Permissive"
    | "Copyleft"
    | "Strong Copyleft"
    | "Public Domain"
    | "Restricted"
    | "Source-Available";
  desc: string;
};

const AVAILABLE_LICENSES: AvailableLicense[] = [
  {
    id: "MIT",
    name: "MIT License",
    type: "Permissive",
    desc: "Simple and permissive. Allows commercial use, modification, distribution, and private use.",
  },
  {
    id: "Apache 2.0",
    name: "Apache 2.0",
    type: "Permissive",
    desc: "Permissive license with patent grants. Requires keeping copyright notices and disclaimers.",
  },
  {
    id: "GPL v3",
    name: "GPL v3",
    type: "Strong Copyleft",
    desc: "Strong copyleft license. Modifications must be released under same terms and be open source.",
  },
  {
    id: "BSD 3-Clause",
    name: "BSD 3-Clause",
    type: "Permissive",
    desc: "Permissive license similar to MIT, but prohibits using the names of creators for endorsement.",
  },
  {
    id: "BSD 2-Clause",
    name: "BSD 2-Clause",
    type: "Permissive",
    desc: "Simplified BSD license. Allows almost unrestricted software distribution and private use cases.",
  },
  {
    id: "LGPL v3",
    name: "LGPL v3",
    type: "Copyleft",
    desc: "Allows linking to proprietary code. Library modifications must remain under copyleft terms.",
  },
  {
    id: "CC0 1.0",
    name: "CC0 1.0",
    type: "Public Domain",
    desc: "Explicit public domain dedication. Waives copyright, patent, and database rights globally.",
  },
  {
    id: "ISC",
    name: "ISC",
    type: "Permissive",
    desc: "Permissive license equivalent to BSD 2-Clause and MIT, using simpler and cleaner language.",
  },
  {
    id: "GPL v2",
    name: "GPL v2",
    type: "Strong Copyleft",
    desc: "Legacy strong copyleft license. Restricts integration into proprietary closed-source systems.",
  },
  {
    id: "AGPL v3",
    name: "AGPL v3",
    type: "Strong Copyleft",
    desc: "Strong network copyleft. Requires network hosting services to make modified source available.",
  },
  {
    id: "Mozilla Public 2.0",
    name: "MPL 2.0",
    type: "Copyleft",
    desc: "Weak copyleft. Modifications must be open sourced, but can combine with proprietary codebases.",
  },
  {
    id: "Unlicense",
    name: "Unlicense",
    type: "Public Domain",
    desc: "Dedicated to public domain. Completely and permanently waives all copyright rights globally.",
  },
  {
    id: "CC-BY 4.0",
    name: "CC-BY 4.0",
    type: "Permissive",
    desc: "Attribution media license designed for creative assets, documentation, and database assets.",
  },
  {
    id: "LGPL v2.1",
    name: "LGPL v2.1",
    type: "Copyleft",
    desc: "Older weak copyleft library license allowing linking, but library modifications must stay open.",
  },
  {
    id: "Meta Llama",
    name: "Meta Llama",
    type: "Source-Available",
    desc: "Vibrant source-available license. Allows commercial use under 700 million monthly active users.",
  },
  {
    id: "OpenRAIL",
    name: "OpenRAIL",
    type: "Permissive",
    desc: "Responsible AI license that enforces downstream restrictions and safe behavioral usage rules.",
  },
  {
    id: "BSL 1.1",
    name: "BSL 1.1",
    type: "Source-Available",
    desc: "Source-available license. Restricts commercial production use until a specified future date.",
  },
  {
    id: "SSPL",
    name: "SSPL",
    type: "Strong Copyleft",
    desc: "Strong copyleft. Requires open-sourcing the hosting infrastructure stack if run as a service.",
  },
  {
    id: "ELv2",
    name: "Elastic v2",
    type: "Source-Available",
    desc: "Source-available license. Allows free modifications but prohibits hosting as managed SaaS.",
  },
  {
    id: "EPL 2.0",
    name: "EPL 2.0",
    type: "Copyleft",
    desc: "Weak copyleft license. Modifications must be under EPL, but can link with proprietary code.",
  },
  {
    id: "CC-BY-SA 4.0",
    name: "CC-BY-SA 4.0",
    type: "Copyleft",
    desc: "Share-alike media license. Requires all derivative creative works to share under same terms.",
  },
  {
    id: "CDDL 1.0",
    name: "CDDL 1.0",
    type: "Copyleft",
    desc: "Sun Microsystems file-level copyleft license. Commonly applied to the OpenZFS file systems.",
  },
  {
    id: "PSF 2.0",
    name: "PSF 2.0",
    type: "Permissive",
    desc: "Permissive open-source license used by Python software foundation core and major libraries.",
  },
  {
    id: "zlib",
    name: "zlib/libpng",
    type: "Permissive",
    desc: "Permissive license used in graphics libraries, compression algorithms, and game development.",
  },
  {
    id: "OFL 1.1",
    name: "OFL 1.1",
    type: "Permissive",
    desc: "Industry-standard font license. Allows free use, modification, and redistribution of typefaces.",
  },
  {
    id: "PostgreSQL",
    name: "PostgreSQL",
    type: "Permissive",
    desc: "Permissive MIT-style license used by PostgreSQL database development and associated tools.",
  },
  {
    id: "Ruby",
    name: "Ruby",
    type: "Permissive",
    desc: "Permissive dual-license option used by the Ruby programming language core implementation base.",
  },
  {
    id: "PHP 3.01",
    name: "PHP 3.01",
    type: "Permissive",
    desc: "Permissive license used by the PHP Group for the PHP interpreter engine and its extensions.",
  },
  {
    id: "WTFPL",
    name: "WTFPL",
    type: "Public Domain",
    desc: "Extremely simple public domain dedication. Allows you to do whatever you want with the code.",
  },
  {
    id: "Beerware",
    name: "Beerware",
    type: "Permissive",
    desc: "Informal and extremely permissive license. Keep this notice and buy the developer a nice beer.",
  },
  {
    id: "CC-BY-NC 4.0",
    name: "CC-BY-NC 4.0",
    type: "Restricted",
    desc: "Non-commercial media license. Prohibits commercial reuse of any documentation or media assets.",
  },
  {
    id: "CC-BY-NC-SA 4.0",
    name: "CC-BY-NC-SA 4.0",
    type: "Restricted",
    desc: "Non-commercial share-alike media license. Derivatives must be shared under these same terms.",
  },
  {
    id: "CC-BY-ND 4.0",
    name: "CC-BY-ND 4.0",
    type: "Restricted",
    desc: "No-derivatives media license. Allows copying and sharing but strictly prohibits modifications.",
  },
  {
    id: "CC-BY-NC-ND 4.0",
    name: "CC-BY-NC-ND 4.0",
    type: "Restricted",
    desc: "Non-commercial no-derivatives media license. Most restrictive CC license for non-code assets.",
  },
  {
    id: "Proprietary",
    name: "Proprietary",
    type: "Restricted",
    desc: "Strictly custom commercial license rules. Requires corporate legal team sign-off for ingestion.",
  },
  {
    id: "JSON",
    name: "JSON",
    type: "Restricted",
    desc: "Restricted MIT-based license containing the custom clause: 'Software must be used for Good.'",
  },
  {
    id: "MulanPSL-2.0",
    name: "MulanPSL-2.0",
    type: "Permissive",
    desc: "Permissive software license. The first Chinese open-source license officially approved by OSI.",
  },
  {
    id: "LAL 1.3",
    name: "LAL 1.3",
    type: "Copyleft",
    desc: "Free Art License. A European copyleft license designed for sharing artistic or creative assets.",
  },
  {
    id: "CPL 1.0",
    name: "CPL 1.0",
    type: "Copyleft",
    desc: "IBM early copyleft software license, serving as direct predecessor to Eclipse Public License.",
  },
  {
    id: "SPL 1.0",
    name: "SPL 1.0",
    type: "Copyleft",
    desc: "Sun Microsystems copyleft license that was historically used for early NetBeans development.",
  },
  {
    id: "Nokia",
    name: "Nokia OS",
    type: "Copyleft",
    desc: "Nokia's historical open-source license designed for early mobile and Symbian platform codebases.",
  },
  {
    id: "wxWindows",
    name: "wxWindows",
    type: "Copyleft",
    desc: "Custom LGPL-derivative software license. Designed specifically for the wxWidgets C++ library.",
  },
  {
    id: "Yahoo 1.1",
    name: "Yahoo 1.1",
    type: "Copyleft",
    desc: "Yahoo historical copyleft software license designed for early web platform development systems.",
  },
  {
    id: "Sleepycat",
    name: "Sleepycat",
    type: "Strong Copyleft",
    desc: "Historically used for Berkeley DB. Requires open-sourcing the entire host application code.",
  },
  {
    id: "IPL 1.0",
    name: "IPL 1.0",
    type: "Copyleft",
    desc: "IBM copyleft software license, acting as the direct predecessor to Eclipse Public License.",
  },
  {
    id: "NPL 1.1",
    name: "NPL 1.1",
    type: "Copyleft",
    desc: "Historical copyleft license created for the open-source Netscape Navigator browser components.",
  },
  {
    id: "Lucent 1.02",
    name: "Lucent 1.02",
    type: "Copyleft",
    desc: "Lucent Technologies open-source license, historically applied to the Plan 9 operating system.",
  },
  {
    id: "NCSA",
    name: "NCSA OS",
    type: "Permissive",
    desc: "University of Illinois/NCSA permissive license. Historically used by the LLVM compiler project.",
  },
  {
    id: "OSL 3.0",
    name: "OSL 3.0",
    type: "Copyleft",
    desc: "Copyleft license featuring explicit patent grant terms and network server distribution clauses.",
  },
  {
    id: "Fair",
    name: "Fair",
    type: "Permissive",
    desc: "Extremely short, simple two-sentence permissive open-source license with copyright waiver.",
  },
  {
    id: "MirOS",
    name: "MirOS",
    type: "Permissive",
    desc: "Permissive BSD/MIT derivative license popular in European and German BSD compiler projects.",
  },
  {
    id: "RPL 1.5",
    name: "RPL 1.5",
    type: "Strong Copyleft",
    desc: "Aggressive copyleft license requiring source disclosure even for internal private server use.",
  },
  {
    id: "UPL 1.0",
    name: "UPL 1.0",
    type: "Permissive",
    desc: "Oracle's permissive software license providing explicit patent grant and liability terms info.",
  },
  {
    id: "AFL 3.0",
    name: "AFL 3.0",
    type: "Permissive",
    desc: "Permissive license similar to BSD that includes explicit patent grants and liability terms.",
  },
];

export default function LicensesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedLicenses, setSelectedLicenses] = useState<
    { id: string; name: string }[]
  >([]);

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
      nextLicenses = [
        ...selectedLicenses,
        { id: license.id, name: license.name },
      ];
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

          <div className="flex w-full max-w-4xl flex-col gap-6 z-10">
            {/* Interactive Grid of Licenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {AVAILABLE_LICENSES.map((license) => {
                const isSelected = selectedLicenses.some(
                  (l) => l.id === license.id,
                );

                return (
                  <div
                    key={license.id}
                    className={cn(
                      "group border rounded-2xl p-5 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 relative overflow-hidden",
                      isSelected
                        ? "border-blue-500/80 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-950/15 shadow-sm shadow-blue-500/5 scale-[1.01]"
                        : "border-default-200/60 bg-white dark:bg-default-50 hover:border-default-400 hover:shadow-sm",
                    )}
                    onClick={() => handleToggleLicense(license)}
                  >
                    {/* Circle Selection Indicator on the top right */}
                    <div
                      className={cn(
                        "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-20",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white scale-100"
                          : "border-default-300 group-hover:border-default-400 group-hover:scale-105 bg-transparent",
                      )}
                    >
                      {isSelected && (
                        <Check className="size-3" strokeWidth={3} />
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between pr-6">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap overflow-hidden">
                          {license.name}
                        </h3>
                      </div>

                      <p className="text-xs text-default-500 leading-5 pr-2 h-[60px] overflow-hidden">
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
