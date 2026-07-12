"use client";
import type { RootState } from "@/store";

import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { Accordion, AccordionItem, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";

import MessageCard from "./message-card";
import { MarkdownChats } from "./markdown-chats";

import { ToolExecution } from "@/store/messagesSlice";

const FormattedReply = ({ reply }: { reply: string }) => {
  // Deep XSS sanitization
  const cleanReply =
    typeof window !== "undefined" ? DOMPurify.sanitize(reply) : reply;

  return (
    <div className="w-full" data-color-mode="light">
      <MDEditor.Markdown
        components={MarkdownChats}
        remarkPlugins={[remarkGfm]}
        source={cleanReply}
        // style={docco}
      />
    </div>
  );
};

const ToolExecutionLog = ({ executions }: { executions: ToolExecution[] }) => {
  if (!executions || executions.length === 0) return null;

  return (
    <div className="w-full max-w-full mb-4">
      <Accordion
        className="bg-default-50/50 backdrop-blur-md dark:bg-black/30 border border-default-200"
        variant="bordered"
      >
        <AccordionItem
          key="1"
          aria-label="Swarm Execution Trace"
          title={
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">
                View Agent Reasoning Trace
              </span>
              <Chip color="primary" size="sm" variant="flat">
                {executions.length} actions
              </Chip>
            </div>
          }
        >
          <div className="flex flex-col gap-3 py-2">
            {executions.map((exec, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 p-3 rounded-xl bg-default-100/50 dark:bg-default-100/10 border border-default-200"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-default-700 dark:text-default-300">
                    {exec.tool}
                  </span>
                  <Chip
                    color={exec.status === "success" ? "success" : "danger"}
                    size="sm"
                    variant="dot"
                  >
                    {exec.status}
                  </Chip>
                </div>
                <div className="text-[10px] font-mono text-default-500 max-h-32 overflow-auto bg-default-200/30 p-2 rounded">
                  <pre>{JSON.stringify(exec.args, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const RagPipelineTelemetry = ({ pipeline }: { pipeline?: any[] }) => {
  if (!pipeline || pipeline.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-2.5 mb-2.5 font-mono text-[10px]">
      <div className="text-default-400 font-semibold mr-1 flex items-center gap-1 select-none">
        <Icon className="size-3.5" icon="solar:database-bold-duotone" />
        <span>RAG Context:</span>
      </div>
      {pipeline.map((source, index) => {
        let chipColor: "default" | "success" | "warning" | "danger" = "default";
        let statusLabel = "";

        if (source.status === "done") {
          chipColor = "success";
          statusLabel = `${source.durationMs}ms`;
        } else if (source.status === "skipped") {
          chipColor = "default";
          statusLabel = "skipped";
        } else {
          chipColor = "danger";
          statusLabel = "failed";
        }

        return (
          <Chip
            key={index}
            className="h-5 px-1 bg-default-100/50 dark:bg-black/20 border border-default-200/30"
            color={chipColor}
            size="sm"
            variant="flat"
          >
            <span className="font-semibold text-default-500">
              {source.label}:
            </span>{" "}
            <span
              className={cn(
                "font-bold",
                source.status === "done" && "text-success",
                source.status === "skipped" && "text-default-400",
                source.status === "error" && "text-danger",
              )}
            >
              {statusLabel}
            </span>
          </Chip>
        );
      })}
    </div>
  );
};

export default function MessageContainer() {
  const { messages, loading } = useSelector(
    (state: RootState) => state.messages,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {messages.map((chatMessage, index) => {
        const isAssistantMessage = !!chatMessage.reply;

        return (
          <React.Fragment key={index}>
            {chatMessage.prompt && (
              <div className="max-w-full flex justify-end">
                <MessageCard
                  key={`user-${index}`}
                  className="justify-end"
                  message={chatMessage.prompt}
                  messageClassName="bg-[#e4e4e7] dark:bg-[#27272a] text-default-600 w-full max-w-full whitespace-pre-wrap break-words"
                  showFeedback={false}
                />
              </div>
            )}

            {/* AI Response --- */}
            {isAssistantMessage && (
              <div className="max-w-full flex justify-start">
                <MessageCard
                  key={`assistant-${index}`}
                  className="justify-start"
                  message={
                    <div className="flex flex-col w-full">
                      <ToolExecutionLog
                        executions={chatMessage.toolExecutions || []}
                      />
                      <RagPipelineTelemetry
                        pipeline={chatMessage.ragPipeline}
                      />
                      <FormattedReply reply={chatMessage.reply as string} />
                    </div>
                  }
                  messageClassName="bg-transparent text-white w-full max-w-full"
                  showFeedback={true}
                  status={"success"}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* --- Loading Indicator (Live Execution Telemetry) --- */}
      {loading && messages.length > 0 && (
        <div className="flex items-center justify-start py-2 w-full max-w-full">
          <MessageCard
            className="justify-start w-full"
            message={
              <div className="flex flex-col gap-2 w-full p-4 bg-black/40 border border-primary/30 rounded-xl font-mono text-xs overflow-hidden relative">
                {/* Simulated Telemetry Stream */}
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>
                    Swarm Agent Active: Establishing secure context...
                  </span>
                </div>
                <div className="text-default-500 truncate opacity-70">
                  <span className="text-success">[sys]</span>{" "}
                  vault_injection_protocol: VERIFIED
                </div>
                <div className="text-default-500 truncate opacity-70">
                  <span className="text-success">[mcp]</span> scanning workspace
                  topology...
                </div>
                <div className="text-default-500 truncate opacity-70 animate-pulse">
                  <span className="text-warning">[exec]</span> generating
                  autonomous payload...
                </div>

                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
              </div>
            }
            messageClassName="bg-transparent text-white w-full max-w-full"
            showFeedback={false}
          />
        </div>
      )}

      {/* 4. Attach the ref to an empty div */}
      <div ref={messagesEndRef} />
    </div>
  );
}
