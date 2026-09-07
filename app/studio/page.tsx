"use client";

import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Textarea,
  Input,
  Chip,
  Avatar,
} from "@heroui/react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid";
import { MultiplayerCursorOverlay } from "@/components/studio/MultiplayerCursorOverlay";

const MonacoEditor: any = dynamic(
  () =>
    import("@/components/code/MonacoEditor").then(
      (mod: any) => mod.MonacoEditor,
    ),
  { ssr: false },
);
const Terminal: any = dynamic(
  () => import("@/components/code/Terminal").then((mod: any) => mod.Terminal),
  { ssr: false },
);
const AgentCanvas: any = dynamic(
  () =>
    import("@/components/code/AgentCanvas").then((mod: any) => mod.AgentCanvas),
  { ssr: false },
);

const API_BASE = API_URL;

// ── QA Suite Tab ──────────────────────────────────────────────────────────────
function QATab() {
  const [moduleDir, setModuleDir] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [runResults, setRunResults] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);

  const runSuite = async () => {
    if (!moduleDir.trim()) return toast.error("Enter a module directory path.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qa/suite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleDir }),
      });
      const data = await res.json();

      setResults(data.data);
      toast.success(
        `Generated ${data.data?.generated?.length ?? 0} test files.`,
      );
    } catch {
      toast.error("QA suite failed.");
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qa/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cwd: moduleDir || undefined, coverage: true }),
      });
      const data = await res.json();

      setRunResults(data.data);
    } catch {
      toast.error("Test run failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoverage = async () => {
    try {
      const res = await fetch(`${API_BASE}/qa/coverage`);
      const data = await res.json();

      setCoverage(data.data);
    } catch {
      toast.error("Coverage check failed.");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">🧪 QA Suite Wizard</h3>
        <p className="text-xs text-slate-400">
          Generate Vitest specs, run tests, and enforce coverage thresholds.
        </p>
      </div>

      <Input
        label="Module Directory"
        placeholder="/absolute/path/to/module/directory"
        size="sm"
        value={moduleDir}
        onChange={(e) => setModuleDir(e.target.value)}
      />

      <div className="flex gap-2 flex-wrap">
        <Button
          color="primary"
          isLoading={loading}
          size="sm"
          startContent={<Icon icon="solar:test-tube-bold" />}
          onPress={runSuite}
        >
          Generate Suite
        </Button>
        <Button
          color="success"
          isLoading={loading}
          size="sm"
          startContent={<Icon icon="solar:play-bold" />}
          onPress={runTests}
        >
          Run Tests
        </Button>
        <Button
          color="warning"
          size="sm"
          startContent={<Icon icon="solar:chart-bold" />}
          onPress={fetchCoverage}
        >
          Coverage Report
        </Button>
      </div>

      {results && (
        <Card className="bg-slate-900/60 border border-slate-700/40">
          <CardBody className="text-xs font-mono space-y-1">
            <p className="text-green-400">
              ✅ Generated: {results.generated?.length ?? 0}
            </p>
            <p className="text-slate-400">
              ⏭ Skipped: {results.skipped?.length ?? 0}
            </p>
            <p className="text-red-400">
              ❌ Failed: {results.failed?.length ?? 0}
            </p>
            {results.generated?.slice(0, 5).map((f: string) => (
              <p key={f} className="text-slate-300 truncate">
                {f}
              </p>
            ))}
          </CardBody>
        </Card>
      )}

      {runResults && (
        <Card className="bg-slate-900/60 border border-slate-700/40">
          <CardBody className="text-xs font-mono space-y-1">
            <p
              className={
                runResults.exitCode === 0 ? "text-green-400" : "text-red-400"
              }
            >
              {runResults.exitCode === 0
                ? "✅ ALL PASSED"
                : "❌ FAILURES FOUND"}
            </p>
            <p>
              Passed: {runResults.passed} / {runResults.total}
            </p>
            {runResults.failed > 0 && (
              <p className="text-red-400">Failed: {runResults.failed}</p>
            )}
          </CardBody>
        </Card>
      )}

      {coverage && (
        <Card className="bg-slate-900/60 border border-slate-700/40">
          <CardBody className="text-xs font-mono space-y-1">
            <p className={coverage.passed ? "text-green-400" : "text-red-400"}>
              {coverage.passed ? "✅ COVERAGE PASS" : "❌ COVERAGE FAIL"}
            </p>
            {["lines", "branches", "functions", "statements"].map((k) => (
              <p key={k}>
                {k}: {coverage[k]}%
              </p>
            ))}
            {coverage.failures?.map((f: any) => (
              <p key={f.metric} className="text-red-400">
                ⚠ {f.metric}: {f.pct}% (need {f.required}%)
              </p>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ── Collab Tab ────────────────────────────────────────────────────────────────
function CollabTab() {
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState(
    `user_${Math.random().toString(36).slice(2, 6)}`,
  );
  const [collabToken, setCollabToken] = useState("");
  const [session, setSession] = useState<any>(null);
  const [presence, setPresence] = useState<any[]>([]);
  const [context, setContext] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const socketRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Intialize local socket for emitting sprint actions
    import("socket.io-client").then(({ default: io }) => {
      const socket = io(API_BASE.replace("/api/v1", ""), {
        transports: ["websocket"],
      });

      socketRef.current = socket;
      socket.on("sprint_sync", (data: any) => {
        toast.success(`Swarm ${data.action} triggered by ${data.by}`);
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const triggerSprintAction = (action: string) => {
    if (socketRef.current) {
      socketRef.current.emit("sprint_action", {
        action,
        payload: { sessionId },
      });
      toast.success(`Sent command: ${action}`);
    }
  };

  const create = async () => {
    if (!sessionId || !userId)
      return toast.error("Session ID and User ID required.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/collab/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ownerId: userId }),
      });
      const data = await res.json();

      setSession(data.data);
      setCollabToken(data.data.collabToken);
      toast.success("Collab session created — share the token!");
    } catch {
      toast.error("Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  const join = async () => {
    if (!sessionId || !userId || !collabToken)
      return toast.error("All fields required to join.");
    const res = await fetch(`${API_BASE}/collab/session/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId, collabToken }),
    });
    const data = await res.json();

    if (data.success) {
      setSession(data.data);
      setContext(data.data.context ?? []);
    } else toast.error(data.message);
  };

  const sendMsg = async () => {
    if (!msg.trim() || !session) return;
    await fetch(`${API_BASE}/collab/session/${sessionId}/context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "user", content: msg }),
    });
    setContext((prev) => [
      ...prev,
      {
        userId,
        role: "user",
        content: msg,
        timestamp: new Date().toISOString(),
      },
    ]);
    setMsg("");
  };

  const refreshPresence = async () => {
    if (!sessionId) return;
    const res = await fetch(`${API_BASE}/collab/session/${sessionId}/presence`);
    const data = await res.json();

    setPresence(data.data ?? []);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          🤝 Real-Time Collaboration — v6.1.0
        </h3>
        <p className="text-xs text-slate-400">
          Share an agent session: live presence, co-cursor editing, shared
          context feed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Session ID"
          size="sm"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
        />
        <Input
          label="Your User ID"
          size="sm"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Input
          className="col-span-2"
          label="Collab Token (to join existing)"
          size="sm"
          value={collabToken}
          onChange={(e) => setCollabToken(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button color="primary" isLoading={loading} size="sm" onPress={create}>
          🆕 Create Session
        </Button>
        <Button color="secondary" size="sm" onPress={join}>
          🔗 Join Session
        </Button>
        <Button size="sm" variant="bordered" onPress={refreshPresence}>
          👥 Refresh Presence
        </Button>
      </div>

      {session?.collabToken && (
        <Card className="bg-violet-900/20 border border-violet-500/30">
          <CardBody className="text-xs font-mono space-y-1">
            <p className="text-violet-300 font-bold">
              🔑 Collab Token — share with teammates:
            </p>
            <p className="text-white break-all select-all">
              {session.collabToken}
            </p>
            <p className="text-slate-400">
              Members: {session.members?.join(", ")}
            </p>
          </CardBody>
        </Card>
      )}

      {presence.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Active members:</p>
          <div className="flex gap-2 flex-wrap">
            {presence.map((p: any) => (
              <Chip
                key={p.userId}
                avatar={
                  <Avatar name={p.userId.slice(0, 2).toUpperCase()} size="sm" />
                }
                color="success"
                size="sm"
                variant="flat"
              >
                {p.userId}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {session && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Shared context feed:</p>
          <div className="bg-slate-900/70 border border-slate-700/40 rounded-xl p-3 h-40 overflow-y-auto space-y-1">
            {context.length === 0 && (
              <p className="text-slate-500 text-xs">No messages yet…</p>
            )}
            {context.map((item: any, i: number) => (
              <div
                key={i}
                className={`text-xs ${item.userId === userId ? "text-blue-300" : "text-slate-300"}`}
              >
                <span className="font-semibold">{item.userId}</span>:{" "}
                {item.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Send to shared session context…"
              size="sm"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            />
            <Button color="primary" size="sm" onPress={sendMsg}>
              Send
            </Button>
          </div>
          <div className="pt-4 border-t border-slate-700/40">
            <p className="text-xs text-slate-400 mb-2">
              Global Swarm Controls:
            </p>
            <div className="flex gap-2">
              <Button
                color="warning"
                size="sm"
                onPress={() => triggerSprintAction("PAUSE")}
              >
                ⏸ Pause
              </Button>
              <Button
                color="success"
                size="sm"
                onPress={() => triggerSprintAction("RESUME")}
              >
                ▶ Resume
              </Button>
              <Button
                color="danger"
                size="sm"
                onPress={() => triggerSprintAction("ABORT")}
              >
                ⏹ Abort
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Studio Page ──────────────────────────────────────────────────────────
export default function StudioPage() {
  const [editorValue, setEditorValue] = useState("// Start coding here...");
  const [scaffoldPrompt, setScaffoldPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!scaffoldPrompt.trim()) {
      toast.error("Please describe your project first.");

      return;
    }
    setIsGenerating(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const res = await fetch(`${API_BASE}/generator/scaffold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ description: scaffoldPrompt }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Project scaffold generated!");
        if (data.data?.code) setEditorValue(data.data.code);
      } else {
        toast.error(data.message ?? "Generation failed");
      }
    } catch {
      toast.error("Generation failed — check backend connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Engineering Deck
        </h1>
        <p className="text-default-500">
          The Architect&apos;s Workbench · v6.1.0 (Multiplayer)
        </p>
      </header>

      <MultiplayerCursorOverlay />

      <AgentStatusGrid />

      <div className="flex w-full flex-col">
        <Tabs aria-label="Development Tools">
          <Tab key="editor" title="Code Editor">
            <Card className="glass h-[600px]">
              <CardBody className="p-0 overflow-hidden">
                <MonacoEditor
                  value={editorValue}
                  onChange={(val: string) => setEditorValue(val ?? "")}
                />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="terminal" title="Terminal">
            <Card className="glass h-[600px]">
              <CardBody className="p-0 overflow-hidden">
                <Terminal />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="scaffold" title="Scaffold Wizard">
            <Card className="glass h-[600px]">
              <CardBody className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Project Generator
                  </h3>
                  <p className="text-sm text-default-500">
                    Describe your project to The Architect.
                  </p>
                </div>
                <Textarea
                  classNames={{ inputWrapper: "bg-default-100/50" }}
                  minRows={5}
                  placeholder="I need a Next.js SaaS with Stripe subscription and user dashboard..."
                  value={scaffoldPrompt}
                  variant="bordered"
                  onValueChange={setScaffoldPrompt}
                />
                <Button
                  color="primary"
                  isDisabled={!scaffoldPrompt.trim()}
                  isLoading={isGenerating}
                  startContent={
                    !isGenerating && (
                      <Icon icon="solar:magic-stick-3-bold-duotone" />
                    )
                  }
                  onPress={handleGenerate}
                >
                  Generate Scaffold
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="qa" title="🧪 QA Suite">
            <Card className="glass h-[600px] overflow-y-auto">
              <CardBody className="p-0">
                <QATab />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="collab" title="🤝 Collab">
            <Card className="glass h-[700px] overflow-y-auto">
              <CardBody className="p-0">
                <CollabTab />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="swarm" title="Swarm Canvas">
            <Card className="glass h-[800px] border-none">
              <CardBody className="p-0 overflow-hidden">
                <AgentCanvas />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
