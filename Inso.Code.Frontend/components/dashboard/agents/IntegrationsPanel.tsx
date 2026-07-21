"use client";

import React, { useState } from "react";
import { Megaphone, Radio, Bell, Webhook, Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsPanel() {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);

  const handleBroadcast = async () => {
    // In a real app, this would call POST /api/v1/broadcaster/broadcast
    setLastBroadcast(
      `Sent: "${broadcastMessage}" at ${new Date().toLocaleTimeString()}`,
    );
    setBroadcastMessage("");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {/* The Broadcaster */}
      <Card className="bg-black/40 border-pink-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-pink-500">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" /> The Broadcaster
            </div>
            <Badge className="border-pink-500 text-pink-500" variant="outline">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Emergency Broadcast System
            </label>
            <div className="flex gap-2">
              <Input
                className="bg-gray-900 border-pink-500/30 text-pink-100"
                placeholder="Enter alert message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <Button
                className="bg-pink-600 hover:bg-pink-700 text-white"
                onClick={handleBroadcast}
              >
                Send
              </Button>
            </div>
          </div>

          {lastBroadcast && (
            <div className="p-3 bg-pink-950/30 rounded border border-pink-500/20 text-xs text-pink-300">
              {lastBroadcast}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2 bg-gray-900/50 rounded flex flex-col items-center gap-1 text-xs text-gray-400">
              <Bell className="h-4 w-4 text-blue-400" /> Slack
            </div>
            <div className="p-2 bg-gray-900/50 rounded flex flex-col items-center gap-1 text-xs text-gray-400">
              <Radio className="h-4 w-4 text-indigo-400" /> Discord
            </div>
            <div className="p-2 bg-gray-900/50 rounded flex flex-col items-center gap-1 text-xs text-gray-400">
              <Webhook className="h-4 w-4 text-orange-400" /> Email
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Liaison */}
      <Card className="bg-black/40 border-indigo-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-indigo-500">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> The Liaison
            </div>
            <Badge
              className="border-indigo-500 text-indigo-500 animate-pulse"
              variant="outline"
            >
              Listening
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Recent Webhook Events
            </label>
            <div className="h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {/* Mock Logs */}
              {[
                {
                  source: "GitHub",
                  event: "push",
                  time: "10:42 AM",
                  status: "Processed",
                },
                {
                  source: "Stripe",
                  event: "payment_intent",
                  time: "10:30 AM",
                  status: "Processed",
                },
                {
                  source: "GitHub",
                  event: "pull_request",
                  time: "09:15 AM",
                  status: "Dispatched",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      className="text-[10px] h-5 px-1 border-gray-600 text-gray-400"
                      variant="outline"
                    >
                      {log.source}
                    </Badge>
                    <span className="text-sm text-gray-300">{log.event}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-indigo-400">{log.status}</div>
                    <div className="text-[10px] text-gray-600">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
