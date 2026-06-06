"use client";

import React from "react";

export default function AppConnectorsSection() {
  const apps = [
    { name: "Slack", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/slack-icon.svg" alt="Slack" className="w-8 h-8 object-contain" /> },
    { name: "Jira", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/jira.svg" alt="Jira" className="w-8 h-8 object-contain" /> },
    { name: "GitHub", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/github-icon.svg" alt="GitHub" className="w-8 h-8 object-contain" /> },
    { name: "Linear", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/linear-icon.svg" alt="Linear" className="w-8 h-8 object-contain" /> },
    { name: "Notion", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/notion-icon.svg" alt="Notion" className="w-8 h-8 object-contain" /> },
    { name: "Stripe", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/stripe.svg" alt="Stripe" className="w-8 h-8 object-contain" /> },
    { name: "Zendesk", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/zendesk-icon.svg" alt="Zendesk" className="w-8 h-8 object-contain" /> },
    { name: "Discord", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/discord-icon.svg" alt="Discord" className="w-8 h-8 object-contain" /> },
    { name: "Figma", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/figma.svg" alt="Figma" className="w-8 h-8 object-contain" /> },
    { name: "Salesforce", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/salesforce.svg" alt="Salesforce" className="w-8 h-8 object-contain" /> },
    { name: "Twilio", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/twilio-icon.svg" alt="Twilio" className="w-8 h-8 object-contain" /> },
    { name: "SendGrid", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/sendgrid-icon.svg" alt="SendGrid" className="w-8 h-8 object-contain" /> },
    { name: "Datadog", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/datadog-icon.svg" alt="Datadog" className="w-8 h-8 object-contain" /> },
    { name: "Asana", icon: <img src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/asana-icon.svg" alt="Asana" className="w-8 h-8 object-contain" /> }
  ];

  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeApps = [...apps, ...apps];

  return (
    <section className="w-full py-32 bg-gray-50 text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 items-center text-center">
        
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            165 App Connectors. <br />
            <span className="text-[#4169E1]">Plug into everything.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium mx-auto">
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
