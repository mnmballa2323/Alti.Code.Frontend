"use client";

import React from "react";
import { 
  SiSlack, SiJira, SiGithub, SiLinear, SiNotion, 
  SiStripe, SiZendesk, SiDiscord, SiFigma, 
  SiSalesforce, SiTwilio, SiSendgrid, SiDatadog, SiAsana
} from "react-icons/si";

export default function AppConnectorsSection() {
  const apps = [
    { name: "Slack", icon: <SiSlack className="w-8 h-8 text-black" /> },
    { name: "Jira", icon: <SiJira className="w-8 h-8 text-black" /> },
    { name: "GitHub", icon: <SiGithub className="w-8 h-8 text-black" /> },
    { name: "Linear", icon: <SiLinear className="w-8 h-8 text-black" /> },
    { name: "Notion", icon: <SiNotion className="w-8 h-8 text-black" /> },
    { name: "Stripe", icon: <SiStripe className="w-8 h-8 text-black" /> },
    { name: "Zendesk", icon: <SiZendesk className="w-8 h-8 text-black" /> },
    { name: "Discord", icon: <SiDiscord className="w-8 h-8 text-black" /> },
    { name: "Figma", icon: <SiFigma className="w-8 h-8 text-black" /> },
    { name: "Salesforce", icon: <SiSalesforce className="w-8 h-8 text-black" /> },
    { name: "Twilio", icon: <SiTwilio className="w-8 h-8 text-black" /> },
    { name: "SendGrid", icon: <SiSendgrid className="w-8 h-8 text-black" /> },
    { name: "Datadog", icon: <SiDatadog className="w-8 h-8 text-black" /> },
    { name: "Asana", icon: <SiAsana className="w-8 h-8 text-black" /> }
  ];

  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeApps = [...apps, ...apps];

  return (
    <section className="w-full py-32 bg-gray-50 text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 items-center text-center">
        
        <div className="flex flex-col gap-6 max-w-3xl">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            165 App Connectors. <br />
            <span className="text-gray-400">Plug into everything.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Your agents seamlessly integrate with the tools your team already relies on. <br className="hidden md:block" />
            Read tickets, write documentation, and automate workflows across your stack.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden py-10 fade-edges">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll-left {
              animation: scroll-left 40s linear infinite;
              width: max-content;
            }
            .fade-edges {
              mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
          `}} />

          <div className="flex animate-scroll-left hover:[animation-play-state:paused] gap-8">
            {marqueeApps.map((app, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white border border-gray-200 shadow-sm whitespace-nowrap group hover:border-gray-400 transition-colors cursor-pointer"
              >
                {app.icon}
                <span className="text-lg font-semibold tracking-tight text-gray-700 group-hover:text-black transition-colors">{app.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
