"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  Check,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/notification`, { headers });

      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${API_BASE_URL}/notification/read-all`,
        {},
        { headers },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error("Failed to mark notifications read.");
    }
  };

  const handleMarkRead = async (id: string, actionUrl?: string) => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${API_BASE_URL}/notification/${id}/read`,
        {},
        { headers },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      if (actionUrl) {
        window.location.href = actionUrl;
      }
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_BASE_URL}/notification/${id}`, { headers });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted.");
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 border-none rounded-xl transition-all cursor-pointer shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell
          className={`w-4 h-4 text-gray-400 ${unreadCount > 0 ? "animate-bounce" : ""}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full border-2 border-[#FAFAFA] dark:border-sidebar">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 bottom-[48px] z-50 w-[248px] bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-default-200/50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <span className="text-xs font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                onClick={handleMarkAllRead}
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 max-h-72 overflow-y-auto divide-y divide-default-100 dark:divide-gray-800/50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-default-400">
                You have no notifications.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3.5 flex gap-3 transition-colors cursor-pointer text-left ${
                    !notification.read
                      ? "bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-default-50/50 dark:hover:bg-default-50/10"
                  }`}
                  onClick={() =>
                    handleMarkRead(notification.id, notification.actionUrl)
                  }
                >
                  {getIcon(notification.type)}
                  <div className="flex-1 overflow-hidden flex flex-col gap-1">
                    <span
                      className={`text-[11px] font-semibold text-foreground truncate ${!notification.read ? "pr-2" : ""}`}
                    >
                      {notification.title}
                    </span>
                    <p className="text-[10px] text-default-500 leading-normal line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-[8px] text-default-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-between shrink-0 ml-1">
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    )}
                    <button
                      className="text-default-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      onClick={(e) => handleDelete(e, notification.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
