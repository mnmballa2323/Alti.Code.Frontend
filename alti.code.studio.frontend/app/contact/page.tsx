"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";
import AgentSwarmAnimation from "@/components/landing-page/AgentSwarmAnimation";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      alert("Please fill in all required fields.");

      return;
    }
    // Simulate API request
    setSubmitted(true);
    setEmail("");
    setName("");
    setMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white w-full overflow-x-hidden font-sans">
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16 md:py-24 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left Column: Contact Form */}
          <div className="w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold font-secondary tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-black via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                Contact us
              </h1>
            </div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
                  <Icon className="w-8 h-8" icon="lucide:check-circle" />
                </div>
                <h3 className="text-2xl font-bold">Message sent!</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                  Thank you for reaching out. A swarm specialist will get back
                  to you shortly.
                </p>
                <Button
                  className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold mt-4 px-6"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <input
                    aria-label="Enter Full Name"
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
                    id="name"
                    placeholder="Enter Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    required
                    aria-label="Enter Email Address"
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
                    id="email"
                    placeholder="Enter Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <textarea
                    required
                    aria-label="Enter Your Message"
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-none text-black dark:text-white"
                    id="message"
                    placeholder="Enter Your Message"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  className="w-full rounded-2xl bg-black dark:bg-white text-white dark:text-black font-normal py-4 text-sm hover:opacity-90 transition-opacity mt-2 border border-transparent"
                  type="submit"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Interactive Agent Swarm Animation */}
          <div className="flex items-start justify-end w-full md:pt-[80px]">
            <div className="w-full max-w-[424px]">
              <AgentSwarmAnimation />
            </div>
          </div>
        </div>
      </main>

      <PreFooter />
    </div>
  );
}
