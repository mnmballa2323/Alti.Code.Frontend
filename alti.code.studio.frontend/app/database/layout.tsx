import React from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatBotLayout>{children}</ChatBotLayout>;
}
