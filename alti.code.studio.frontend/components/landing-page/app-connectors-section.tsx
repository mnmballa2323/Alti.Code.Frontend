"use client";

import React from "react";

export default function AppConnectorsSection() {
  const apps = [
    {
      name: "Slack",
      icon: (
        <img
          alt="Slack"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/slack-icon.svg"
        />
      ),
    },
    {
      name: "Jira",
      icon: (
        <img
          alt="Jira"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/jira.svg"
        />
      ),
    },
    {
      name: "GitHub",
      icon: (
        <img
          alt="GitHub"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/github-icon.svg"
        />
      ),
    },
    {
      name: "Linear",
      icon: (
        <img
          alt="Linear"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/linear-icon.svg"
        />
      ),
    },
    {
      name: "Notion",
      icon: (
        <img
          alt="Notion"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/notion-icon.svg"
        />
      ),
    },
    {
      name: "Stripe",
      icon: (
        <img
          alt="Stripe"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/stripe.svg"
        />
      ),
    },
    {
      name: "Zendesk",
      icon: (
        <img
          alt="Zendesk"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/zendesk-icon.svg"
        />
      ),
    },
    {
      name: "Discord",
      icon: (
        <img
          alt="Discord"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/discord-icon.svg"
        />
      ),
    },
    {
      name: "Figma",
      icon: (
        <img
          alt="Figma"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/figma.svg"
        />
      ),
    },
    {
      name: "Salesforce",
      icon: (
        <img
          alt="Salesforce"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/salesforce.svg"
        />
      ),
    },
    {
      name: "Twilio",
      icon: (
        <img
          alt="Twilio"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/twilio-icon.svg"
        />
      ),
    },
    {
      name: "SendGrid",
      icon: (
        <img
          alt="SendGrid"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/sendgrid-icon.svg"
        />
      ),
    },
    {
      name: "Datadog",
      icon: (
        <img
          alt="Datadog"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/datadog-icon.svg"
        />
      ),
    },
    {
      name: "Asana",
      icon: (
        <img
          alt="Asana"
          className="w-8 h-8 object-contain"
          src="https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos/asana-icon.svg"
        />
      ),
    },
  ];

  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeApps = [...apps, ...apps];

  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 items-center text-center">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            175 App Connectors. <br />
            <span className="text-[#4169E1]">Plug into everything.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium mx-auto">
            Your agents seamlessly integrate with the tools your team already
            relies on. <br className="hidden md:block" />
            Read tickets, write documentation, and automate workflows across
            your stack.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden py-10 fade-edges">
          <style
            dangerouslySetInnerHTML={{
              __html: `
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
          `,
            }}
          />

          <div className="flex animate-scroll-left hover:[animation-play-state:paused] gap-8">
            {marqueeApps.map((app, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white border border-gray-200 shadow-sm whitespace-nowrap group hover:border-gray-400 transition-colors cursor-pointer"
              >
                {app.icon}
                <span className="text-lg font-semibold tracking-tight text-gray-700 group-hover:text-black transition-colors">
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
