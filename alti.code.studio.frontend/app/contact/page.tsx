"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";

import Navbar from "@/components/navbar";
import PreFooter from "@/components/landing-page/pre-footer";

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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left Column: Heading and Info */}
          <div className="flex flex-col gap-6 md:sticky md:top-28">
            <div>
              <span className="text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                Contact Sales & Support
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-secondary mt-2 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-black via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
                Get in touch
              </h1>
            </div>

            <p className="text-gray-600 dark:text-neutral-400 font-normal text-base md:text-lg leading-relaxed max-w-md">
              Have questions about Alti Code Studio? Our team is here to help you scale your local agent swarms with enterprise cloud orchestration.
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-4 text-gray-600 dark:text-neutral-400">
                <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200/50 dark:border-zinc-800/50">
                  <Icon className="w-5 h-5" icon="lucide:mail" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium">Email Us</p>
                  <a className="text-sm font-semibold text-black dark:text-white hover:underline" href="mailto:support@insocode.com">
                    support@insocode.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600 dark:text-neutral-400">
                <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200/50 dark:border-zinc-800/50">
                  <Icon className="w-5 h-5" icon="lucide:map-pin" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium">Our HQ</p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    575 Market St, San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form Card */}
          <div className="bg-white dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-900 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-2xl/30 backdrop-blur-md relative overflow-hidden">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
                  <Icon className="w-8 h-8" icon="lucide:check-circle" />
                </div>
                <h3 className="text-2xl font-bold">Message sent!</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                  Thank you for reaching out. A swarm specialist will get back to you shortly.
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
                  <label className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
                    id="email"
                    placeholder="john@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider" htmlFor="message">
                    Your Message *
                  </label>
                  <textarea
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none text-black dark:text-white"
                    id="message"
                    placeholder="Tell us what you're building..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 hover:opacity-90 transition-opacity mt-2"
                  type="submit"
                >
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PreFooter />
    </div>
  );
}
