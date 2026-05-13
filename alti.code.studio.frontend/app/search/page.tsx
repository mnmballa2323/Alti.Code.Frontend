"use client";

import dynamic from "next/dynamic";

import ChatBotLayout from "@/components/ChatbotLayout";

const UltimateRagTerminal = dynamic(
  () =>
    import("@/components/UltimateRagTerminal").then(
      (mod) => mod.UltimateRagTerminal,
    ),
  { ssr: false },
);

export default function SearchPage() {
  return (
    <ChatBotLayout>
      <UltimateRagTerminal />
    </ChatBotLayout>
  );
}
