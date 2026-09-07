"use client";

import React from "react";

import Navbar from "@/components/navbar";
import CloudsSection from "@/components/landing-page/clouds-section";

export default function CloudsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black w-full overflow-x-hidden font-sans relative">
      <Navbar />
      <main className="flex-1 flex flex-col w-full relative z-10 pt-20">
        <CloudsSection />
      </main>
    </div>
  );
}
