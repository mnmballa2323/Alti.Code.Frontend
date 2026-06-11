"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Cpu,
  TrendingUp,
  AlertCircle,
  Search,
  AlertTriangle,
  ChevronDown,
  Check,
  X,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";

import { teamAPI } from "@/lib/enterprise-api";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveMemberName } from "@/store/uiSlice";
import { SOCKET_URL } from "@/lib/config";

interface AuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: "SUCCESS" | "FAILURE" | "DENIED" | "WARNING";
  ipAddress?: string;
  metadata?: string;
}

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

interface TimeframeData {
  labels: string[];
  values: number[];
}

interface ModelUsageInfo {
  name: string;
  version: string;
  isPrimary: boolean;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  avgLatency: number;
  cost: number;
  pricingPer1MInput: number;
  pricingPer1MOutput: number;
  timeframes: {
    "1D": TimeframeData;
    "1W": TimeframeData;
    "1M": TimeframeData;
    "1Y": TimeframeData;
    "All": TimeframeData;
  };
  recentRequests: {
    id: string;
    timestamp: string;
    promptSnippet: string;
    tokens: number;
    latency: number;
    cost: number;
  }[];
}

interface ProviderUsageData {
  models: ModelUsageInfo[];
}

const initialUsageData: Record<string, ProviderUsageData> = {
  azure: {
    models: [
      {
        name: "GPT-5.5",
        version: "v5.5",
        isPrimary: true,
        inputTokens: 4120000,
        outputTokens: 1200000,
        requests: 10240,
        avgLatency: 720,
        cost: 56.60,
        pricingPer1MInput: 5.00,
        pricingPer1MOutput: 30.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [25000, 12000, 8000, 45000, 90000, 120000, 85000, 60000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [730000, 260000, 410000, 420000, 510000, 590000, 480000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              240000, 260000, 280000, 230000, 250000, 290000, 270000, 260000, 240000, 250000,
              280000, 300000, 260000, 250000, 270000, 290000, 300000, 270000, 260000, 280000,
              300000, 310000, 280000, 270000, 290000, 300000, 320000, 290000, 280000, 250000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [3200000, 2900000, 3500000, 4100000, 3800000, 4800000, 1200000, 1400000, 1800000, 1500000, 2200000, 2800000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [8500000, 11000000, 13000000, 12000000, 16000000, 19500000]
          }
        },
        recentRequests: [
          {
            id: "req-gpt55-1",
            timestamp: "Just now",
            promptSnippet: "Assemble dynamic view transitions layouts for admin routes...",
            tokens: 4320,
            latency: 680,
            cost: 0.151,
          },
          {
            id: "req-gpt55-2",
            timestamp: "18 mins ago",
            promptSnippet: "Optimize database connection pooling parameters for PostgreSQL...",
            tokens: 2840,
            latency: 750,
            cost: 0.092,
          },
          {
            id: "req-gpt55-3",
            timestamp: "1 hr ago",
            promptSnippet: "Translate system documentation translation assets for French localization...",
            tokens: 1850,
            latency: 620,
            cost: 0.058,
          },
        ]
      },
      {
        name: "GPT-5.5 Pro",
        version: "v5.5 Pro",
        isPrimary: false,
        inputTokens: 950000,
        outputTokens: 150005,
        requests: 4262,
        avgLatency: 280,
        cost: 16.25,
        pricingPer1MInput: 10.00,
        pricingPer1MOutput: 45.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [8000, 3000, 1000, 12000, 28000, 35000, 22000, 15000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [160000, 50000, 80000, 90000, 110000, 120000, 110000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              49000, 53000, 57000, 47000, 51000, 59000, 55000, 53000, 49000, 51000,
              57000, 61000, 53000, 51000, 55000, 59000, 60000, 54000, 52000, 56000,
              60000, 62000, 56000, 54000, 58000, 60000, 64000, 58000, 56000, 50000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [510000, 480000, 550000, 620000, 590000, 710000, 210000, 240000, 320000, 290000, 380000, 450000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [1200000, 1800000, 2400000, 2200000, 3200000, 4100000]
          }
        },
        recentRequests: [
          {
            id: "req-gpt55pro-1",
            timestamp: "45 mins ago",
            promptSnippet: "Form autofill handler autocomplete listeners implementation...",
            tokens: 820,
            latency: 250,
            cost: 0.002,
          },
          {
            id: "req-gpt55pro-2",
            timestamp: "2 hrs ago",
            promptSnippet: "Sanitize HTML string utility function input checks...",
            tokens: 450,
            latency: 220,
            cost: 0.001,
          },
          {
            id: "req-gpt55pro-3",
            timestamp: "5 hrs ago",
            promptSnippet: "Fetch user profile status header check values...",
            tokens: 350,
            latency: 290,
            cost: 0.001,
          },
        ]
      }
    ]
  },
  aws: {
    models: [
      {
        name: "Claude Sonnet 4.6",
        version: "v4.6",
        isPrimary: true,
        inputTokens: 2450000,
        outputTokens: 890000,
        requests: 7650,
        avgLatency: 820,
        cost: 20.70,
        pricingPer1MInput: 3.00,
        pricingPer1MOutput: 15.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [15000, 8000, 5000, 32000, 75000, 98000, 68000, 42000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [510000, 190000, 440000, 290000, 360000, 420000, 330000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              170000, 185000, 198000, 163000, 177000, 206000, 192000, 185000, 171000, 178000,
              199000, 213000, 185000, 178000, 192000, 206000, 213000, 192000, 185000, 199000,
              213000, 220000, 199000, 192000, 206000, 213000, 227000, 206000, 199000, 168000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [2100000, 1850000, 2300000, 2700000, 2500000, 3340000, 800000, 950000, 1200000, 1100000, 1500000, 1900000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [5500000, 7200000, 8900000, 8100000, 11200000, 13400000]
          }
        },
        recentRequests: [
          {
            id: "req-claude46-1",
            timestamp: "2 mins ago",
            promptSnippet: "Explain clean architecture module dependencies in Kotlin KMP...",
            tokens: 1820,
            latency: 780,
            cost: 0.0078,
          },
          {
            id: "req-claude46-2",
            timestamp: "12 mins ago",
            promptSnippet: "Refactor MonacoEditor.tsx component layout parameters...",
            tokens: 3450,
            latency: 950,
            cost: 0.0142,
          },
          {
            id: "req-claude46-3",
            timestamp: "2 hrs ago",
            promptSnippet: "Parse incoming git diff layout representation regex helper...",
            tokens: 1250,
            latency: 890,
            cost: 0.0049,
          },
        ]
      },
      {
        name: "Claude Opus 4.8",
        version: "v4.8",
        isPrimary: false,
        inputTokens: 320000,
        outputTokens: 185005,
        requests: 782,
        avgLatency: 2100,
        cost: 6.23,
        pricingPer1MInput: 5.00,
        pricingPer1MOutput: 25.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [2000, 1000, 500, 6000, 14000, 18000, 11000, 8000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [110000, 40000, 65000, 50000, 80000, 90000, 70000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              28000, 30000, 32000, 26000, 29000, 33000, 31000, 30000, 28000, 29000,
              32000, 35000, 30000, 29000, 31000, 33000, 35000, 31000, 30000, 32000,
              35000, 36000, 32000, 31000, 33000, 35000, 37000, 33000, 32000, 32000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [310000, 285000, 330000, 380000, 360000, 505000, 120000, 150000, 180000, 160000, 220000, 290000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [8500, 11000, 13000, 12000, 16000, 19500]
          }
        },
        recentRequests: [
          {
            id: "req-opus48-1",
            timestamp: "1 hr ago",
            promptSnippet: "Execute security scan rules auditor for Supabase postgres.sql...",
            tokens: 8900,
            latency: 2400,
            cost: 0.185,
          },
          {
            id: "req-opus48-2",
            timestamp: "4 hrs ago",
            promptSnippet: "Audit multi-agent coordination loop deadlocks and race conditions...",
            tokens: 12400,
            latency: 2800,
            cost: 0.245,
          },
        ]
      }
    ]
  },
  gcp: {
    models: [
      {
        name: "Gemini 3.5 Flash",
        version: "v3.5",
        isPrimary: true,
        inputTokens: 3100000,
        outputTokens: 710000,
        requests: 6920,
        avgLatency: 980,
        cost: 11.04,
        pricingPer1MInput: 1.50,
        pricingPer1MOutput: 9.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [22000, 11000, 7000, 38000, 79000, 95000, 78000, 51000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [580000, 210000, 490000, 380000, 420000, 490000, 350000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              190000, 205000, 222000, 183000, 199000, 230000, 215000, 206000, 190000, 199000,
              222000, 238000, 206000, 199000, 215000, 230000, 238000, 215000, 206000, 222000,
              238000, 246000, 222000, 215000, 230000, 238000, 254000, 230000, 222000, 215000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [2350000, 2100000, 2600000, 3050000, 2900000, 3810000, 950000, 1100000, 1350000, 1200000, 1700000, 2100000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [6800000, 8900000, 10500000, 9800000, 13200000, 15400000]
          }
        },
        recentRequests: [
          {
            id: "req-gemini35-1",
            timestamp: "24 mins ago",
            promptSnippet: "Perform evolutionary conservation phyloP scores lookup UCSC...",
            tokens: 12400,
            latency: 1120,
            cost: 0.0182,
          },
          {
            id: "req-gemini35-2",
            timestamp: "1 hr ago",
            promptSnippet: "Resolve biological ontology terms resolution lookup EBI OLS...",
            tokens: 4120,
            latency: 890,
            cost: 0.0058,
          },
        ]
      },
      {
        name: "Gemini 3.1 Pro",
        version: "v3.1",
        isPrimary: false,
        inputTokens: 1100000,
        outputTokens: 300000,
        requests: 4283,
        avgLatency: 340,
        cost: 5.80,
        pricingPer1MInput: 2.00,
        pricingPer1MOutput: 12.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [9000, 4000, 1500, 15000, 31000, 38000, 26000, 18000]
          },
          "1W": {
            labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
            values: [170000, 60000, 145000, 105000, 140000, 155000, 120000]
          },
          "1M": {
            labels: Array.from({ length: 30 }).map((_, i) => `Day ${i + 1}`),
            values: [
              64000, 69000, 75000, 61000, 67000, 78000, 72000, 69000, 64000, 67000,
              75000, 80000, 69000, 67000, 72000, 78000, 80000, 72000, 69000, 75000,
              80000, 83000, 75000, 72000, 78000, 80000, 86000, 78000, 75000, 70000
            ]
          },
          "1Y": {
            labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            values: [780000, 720000, 890000, 990000, 950000, 1400000, 310000, 350000, 450000, 410000, 580000, 690000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [1800000, 2800000, 3600000, 3300000, 4800000, 5900000]
          }
        },
        recentRequests: [
          {
            id: "req-gemini31-1",
            timestamp: "5 mins ago",
            promptSnippet: "Lookup clinical evidence pathogen classification ClinVar...",
            tokens: 950,
            latency: 280,
            cost: 0.0001,
          },
          {
            id: "req-gemini31-2",
            timestamp: "3 hrs ago",
            promptSnippet: "Check active server healthz ping route status check...",
            tokens: 120,
            latency: 110,
            cost: 0.00001,
          },
        ]
      }
    ]
  }
};

const archivedModelsData: Record<string, ArchivedModelInfo[]> = {
  azure: [
    {
      name: "GPT-4",
      version: "v4.0",
      decommissionedDate: "March 15, 2026",
      tokensIn: "92.15M",
      tokensOut: "33.25M",
      cost: 1254.00
    },
    {
      name: "GPT-3.5-Turbo",
      version: "v3.5",
      decommissionedDate: "November 20, 2025",
      tokensIn: "310.08M",
      tokensOut: "140.04M",
      cost: 900.24
    }
  ],
  aws: [
    {
      name: "Claude 3.5 Sonnet",
      version: "v3.5 (Legacy)",
      decommissionedDate: "December 10, 2025",
      tokensIn: "60.40M",
      tokensOut: "24.80M",
      cost: 255.60
    },
    {
      name: "Claude 3 Haiku",
      version: "v3.0",
      decommissionedDate: "August 05, 2025",
      tokensIn: "240.10M",
      tokensOut: "80.05M",
      cost: 96.04
    }
  ],
  gcp: [
    {
      name: "Gemini 1.5 Pro",
      version: "v1.5",
      decommissionedDate: "February 28, 2026",
      tokensIn: "135.30M",
      tokensOut: "45.15M",
      cost: 360.90
    },
    {
      name: "Gemini 1.0 Pro",
      version: "v1.0",
      decommissionedDate: "October 15, 2025",
      tokensIn: "210.05M",
      tokensOut: "80.05M",
      cost: 290.10
    }
  ]
};

interface ArchivedModelInfo {
  name: string;
  version: string;
  decommissionedDate: string;
  tokensIn: string;
  tokensOut: string;
  cost: number;
}

const getDateTime = (
  timeframe: "1D" | "1W" | "1M" | "1Y" | "All",
  index: number,
  label: string
) => {
  if (timeframe === "1D") {
    const now = new Date();
    const d = new Date(now.getTime() - (7 - index) * 3 * 60 * 60 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStr = months[d.getMonth()];
    const dayVal = d.getDate();
    const yearVal = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    
    return {
      date: `${monthStr} ${dayVal}, ${yearVal}`,
      time: `${hours}:${minStr} ${ampm}`
    };
  }
  if (timeframe === "1W") {
    const dateMapping: Record<string, string> = {
      Fri: "Jun 5, 2026",
      Sat: "Jun 6, 2026",
      Sun: "Jun 7, 2026",
      Mon: "Jun 8, 2026",
      Tue: "Jun 9, 2026",
      Wed: "Jun 10, 2026",
      Thu: "Jun 11, 2026"
    };
    const timeMapping: Record<string, string> = {
      Fri: "3:10 PM",
      Sat: "1:05 PM",
      Sun: "5:50 PM",
      Mon: "4:32 PM",
      Tue: "2:15 PM",
      Wed: "6:45 PM",
      Thu: "12:40 AM"
    };
    return {
      date: dateMapping[label] || "Jun 11, 2026",
      time: timeMapping[label] || "12:00 PM"
    };
  }
  if (timeframe === "1M") {
    const now = new Date();
    const d = new Date(now.getTime() - (29 - index) * 24 * 60 * 60 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStr = months[d.getMonth()];
    const dayVal = d.getDate();
    const yearVal = d.getFullYear();
    
    return {
      date: `${monthStr} ${dayVal}, ${yearVal}`,
      time: "12:00 AM"
    };
  }
  if (timeframe === "1Y") {
    const dateMapping: Record<string, string> = {
      Jul: "Jul 31, 2025",
      Aug: "Aug 31, 2025",
      Sep: "Sep 30, 2025",
      Oct: "Oct 31, 2025",
      Nov: "Nov 30, 2025",
      Dec: "Dec 31, 2025",
      Jan: "Jan 31, 2026",
      Feb: "Feb 28, 2026",
      Mar: "Mar 31, 2026",
      Apr: "Apr 30, 2026",
      May: "May 31, 2026",
      Jun: "Jun 11, 2026"
    };
    return {
      date: dateMapping[label] || "Jun 2026",
      time: "11:59 PM"
    };
  }
  const dateMapping: Record<string, string> = {
    "Q1 '25": "Mar 31, 2025",
    "Q2 '25": "Jun 30, 2025",
    "Q3 '25": "Sep 30, 2025",
    "Q4 '25": "Dec 31, 2025",
    "Q1 '26": "Mar 31, 2026",
    "Q2 '26": "Jun 11, 2026"
  };
  return {
    date: dateMapping[label] || "Jun 2026",
    time: "11:59 PM"
  };
};

const getYScaleCeiling = (maxVal: number) => {
  if (maxVal <= 150000) return 150000;
  if (maxVal <= 500000) return 500000;
  if (maxVal <= 1000000) return 1000000;
  if (maxVal <= 2500000) return 2500000;
  if (maxVal <= 5000000) return 5000000;
  if (maxVal <= 10000000) return 10000000;
  if (maxVal <= 25000000) return 25000000;
  if (maxVal <= 50000000) return 50000000;
  return 100000000;
};

const getYScaleLabels = (ceiling: number) => {
  const formatVal = (val: number) => {
    if (val >= 1000000) return parseFloat((val / 1000000).toFixed(2)) + "M";
    if (val >= 1000) return parseFloat((val / 1000).toFixed(2)) + "k";
    return val.toString();
  };
  return {
    top: formatVal(ceiling),
    mid: formatVal(ceiling / 2),
    bottom: "0"
  };
};

const parseTokenString = (str: string) => {
  if (!str) return 0;
  const num = parseFloat(str);
  if (str.toLowerCase().includes("m")) return num * 1000000;
  if (str.toLowerCase().includes("k")) return num * 1000;
  return num;
};

export default function MemberDetailsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const id = params?.id as string;
  const dispatch = useAppDispatch();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"usage" | "audit">("usage");
  const [activeProvider, setActiveProvider] = useState<"aws" | "gcp" | "azure">("azure");
  const [modelTimeframes, setModelTimeframes] = useState<Record<string, "1D" | "1W" | "1M" | "1Y" | "All">>({});
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  const currentUserFromStore = useAppSelector(
    (state) => state.user.data,
  ) as any;

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    valuesCount: number,
    modelName: string
  ) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgWidth = 500;
    const relativeX = (x / rect.width) * svgWidth;
    const chartWidth = 500;
    const xOffset = 0;
    const clampedX = Math.max(xOffset, Math.min(xOffset + chartWidth, relativeX));
    const index = Math.max(0, Math.min(valuesCount - 1, Math.round(((clampedX - xOffset) / chartWidth) * (valuesCount - 1))));
    setHoveredModel(modelName);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredModel(null);
    setHoveredIndex(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white shrink-0 shadow-sm">
            <Check className="w-3 h-3 text-white stroke-[3.5]" />
          </span>
        );
      case "FAILURE":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 dark:bg-rose-600 text-white shrink-0 shadow-sm">
            <X className="w-3 h-3 text-white stroke-[3.5]" />
          </span>
        );
      case "DENIED":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-600 text-white shrink-0 shadow-sm">
            <Shield className="w-3 h-3 text-white stroke-[2.5]" />
          </span>
        );
      case "WARNING":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 dark:bg-amber-600 text-white shrink-0 shadow-sm">
            <AlertTriangle className="w-3 h-3 text-white stroke-[3]" />
          </span>
        );
      default:
        return null;
    }
  };

  const staticMockMembers: Member[] = [
    {
      id: "2",
      name: "Ada Lovelace",
      email: "ada.lovelace@alticodestudio.com",
      role: "admin",
    },
    {
      id: "4",
      name: "Alan Turing",
      email: "alan.turing@alticodestudio.com",
      role: "manager",
    },
    {
      id: "3",
      name: "Grace Hopper",
      email: "grace.hopper@alticodestudio.com",
      role: "developer",
    },
    {
      id: "1",
      name: "Jules Verne",
      email: "jules.verne@alticodestudio.com",
      role: "developer",
    },
  ];

  const fetchMemberDetails = async () => {
    try {
      const res = await teamAPI.members();
      let foundMember = res?.members?.find((m: any) => m.id === id) || null;

      // Fallback to static mock list if not found in API
      if (!foundMember) {
        foundMember = staticMockMembers.find((m) => m.id === id) || null;
      }

      // Check if current user
      if (
        !foundMember &&
        currentUserFromStore &&
        (currentUserFromStore.id === id || id === "current-user")
      ) {
        foundMember = {
          id: currentUserFromStore.id || "current-user",
          name:
            currentUserFromStore.name ||
            `${currentUserFromStore.firstName || ""} ${currentUserFromStore.lastName || ""}`.trim() ||
            undefined,
          email: currentUserFromStore.email,
          role: currentUserFromStore.role || "admin",
        };
      }

      setMember(foundMember);
      if (foundMember) {
        dispatch(
          setActiveMemberName(
            foundMember.name || foundMember.email.split("@")[0],
          ),
        );
      }
    } catch (err) {
      console.error("Failed to load member details:", err);
      // Fallback immediately to static mock
      const found = staticMockMembers.find((m) => m.id === id);

      if (found) {
        setMember(found);
        dispatch(setActiveMemberName(found.name || found.email.split("@")[0]));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      fetchMemberDetails();
    }
  }, [id, status, currentUserFromStore]);

  useEffect(() => {
    return () => {
      dispatch(setActiveMemberName(null));
    };
  }, [dispatch]);

  const getMemberDetails = (memberObj: Member) => {
    const emailLower = memberObj.email.toLowerCase();
    const isAda = emailLower.includes("ada");
    const isAlan = emailLower.includes("alan");
    const isGrace = emailLower.includes("grace");
    const isJules = emailLower.includes("jules");

    if (isAda) {
      return {
        avatarColor:
          "bg-purple-100 text-purple-750 dark:bg-purple-950/40 dark:text-purple-400",
        avatarInitials: "AL",
        spendCurrent: 42.15,
        spendLimit: 100.0,
        tokensTotal: "2.4M",
        tokensIn: "1.7M",
        tokensOut: "700k",
        tasksCount: "2,410",
        tasksSuccess: "99.4%",
        sparkline: [25, 45, 12, 60, 40, 85, 30],
        activity: [
          {
            time: "5 minutes ago",
            action: "Ran code generator model gemini-1.5-pro",
            category: "code",
          },
          {
            time: "2 hours ago",
            action: "Pushed 14 new modules to enterprise-auth",
            category: "git",
          },
          {
            time: "1 day ago",
            action: "Modified deployment parameters in production config",
            category: "config",
          },
          {
            time: "2 days ago",
            action: "Requested audit log export for compliance review",
            category: "audit",
          },
          {
            time: "4 days ago",
            action: "Updated prompt instructions for Legal-Analyst agent",
            category: "agent",
          },
          {
            time: "1 week ago",
            action: "Triggered build sweep for staging branch",
            category: "deploy",
          },
        ],
        auditLogs: [
          {
            _id: "ada_log_01",
            timestamp: new Date(Date.now() - 300000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "MODEL_RUN_CODE_GENERATOR",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"model":"gemini-1.5-pro","prompt_tokens":120400,"completion_tokens":25400}',
          },
          {
            _id: "ada_log_02",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "GIT_PUSH_ENTERPRISE_AUTH",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"repo":"enterprise-auth","branch":"main","commits_count":14,"hash":"7e9f3b1"}',
          },
          {
            _id: "ada_log_03",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "DEPLOY_CONFIG_MODIFY",
            status: "WARNING" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"environment":"production","modified_keys":["replicaCount","memoryLimit"],"reason":"high load scaling"}',
          },
          {
            _id: "ada_log_04",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "AUDIT_LOG_EXPORT_REQUEST",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"target_format":"csv","export_scope":"entire_org","compliance_id":"comp_881"}',
          },
          {
            _id: "ada_log_05",
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "AGENT_PROMPT_UPDATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"agent_name":"Legal-Analyst","version":"v2.1","changed_instructions":"Enforce strict compliance checks"}',
          },
          {
            _id: "ada_log_06",
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "BUILD_SWEEP_TRIGGER",
            status: "FAILURE" as const,
            ipAddress: "192.168.1.15",
            metadata:
              '{"branch":"staging","error":"Webpack bundle compilation timed out after 300s"}',
          },
        ],
      };
    }
    if (isAlan) {
      return {
        avatarColor:
          "bg-blue-100 text-blue-750 dark:bg-blue-950/40 dark:text-blue-400",
        avatarInitials: "AT",
        spendCurrent: 88.5,
        spendLimit: 150.0,
        tokensTotal: "6.8M",
        tokensIn: "4.2M",
        tokensOut: "2.6M",
        tasksCount: "8,920",
        tasksSuccess: "98.7%",
        sparkline: [60, 80, 45, 90, 75, 110, 85],
        activity: [
          {
            time: "12 minutes ago",
            action: "Executed optimization sweep on db-indexing script",
            category: "perf",
          },
          {
            time: "1 hour ago",
            action: "Completed full codebase audit for security telemetry",
            category: "audit",
          },
          {
            time: "4 hours ago",
            action: "Created new workspace group 'security-hardening'",
            category: "admin",
          },
          {
            time: "3 days ago",
            action: "Modified role permissions for Developer group",
            category: "admin",
          },
          {
            time: "5 days ago",
            action: "Verified private cloud local logging transport config",
            category: "security",
          },
          {
            time: "1 week ago",
            action: "Updated database migration schemas for user billing",
            category: "database",
          },
        ],
        auditLogs: [
          {
            _id: "alan_log_01",
            timestamp: new Date(Date.now() - 720000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "DB_INDEX_OPTIMIZATION_SWEEP",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata:
              '{"script":"db-indexing.sql","tables_affected":["transactions","users"],"latency_improvement":"42%"}',
          },
          {
            _id: "alan_log_02",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "CODEBASE_SECURITY_AUDIT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata:
              '{"scope":"all_submodules","vulnerabilities_found":0,"scanned_files_count":4820}',
          },
          {
            _id: "alan_log_03",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "WORKSPACE_GROUP_CREATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata:
              '{"group_name":"security-hardening","description":"Group for automated security sweeps"}',
          },
          {
            _id: "alan_log_04",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "ROLE_PERMISSIONS_MODIFY",
            status: "DENIED" as const,
            ipAddress: "10.0.0.12",
            metadata:
              '{"target_group":"Developer","denied_reason":"Requires dual authorization to elevate developer permissions"}',
          },
          {
            _id: "alan_log_05",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "LOGGING_TRANSPORT_VERIFY",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata:
              '{"transport":"fluentd","encryption":"TLSv1.3","destination":"private_cloud_vault"}',
          },
          {
            _id: "alan_log_06",
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "DB_MIGRATION_UPDATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata:
              '{"version":"20260610_billing","down_migration_available":true,"lock_timeout_ms":5000}',
          },
        ],
      };
    }
    if (isGrace) {
      return {
        avatarColor:
          "bg-emerald-100 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-400",
        avatarInitials: "GH",
        spendCurrent: 14.8,
        spendLimit: 50.0,
        tokensTotal: "1.1M",
        tokensIn: "800k",
        tokensOut: "300k",
        tasksCount: "945",
        tasksSuccess: "99.1%",
        sparkline: [10, 15, 30, 20, 45, 25, 15],
        activity: [
          {
            time: "1 hour ago",
            action: "Deployed staging build v2.4.1-rc3",
            category: "deploy",
          },
          {
            time: "3 hours ago",
            action: "Patched memory leaks in telemetry-parser daemon",
            category: "bugfix",
          },
          {
            time: "1 day ago",
            action: "Ran performance benchmark tests on landing page",
            category: "perf",
          },
          {
            time: "2 days ago",
            action: "Refactored legacy logging dependencies",
            category: "cleanup",
          },
          {
            time: "5 days ago",
            action: "Added unit tests for recaptcha service mock fallback",
            category: "test",
          },
        ],
        auditLogs: [
          {
            _id: "grace_log_01",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "STAGING_BUILD_DEPLOY",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata:
              '{"version":"v2.4.1-rc3","environment":"staging","checks_passed":true}',
          },
          {
            _id: "grace_log_02",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "TELEMETRY_PARSER_BUGFIX",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata:
              '{"daemon":"telemetry-parser","leak_size_kb":450,"files_modified":["parser.go"]}',
          },
          {
            _id: "grace_log_03",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "PERF_BENCHMARK_RUN",
            status: "WARNING" as const,
            ipAddress: "192.168.1.44",
            metadata:
              '{"target":"landing_page","lcp_ms":2850,"inp_ms":220,"status":"needs_optimization"}',
          },
          {
            _id: "grace_log_04",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "LOGGING_DEPS_REFACTOR",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata:
              '{"removed_packages":["winston-legacy"],"added_packages":["pino"],"bundle_reduction_kb":142}',
          },
          {
            _id: "grace_log_05",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "UNIT_TEST_ADD",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata:
              '{"service":"recaptcha-mock","tests_added_count":8,"coverage_increase":"1.4%"}',
          },
        ],
      };
    }
    if (isJules) {
      return {
        avatarColor:
          "bg-amber-100 text-amber-750 dark:bg-amber-950/40 dark:text-amber-400",
        avatarInitials: "JV",
        spendCurrent: 3.2,
        spendLimit: 50.0,
        tokensTotal: "240k",
        tokensIn: "180k",
        tokensOut: "60k",
        tasksCount: "182",
        tasksSuccess: "100%",
        sparkline: [2, 5, 10, 8, 4, 12, 5],
        activity: [
          {
            time: "4 hours ago",
            action: "Initialized scratchpad folder in workspace root",
            category: "setup",
          },
          {
            time: "1 day ago",
            action: "Drafted system-instructions.md draft",
            category: "docs",
          },
          {
            time: "3 days ago",
            action: "Accepted invitation to workspace",
            category: "admin",
          },
        ],
        auditLogs: [
          {
            _id: "jules_log_01",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "WORKSPACE_FOLDER_INIT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"folder_path":"/scratchpad","is_git_ignored":true}',
          },
          {
            _id: "jules_log_02",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "DOCS_DRAFT_CREATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"file":"system-instructions.md","word_count":425}',
          },
          {
            _id: "jules_log_03",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "WORKSPACE_INVITE_ACCEPT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"workspace_id":"ws_dev_main","role":"developer"}',
          },
        ],
      };
    }

    // Default fallback
    const initials = memberObj.name
      ? memberObj.name
          .trim()
          .split(/\s+/)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : memberObj.email.slice(0, 2).toUpperCase();

    return {
      avatarColor:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-350",
      avatarInitials: initials,
      spendCurrent: 12.5,
      spendLimit: 100.0,
      tokensTotal: "840k",
      tokensIn: "600k",
      tokensOut: "240k",
      tasksCount: "620",
      tasksSuccess: "99.0%",
      sparkline: [12, 18, 15, 22, 14, 30, 10],
      activity: [
        {
          time: "2 hours ago",
          action: "Viewed members directory list",
          category: "audit",
        },
        {
          time: "1 day ago",
          action: "Updated personal profile settings",
          category: "settings",
        },
      ],
      auditLogs: [
        {
          _id: "fallback_log_01",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actor: memberObj.email,
          action: "MEMBERS_LIST_VIEW",
          status: "SUCCESS" as const,
          ipAddress: "192.168.1.99",
          metadata: '{"filtered_by":null,"limit":50}',
        },
        {
          _id: "fallback_log_02",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          actor: memberObj.email,
          action: "PROFILE_SETTINGS_UPDATE",
          status: "SUCCESS" as const,
          ipAddress: "192.168.1.99",
          metadata: '{"fields_updated":["avatar","displayName"]}',
        },
      ],
    };
  };

  useEffect(() => {
    if (activeTab !== "audit" || !member) return;

    const delayDebounceFn = setTimeout(() => {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        if (!accessToken) {
          const detailsObj = getMemberDetails(member);
          const filtered = detailsObj.auditLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
              log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          setLogs(filtered);
          setLogsTotalPages(1);
          setLoadingLogs(false);

          return;
        }
        try {
          const response = await axios.get(`${SOCKET_URL}/api/v1/audit`, {
            params: {
              page: logsPage,
              limit: 50,
              action: searchTerm,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          });

          if (
            response.data.success &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            const memberEmail = member.email.toLowerCase();
            const filtered = response.data.data.filter(
              (log: any) =>
                log.actor?.toLowerCase() === memberEmail &&
                (log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  log.actor.toLowerCase().includes(searchTerm.toLowerCase())),
            );

            setLogs(filtered);
            setLogsTotalPages(1);
          } else {
            const detailsObj = getMemberDetails(member);
            const filtered = detailsObj.auditLogs.filter(
              (log) =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
            );

            setLogs(filtered);
            setLogsTotalPages(1);
          }
        } catch (error) {
          console.error("Failed to fetch audit logs, loading mock data", error);
          const detailsObj = getMemberDetails(member);
          const filtered = detailsObj.auditLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
              log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          setLogs(filtered);
          setLogsTotalPages(1);
        } finally {
          setLoadingLogs(false);
        }
      };

      fetchLogs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [logsPage, searchTerm, activeTab, member?.email, accessToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 h-full w-full">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-3" />
        <p className="text-sm text-neutral-500">Loading member statistics...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full w-full text-center px-6">
        <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">
          Member Not Found
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-455 mb-6">
          The requested member directory could not be located or has been
          decommissioned.
        </p>
      </div>
    );
  }

  const details = getMemberDetails(member);

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 space-y-6 pb-12">
      {/* Centered Toggle Header */}
      <div className="flex justify-center w-full border-b border-neutral-100 dark:border-neutral-800/80 pb-6 mb-2">
        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shrink-0 shadow-sm">
          <button
            className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "usage"
                ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("usage")}
          >
            Model Usage
          </button>
          <button
            className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("audit")}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">
        {activeTab === "usage" ? (
          (() => {
            const totalStaticTokens = 15475000;
            const globalTotalCost = 116.62;
            
            const memberTotalTokens = parseTokenString(details.tokensTotal);
            const memberCost = details.spendCurrent;
            
            const tokenScaleFactor = totalStaticTokens > 0 ? memberTotalTokens / totalStaticTokens : 0.15;
            const costScaleFactor = globalTotalCost > 0 ? memberCost / globalTotalCost : 0.15;
            
            const formatTokensLocal = (num: number) => {
              if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
              if (num >= 1000) return (num / 1000).toFixed(0) + "k";
              return num.toString();
            };

            const data = initialUsageData[activeProvider];

            return (
              <div className="space-y-6 pb-6">
                {/* Centered Provider Toggle Header */}
                <div className="flex justify-center w-full border-b border-neutral-100 dark:border-neutral-800/80 pb-6 mb-2">
                  <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shrink-0 shadow-sm">
                    <button
                      onClick={() => setActiveProvider("azure")}
                      className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeProvider === "azure"
                          ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      GPT
                    </button>
                    <button
                      onClick={() => setActiveProvider("aws")}
                      className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeProvider === "aws"
                          ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Claude
                    </button>
                    <button
                      onClick={() => setActiveProvider("gcp")}
                      className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        activeProvider === "gcp"
                          ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Gemini
                    </button>
                  </div>
                </div>

                {/* Side-by-side Model Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.models.map((model) => {
                    const selectedTimeframe = modelTimeframes[model.name] || "1W";
                    const timeframeData = model.timeframes[selectedTimeframe];
                    const rawValues = timeframeData.values;
                    
                    const values = rawValues.map(v => Math.round(v * tokenScaleFactor));
                    const timeframeTotal = values.reduce((acc, v) => acc + v, 0);
                    
                    const modelStaticTokens = (model.inputTokens + model.outputTokens) * tokenScaleFactor;
                    const inputRatio = modelStaticTokens > 0 ? (model.inputTokens * tokenScaleFactor) / modelStaticTokens : 0.8;
                    const dynamicInput = Math.round(timeframeTotal * inputRatio);
                    const dynamicOutput = timeframeTotal - dynamicInput;
                    
                    const dynamicCost = (dynamicInput / 1000000) * model.pricingPer1MInput + (dynamicOutput / 1000000) * model.pricingPer1MOutput;

                    const labels = selectedTimeframe === "1D"
                      ? Array.from({ length: values.length }).map((_, i) => getDateTime("1D", i, "").time)
                      : timeframeData.labels;

                    const maxVal = Math.max(...values, 1);
                    const yScaleCeiling = getYScaleCeiling(maxVal);
                    const yScaleLabels = getYScaleLabels(yScaleCeiling);

                    const chartWidth = 500;
                    const chartHeight = 90;
                    const xOffset = 0;
                    const yOffset = 10;

                    const coords = values.map((val, i) => {
                      const x = xOffset + (i / (values.length - 1)) * chartWidth;
                      const y = yOffset + chartHeight - ((val / yScaleCeiling) * chartHeight);
                      return { x, y };
                    });

                    const linePath = coords.reduce((acc, c, i) => {
                      return acc + `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
                    }, "");

                    const areaPath = linePath + ` L ${xOffset + chartWidth} ${yOffset + chartHeight} L ${xOffset} ${yOffset + chartHeight} Z`;

                    const isHovered = hoveredModel === model.name;
                    const activeHover = isHovered && hoveredIndex !== null && hoveredIndex < values.length
                      ? {
                          index: hoveredIndex,
                          x: xOffset + (hoveredIndex / (values.length - 1)) * chartWidth,
                          y: yOffset + chartHeight - ((values[hoveredIndex] / yScaleCeiling) * chartHeight)
                        }
                      : null;
                    
                    const activeValue = activeHover ? values[activeHover.index] : values[values.length - 1];

                    const hoverDT = activeHover
                      ? getDateTime(selectedTimeframe, activeHover.index, labels[activeHover.index])
                      : getDateTime(selectedTimeframe, labels.length - 1, labels[labels.length - 1]);

                    const firstDT = getDateTime(selectedTimeframe, 0, labels[0]);
                    const midDT = getDateTime(selectedTimeframe, Math.floor(labels.length / 2), labels[Math.floor(labels.length / 2)]);
                    const lastDT = getDateTime(selectedTimeframe, labels.length - 1, labels[labels.length - 1]);

                    return (
                      <div 
                        key={model.name}
                        className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between border-b border-neutral-300 dark:border-neutral-700 -mx-6 px-6 pb-3">
                            <div>
                              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                {model.name}
                              </h3>
                              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                ${model.pricingPer1MInput.toFixed(2)} <span className="opacity-60">in</span> / ${model.pricingPer1MOutput.toFixed(2)} <span className="opacity-60">out</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-neutral-950 dark:text-white">${dynamicCost.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="w-full bg-neutral-100/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 p-3 rounded-2xl flex items-center">
                            <div className="flex-1 flex justify-between items-center pr-2">
                              <div>
                                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens Processed</span>
                                <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{formatTokensLocal(timeframeTotal)}</span>
                              </div>
                              <div className="text-right flex flex-col justify-between h-8">
                                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium block leading-none pt-[1px]">
                                  {formatTokensLocal(dynamicInput)} <span className="opacity-60">tokens in</span>
                                </span>
                                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium block leading-none pb-[1px]">
                                  {formatTokensLocal(dynamicOutput)} <span className="opacity-60">tokens out</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center border-b border-neutral-100/50 dark:border-neutral-800/50 pb-2">
                              <div className="flex gap-1 bg-neutral-100/60 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800 text-[9px] font-bold">
                                {(["1D", "1W", "1M", "1Y", "All"] as const).map((tf) => (
                                  <button
                                    key={tf}
                                    onClick={() => setModelTimeframes(prev => ({ ...prev, [model.name]: tf }))}
                                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                      selectedTimeframe === tf
                                        ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                    }`}
                                  >
                                    {tf}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">
                                  {formatTokensLocal(activeValue)}
                                </span>
                                {activeHover && (
                                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium font-mono">
                                    {selectedTimeframe === "1D" ? hoverDT.time : hoverDT.date.split(",")[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="relative h-36 w-full pt-1 select-none">
                              <svg
                                className="w-full h-full overflow-visible cursor-crosshair"
                                viewBox="0 0 500 130"
                                preserveAspectRatio="none"
                                onMouseMove={(e) => handleMouseMove(e, values.length, model.name)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <defs>
                                  <linearGradient id={`chartGrad-${model.name.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                                  </linearGradient>
                                </defs>

                                <line x1="0" y1="10" x2="500" y2="10" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />

                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.7)" className="dark:stroke-neutral-800" strokeWidth="1" />
                                <line x1="500" y1="10" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.7)" className="dark:stroke-neutral-800" strokeWidth="1" />

                                <text x="0" y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="start">
                                  {selectedTimeframe === "1D" ? firstDT.time : firstDT.date}
                                </text>
                                <text x={chartWidth / 2} y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="middle">
                                  {selectedTimeframe === "1D" ? midDT.time : midDT.date}
                                </text>
                                <text x={chartWidth} y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                                  {selectedTimeframe === "1D" ? lastDT.time : lastDT.date}
                                </text>

                                <text x="495" y="14" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                                  {yScaleLabels.top}
                                </text>
                                <text x="495" y="59" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                                  {yScaleLabels.mid}
                                </text>
                                <text x="495" y="103" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                                  {yScaleLabels.bottom}
                                </text>

                                <path
                                  d={areaPath}
                                  fill={`url(#chartGrad-${model.name.replace(/\s+/g, "")})`}
                                  className="transition-all duration-300 ease-in-out"
                                />

                                <path
                                  d={linePath}
                                  fill="none"
                                  stroke="#2563eb"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="transition-all duration-300 ease-in-out"
                                />

                                {activeHover && (
                                  <>
                                    <line x1={activeHover.x} y1={10} x2={activeHover.x} y2={100} stroke="rgba(37, 99, 235, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" pointerEvents="none" />
                                    <line x1="0" y1="105" x2="500" y2="105" stroke="rgba(37, 99, 235, 0)" strokeWidth="0" />
                                    <circle cx={activeHover.x} cy={activeHover.y} r="9" fill="#2563eb" fillOpacity="0.15" pointerEvents="none" />
                                    <circle cx={activeHover.x} cy={activeHover.y} r="4" fill="#2563eb" stroke="white" strokeWidth="1.5" pointerEvents="none" />

                                    <g transform={`translate(${Math.max(38, Math.min(462, activeHover.x))}, 118)`} pointerEvents="none">
                                      <rect x="-38" y="-9" width="76" height="15" rx="3" fill="#2563eb" />
                                      <text x="0" y="2" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                        {selectedTimeframe === "1D" ? hoverDT.time : hoverDT.date.split(",")[0]}
                                      </text>
                                    </g>

                                    <g transform={`translate(500, ${Math.max(18, Math.min(92, activeHover.y))})`} pointerEvents="none">
                                      <rect x="-52" y="-8" width="52" height="15" rx="3" fill="#2563eb" />
                                      <text x="-26" y="2" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                        {formatTokensLocal(activeValue)}
                                      </text>
                                    </g>

                                    <g transform={`translate(${activeHover.x > 320 ? activeHover.x - 145 : activeHover.x + 10}, ${activeHover.y - 11})`} pointerEvents="none">
                                      <rect x="0" y="0" width="136" height="22" rx="11" fill="rgba(15, 15, 17, 0.95)" stroke="#2563eb" strokeWidth="1.5" />
                                      <text x="34" y="14" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                        {selectedTimeframe === "1D" 
                                          ? `${hoverDT.date.split(" ")[0]} ${hoverDT.date.split(" ")[1].replace(",", "")} ${hoverDT.time}`
                                          : hoverDT.date.split(",")[0]}
                                      </text>
                                      <line x1="68" y1="3" x2="68" y2="19" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                                      <text x="102" y="14" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                        {formatTokensLocal(activeValue)}
                                      </text>
                                    </g>
                                  </>
                                )}
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legacy Models Section */}
                <div>
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-[#161b22] p-6 shadow-sm">
                    <button 
                      onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
                      className="flex items-center justify-between w-full text-left focus:outline-none group cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div>
                          <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-200">Legacy Models</h4>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Historical billing data</p>
                        </div>
                      </div>
                      <svg 
                        className={`w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-white transition-transform duration-200 ${isArchivedExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {isArchivedExpanded && (
                    <div className="mt-3 z-30 space-y-3">
                      {archivedModelsData[activeProvider].map((model) => (
                        <div key={model.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl gap-4 shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-neutral-850 dark:text-neutral-150 block">{model.name}</span>
                            <p className="text-[9px] text-neutral-455 dark:text-neutral-500">Decommissioned on {model.decommissionedDate}</p>
                          </div>
                          
                          <div className="flex gap-6 text-right sm:text-right">
                            <div>
                              <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens In</span>
                              <span className="text-xs font-mono font-bold text-neutral-750 dark:text-neutral-355 text-right">
                                {formatTokensLocal(parseTokenString(model.tokensIn) * tokenScaleFactor)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens Out</span>
                              <span className="text-xs font-mono font-bold text-neutral-750 dark:text-neutral-355 text-right">
                                {formatTokensLocal(parseTokenString(model.tokensOut) * tokenScaleFactor)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Total Cost</span>
                              <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 text-right">${(model.cost * costScaleFactor).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="w-full flex flex-col h-full justify-start pt-0">
            <div className="space-y-4">
              {/* Sticky Header Wrapper */}
              <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                    placeholder="Search by action..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Table Header */}
                <div
                  className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider uppercase shadow-sm"
                  style={{
                    gridTemplateColumns:
                      "90px 120px minmax(0, 4fr) minmax(0, 1.2fr) 120px",
                  }}
                >
                  <div>Date</div>
                  <div>Time</div>
                  <div>Action</div>
                  <div>Status</div>
                  <div>IP Address</div>
                </div>
              </div>

              {/* Content Pane */}
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
                  <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                  <p className="text-sm text-neutral-500">
                    Loading audit logs...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400 bg-white dark:bg-[#161b22] shadow-sm">
                      No logs found matching search query.
                    </div>
                  ) : (
                    logs.map((log) => {
                      const logDate = new Date(
                        log.timestamp,
                      ).toLocaleDateString();
                      const logTime = new Date(
                        log.timestamp,
                      ).toLocaleTimeString();
                      const isExpanded = !!expandedLogs[log._id];

                      return (
                        <div
                          key={log._id}
                          className={`flex flex-col px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm transition-all duration-200 gap-3 ${
                            log.metadata
                              ? "cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
                              : ""
                          }`}
                          onClick={() => log.metadata && toggleExpand(log._id)}
                        >
                          <div
                            className="grid gap-4 items-center text-sm"
                            style={{
                              gridTemplateColumns:
                                "90px 120px minmax(0, 4fr) minmax(0, 1.2fr) 120px",
                            }}
                          >
                            <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                              {logDate}
                            </div>
                            <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                              {logTime}
                            </div>
                            <div
                              className="text-neutral-800 dark:text-neutral-200 font-mono text-xs truncate"
                              title={log.action}
                            >
                              {log.action}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {log.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                {log.ipAddress || "—"}
                              </span>
                              {log.metadata && (
                                <ChevronDown
                                  className={`w-4 h-4 text-neutral-450 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                          {log.metadata && isExpanded && (
                            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800/60 text-xs font-mono text-neutral-500 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap break-all animate-in fade-in slide-in-from-top-1 duration-200">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500 block mb-1">
                                Metadata
                              </span>
                              {log.metadata}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Pagination Controls */}
                  {logsTotalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <button
                        className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        disabled={logsPage === 1 || loadingLogs}
                        onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-455">
                        Page {logsPage} of {logsTotalPages}
                      </span>
                      <button
                        className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        disabled={logsPage === logsTotalPages || loadingLogs}
                        onClick={() =>
                          setLogsPage((p) => Math.min(logsTotalPages, p + 1))
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
