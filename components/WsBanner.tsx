"use client";

import type { WsStatus } from "@/hooks/useSocket";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";

interface WsBannerProps {
  status: WsStatus;
  reconnectAttempt: number;
  /** Max reconnect attempts (used to show "attempt N/max") */
  maxAttempts?: number;
}

const STATUS_CONFIG = {
  connected: {
    icon: "solar:wifi-bold",
    label: "Connected",
    color: "bg-success/15 border-success/30 text-success",
    autoDismissMs: 2000,
  },
  reconnecting: {
    icon: "solar:refresh-circle-bold",
    label: "Reconnecting",
    color: "bg-warning/15 border-warning/40 text-warning",
    autoDismissMs: 0, // never auto-dismiss while reconnecting
  },
  disconnected: {
    icon: "solar:wifi-off-bold",
    label: "Disconnected",
    color: "bg-danger/15 border-danger/30 text-danger",
    autoDismissMs: 0,
  },
  failed: {
    icon: "solar:danger-circle-bold",
    label: "Connection failed",
    color: "bg-danger/20 border-danger/40 text-danger",
    autoDismissMs: 0,
  },
} as const;

/**
 * WsBanner — dismissible reconnect status banner.
 *
 * Renders only when the socket is NOT in a clean "connected" (steady) state.
 * Auto-dismisses after 2s when status returns to "connected".
 */
export function WsBanner({
  status,
  reconnectAttempt,
  maxAttempts = 5,
}: WsBannerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    // Always show banner when not cleanly connected
    if (status !== "connected") {
      setDismissed(false);
      setVisible(true);

      return;
    }

    // Briefly flash "Connected" before hiding
    if (cfg.autoDismissMs > 0) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), cfg.autoDismissMs);

      return () => clearTimeout(t);
    }
  }, [status, cfg.autoDismissMs]);

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-xl ${cfg.color}`}
          exit={{ opacity: 0, y: -16 }}
          initial={{ opacity: 0, y: -16 }}
          role="status"
          transition={{ duration: 0.25 }}
        >
          {/* Icon — spins while reconnecting */}
          <Icon
            className={`text-lg shrink-0 ${status === "reconnecting" ? "animate-spin" : ""}`}
            icon={cfg.icon}
          />

          {/* Message */}
          <span className="text-sm font-semibold whitespace-nowrap">
            {cfg.label}
            {status === "reconnecting" && (
              <span className="font-normal opacity-80 ml-1">
                ({reconnectAttempt}/{maxAttempts})
              </span>
            )}
            {status === "failed" && (
              <span className="font-normal opacity-80 ml-1">
                — reload the page to retry
              </span>
            )}
          </span>

          {/* Dismiss button — only for terminal states */}
          {(status === "disconnected" || status === "failed") && (
            <Button
              isIconOnly
              aria-label="Dismiss"
              className="text-current opacity-60 hover:opacity-100 min-w-unit-6 h-unit-6"
              size="sm"
              variant="light"
              onPress={() => setDismissed(true)}
            >
              <Icon className="text-base" icon="solar:close-circle-linear" />
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
