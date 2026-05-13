"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Chip,
  useDisclosure,
  CheckboxGroup,
  Checkbox,
  Spinner,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Connection {
  appId: string;
  appName?: string;
  status?: string;
}

export default function WorkflowsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [workflowName, setWorkflowName] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [webhookEvent, setWebhookEvent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Dashboard state
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([
    {
      id: "wf-1",
      name: "Daily Standup Summary",
      triggerType: "schedule",
      status: "active",
    },
    {
      id: "wf-2",
      name: "GitHub PR Auto-Reviewer",
      triggerType: "webhook",
      status: "active",
    },
  ]);

  // Split Pane State
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Mock Data
  const MOCK_LOGS: Record<string, any[]> = {
    "wf-1": [
      {
        id: "log-1",
        status: "success",
        timestamp: "Today at 10:00 AM",
        duration: "1.2s",
        trigger: "Schedule",
      },
      {
        id: "log-2",
        status: "failed",
        timestamp: "Yesterday at 10:00 AM",
        duration: "3.4s",
        trigger: "Schedule",
        error: "API Rate Limit",
      },
      {
        id: "log-3",
        status: "success",
        timestamp: "Mon at 10:00 AM",
        duration: "1.1s",
        trigger: "Schedule",
      },
    ],
    "wf-2": [
      {
        id: "log-4",
        status: "success",
        timestamp: "Just now",
        duration: "8.5s",
        trigger: "Webhook (github.pull_request)",
      },
      {
        id: "log-5",
        status: "success",
        timestamp: "2 hours ago",
        duration: "5.2s",
        trigger: "Webhook (github.pull_request)",
      },
    ],
  };

  const MOCK_ACTIONS: Record<string, any[]> = {
    "log-1": [
      {
        step: 1,
        action: "Fetch Jira Tickets",
        tool: "jira.get_issues",
        status: "success",
        payload: '{\n  "jql": "assignee = currentUser() AND status != Done"\n}',
      },
      {
        step: 2,
        action: "Send Slack DM",
        tool: "slack.send_message",
        status: "success",
        payload:
          '{\n  "channel": "@michael",\n  "text": "You have 3 pending issues for standup."\n}',
      },
    ],
    "log-2": [
      {
        step: 1,
        action: "Fetch Jira Tickets",
        tool: "jira.get_issues",
        status: "failed",
        payload:
          '{\n  "error": "Rate limit exceeded (429). Please try again in 60 seconds."\n}',
      },
    ],
    "log-4": [
      {
        step: 1,
        action: "Read PR Diff",
        tool: "github.get_pull_request",
        status: "success",
        payload: '{\n  "repo": "alti/core",\n  "pull_number": 142\n}',
      },
      {
        step: 2,
        action: "Analyze Code",
        tool: "gemini.generate_content",
        status: "success",
        payload:
          '{\n  "prompt": "Review this diff for security vulnerabilities..."\n}',
      },
      {
        step: 3,
        action: "Post Comment",
        tool: "github.create_review",
        status: "success",
        payload: '{\n  "body": "LGTM! No obvious security flaws detected."\n}',
      },
    ],
  };

  const accessToken = session?.user?.accessToken;

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        setLoading(false);

        return;
      }

      const res = await axios.get(`${API_URL}/mcp/composio/connections`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setConnections(res.data.data);
      }
    } catch (err: any) {
      // Silently ignore auth errors — connections just won't show in the modal
      if (err?.response?.status !== 401) {
        console.error("Failed to fetch connections", err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchConnections();
    }
  }, [isOpen, accessToken, fetchConnections]);

  useEffect(() => {
    const handleOpenModal = () => onOpen();
    const handleSelectWorkflow = (e: any) => {
      const wf = activeWorkflows.find((w) => w.id === e.detail);

      if (wf) {
        setSelectedWorkflow(wf);
        setSelectedLog(null);
      }
    };

    window.addEventListener("open-workflow-modal", handleOpenModal);
    window.addEventListener("select-workflow", handleSelectWorkflow);

    return () => {
      window.removeEventListener("open-workflow-modal", handleOpenModal);
      window.removeEventListener("select-workflow", handleSelectWorkflow);
    };
  }, [activeWorkflows, onOpen]);

  const handleDeploy = async (onClose: () => void) => {
    try {
      const payload = {
        name: workflowName,
        triggerType,
        cronExpression: triggerType === "schedule" ? cronExpression : undefined,
        webhookEvent: triggerType === "webhook" ? webhookEvent : undefined,
        prompt,
        selectedTools,
      };

      const res = await axios.post(`${API_URL}/workflows/deploy`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken || ""}`,
        },
      });

      if (res.data && res.data.success) {
        const newWorkflow = res.data.data;

        setActiveWorkflows([newWorkflow, ...activeWorkflows]);

        onClose();
        // Reset form
        setWorkflowName("");
        setPrompt("");
        setSelectedTools([]);

        // Auto-select the newly created workflow
        setSelectedWorkflow(newWorkflow);
        setSelectedLog(null);
      } else {
        throw new Error(res.data.message || "Failed to deploy workflow");
      }
    } catch (err: any) {
      console.error("Failed to deploy workflow", err);
      alert(`Failed to deploy workflow: ${err.message}`);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              {selectedLog && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "12px",
                  }}
                  onClick={() => setSelectedLog(null)}
                >
                  <svg
                    fill="none"
                    height="22"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="22"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900 truncate max-w-xl">
                {selectedWorkflow ? selectedWorkflow.name : "Workflow Engine"}
              </h1>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative flex flex-1 w-full flex-col overflow-hidden bg-default-50 dark:bg-background">
          {selectedLog ? (
            <ScrollShadow className="flex-1 w-full h-full overflow-hidden">
              <div className="p-8 pb-12 w-full max-w-5xl mx-auto h-full overflow-y-auto">
                {MOCK_ACTIONS[selectedLog.id] ? (
                  <div className="flex flex-col gap-4 w-full">
                    {MOCK_ACTIONS[selectedLog.id].map((action, idx) => (
                      <Card
                        key={idx}
                        className="shadow-sm border border-default-200 overflow-hidden w-full"
                      >
                        <CardBody className="p-4 flex flex-row gap-4">
                          <div className="flex flex-col items-center justify-start pt-1 shrink-0">
                            {action.status === "success" ? (
                              <Icon
                                className="text-success text-2xl"
                                icon="solar:check-circle-bold"
                              />
                            ) : (
                              <Icon
                                className="text-danger text-2xl"
                                icon="solar:close-circle-bold"
                              />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-sm truncate">
                                {action.action}
                              </h4>
                              <Chip
                                className="font-mono text-[10px] ml-2 shrink-0"
                                color="secondary"
                                size="sm"
                                variant="flat"
                              >
                                {action.tool}
                              </Chip>
                            </div>
                            <div className="bg-default-900 rounded-lg p-3 w-full overflow-x-auto">
                              <pre className="text-[11px] text-success-400 font-mono whitespace-pre-wrap break-all">
                                {action.payload}
                              </pre>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 text-default-400">
                    <Icon
                      className="text-6xl mx-auto mb-4 opacity-50"
                      icon="solar:code-scan-bold"
                    />
                    <p className="text-lg">
                      No execution trace available for this run.
                    </p>
                  </div>
                )}
              </div>
            </ScrollShadow>
          ) : selectedWorkflow ? (
            <ScrollShadow className="flex-1 p-8 bg-default-50/20">
              <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
                {MOCK_LOGS[selectedWorkflow.id] ? (
                  MOCK_LOGS[selectedWorkflow.id].map((log) => (
                    <div
                      key={log.id}
                      className="p-5 rounded-2xl cursor-pointer transition-all duration-300 bg-default-100/50 hover:bg-default-100 border border-transparent shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          {log.status === "success" ? (
                            <Icon
                              className="text-success text-lg"
                              icon="solar:check-circle-bold"
                            />
                          ) : (
                            <Icon
                              className="text-danger text-lg"
                              icon="solar:danger-circle-bold"
                            />
                          )}
                          <span className="font-bold text-sm">
                            {log.timestamp}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-default-400">
                          {log.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-default-500">
                        <Icon icon="solar:bolt-bold" /> Triggered by{" "}
                        {log.trigger}
                      </div>
                      {log.error && (
                        <div className="mt-2 text-xs text-danger bg-danger/10 p-2 rounded-md">
                          {log.error}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-default-400">
                    <Icon
                      className="text-4xl mx-auto mb-2 opacity-50"
                      icon="solar:history-bold"
                    />
                    <p className="text-sm">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </ScrollShadow>
          ) : (
            <div className="flex-1 bg-default-50/50 flex items-center justify-center">
              <img
                alt="Alti Logo"
                className="w-12 opacity-20"
                src="/assets/logo-icon.png"
              />
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => onOpenChange()}
          />
          {/* Modal Content */}
          <div
            style={{
              position: "relative",
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "85vh",
              overflow: "auto",
              padding: "24px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 className="text-xl font-bold">Workflow Builder</h2>
                <p className="text-sm text-default-500">
                  Design an autonomous agent loop.
                </p>
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                  color: "#888",
                  padding: "4px",
                }}
                onClick={() => onOpenChange()}
              >
                ×
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                  }}
                >
                  Workflow Name
                </label>
                <input
                  placeholder="e.g. Daily GitHub PR Review"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d4d4d8",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#fff",
                  }}
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                  }}
                >
                  When should this run?
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d4d4d8",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                    WebkitAppearance: "none",
                    appearance: "none",
                    height: "42px",
                    boxSizing: "border-box",
                    backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23888888%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px top 50%",
                    backgroundSize: "12px auto",
                  }}
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                >
                  <option value="">Select a trigger</option>
                  <option value="schedule">On a recurring schedule</option>
                  <option value="webhook">When an event happens</option>
                </select>
              </div>

              {triggerType === "schedule" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "#333",
                    }}
                  >
                    How often?
                  </label>
                  <input
                    placeholder="e.g. Every weekday at 9am"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d4d4d8",
                      borderRadius: "12px",
                      fontSize: "14px",
                      outline: "none",
                      background: "#fff",
                    }}
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                  />
                </div>
              )}
              {triggerType === "webhook" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "#333",
                    }}
                  >
                    Which event?
                  </label>
                  <input
                    placeholder="e.g. A new message is posted in Slack"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d4d4d8",
                      borderRadius: "12px",
                      fontSize: "14px",
                      outline: "none",
                      background: "#fff",
                    }}
                    type="text"
                    value={webhookEvent}
                    onChange={(e) => setWebhookEvent(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "#333",
                  }}
                >
                  Autonomous Prompt
                </label>
                <textarea
                  placeholder="Tell the agent exactly what to do when this workflow runs."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d4d4d8",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#fff",
                    resize: "none",
                    fontFamily: "inherit",
                    overflow: "hidden",
                    minHeight: "100px",
                  }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;

                    t.style.height = "auto";
                    t.style.height = t.scrollHeight + "px";
                  }}
                />
              </div>

              <div
                style={{
                  background: "#fafafa",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                }}
              >
                <h4
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  🔒 Tool Authorization
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "12px",
                  }}
                >
                  Select which of your connected apps this workflow is allowed
                  to access.
                </p>
                {loading ? (
                  <Spinner size="sm" />
                ) : connections.length > 0 ? (
                  <CheckboxGroup
                    className="gap-4"
                    orientation="horizontal"
                    value={selectedTools}
                    onValueChange={setSelectedTools}
                  >
                    {connections.map((c) => (
                      <Checkbox key={c.appId} value={c.appId}>
                        <span className="capitalize">
                          {c.appName || c.appId}
                        </span>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                ) : (
                  <p style={{ fontSize: "14px", color: "#aaa" }}>
                    No apps connected yet. Go to Integrations to connect apps.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="h-11 bg-transparent text-black text-xs font-medium rounded-xl px-6 border border-default-200 cursor-pointer"
                  onClick={() => onOpenChange()}
                >
                  Cancel
                </button>
                <button
                  className="h-11 bg-black text-white text-xs font-medium rounded-xl px-6 disabled:bg-default-200 disabled:text-default-400 disabled:cursor-not-allowed cursor-pointer"
                  disabled={!workflowName || !prompt}
                  onClick={() => handleDeploy(() => onOpenChange())}
                >
                  Deploy Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ChatBotLayout>
  );
}
