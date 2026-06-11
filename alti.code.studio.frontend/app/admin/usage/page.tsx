"use client";

import React, { useState, useRef } from "react";
import { Chip } from "@heroui/react";

// Types for Stock-Market Interactive Charting
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
        outputTokens: 150000,
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
        outputTokens: 185000,
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
            values: [850000, 1100000, 1300000, 1200000, 1600000, 1950000]
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

// Unified monochrome (black/white/gray) theme with Royal Blue accent
const theme = {
  primary: "text-blue-600 dark:text-blue-400",
  bg: "bg-blue-50/70 dark:bg-blue-950/15",
  border: "border-neutral-200 dark:border-neutral-800/80",
  accentBg: "bg-blue-600 dark:bg-blue-500",
  hoverBg: "hover:bg-blue-700 dark:hover:bg-blue-600",
  gradient: "from-blue-600/5 to-transparent",
  progressColor: "bg-blue-600 dark:bg-blue-500"
};

// Simulated dates and times for charting anchored on current local time
const getDateTime = (
  timeframe: "1D" | "1W" | "1M" | "1Y" | "All",
  index: number,
  label: string
) => {
  if (timeframe === "1D") {
    const now = new Date();
    // 8 points spaced 3 hours apart, ending at the current time
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

// Helper to determine a clean ceiling value for the Y-axis token scale based on data maximums
const getYScaleCeiling = (maxVal: number) => {
  if (maxVal <= 150000) return 150000;
  if (maxVal <= 500000) return 500000;
  if (maxVal <= 1000000) return 1000000;
  if (maxVal <= 2500000) return 2500000;
  if (maxVal <= 5000000) return 5000000;
  if (maxVal <= 10000000) return 10000000;
  if (maxVal <= 25000000) return 25000000;
  if (maxVal <= 50000000) return 50000000;
  return 100000000; // 100M
};

// Formats token ceiling values into clean readable labels for static Y-axis rendering
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

interface ArchivedModelInfo {
  name: string;
  version: string;
  decommissionedDate: string;
  totalTokens: string;
  requests: string;
  cost: number;
}

const archivedModelsData: Record<string, ArchivedModelInfo[]> = {
  azure: [
    {
      name: "GPT-4",
      version: "v4.0",
      decommissionedDate: "March 15, 2026",
      totalTokens: "125.40M",
      requests: "245,610",
      cost: 1254.00
    },
    {
      name: "GPT-3.5-Turbo",
      version: "v3.5",
      decommissionedDate: "November 20, 2025",
      totalTokens: "450.12M",
      requests: "1,894,320",
      cost: 900.24
    }
  ],
  aws: [
    {
      name: "Claude 3.5 Sonnet",
      version: "v3.5 (Legacy)",
      decommissionedDate: "December 10, 2025",
      totalTokens: "85.20M",
      requests: "189,450",
      cost: 255.60
    },
    {
      name: "Claude 3 Haiku",
      version: "v3.0",
      decommissionedDate: "August 05, 2025",
      totalTokens: "320.15M",
      requests: "2,410,500",
      cost: 96.04
    }
  ],
  gcp: [
    {
      name: "Gemini 1.5 Pro",
      version: "v1.5",
      decommissionedDate: "February 28, 2026",
      totalTokens: "180.45M",
      requests: "398,210",
      cost: 360.90
    },
    {
      name: "Gemini 1.0 Pro",
      version: "v1.0",
      decommissionedDate: "October 15, 2025",
      totalTokens: "290.10M",
      requests: "1,245,900",
      cost: 290.10
    }
  ]
};

export default function ModelUsagePage() {
  const [activeTab, setActiveTab] = useState<"aws" | "gcp" | "azure">("azure");
  const data = initialUsageData[activeTab];

  // Object tracking timeframe for each model name
  const [timeframes, setTimeframes] = useState<Record<string, "1D" | "1W" | "1M" | "1Y" | "All">>({});

  // Hover states for tooltips (independent per model card)
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Accordion state for archived & legacy models
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  // Format tokens display helper
  const formatTokens = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return num.toString();
  };

  // Handle mouse moves over the stock SVG line charts to calculate crosshair points
  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    valuesCount: number,
    modelName: string
  ) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left; // relative cursor X coordinates
    
    const svgWidth = 500;
    
    // Scale local cursor coordinate to SVG coordinate space
    const relativeX = (x / rect.width) * svgWidth;
    
    const chartWidth = 500;
    const xOffset = 0;
    
    // Clamp relativeX to chart plot area
    const clampedX = Math.max(xOffset, Math.min(xOffset + chartWidth, relativeX));
    
    // Get closest data point index
    const index = Math.max(0, Math.min(valuesCount - 1, Math.round(((clampedX - xOffset) / chartWidth) * (valuesCount - 1))));
    
    setHoveredModel(modelName);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredModel(null);
    setHoveredIndex(null);
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6 max-w-5xl mx-auto">
      <div className="space-y-6 pb-12">
        {/* Centered Provider Toggle Header */}
        <div className="flex justify-center w-full border-b border-neutral-100 dark:border-neutral-800/80 pb-6 mb-2">
          <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shrink-0 shadow-sm">
            <button
              onClick={() => setActiveTab("azure")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "azure"
                  ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              GPT
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "aws"
                  ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Claude
            </button>
            <button
              onClick={() => setActiveTab("gcp")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "gcp"
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
            const modelTokens = model.inputTokens + model.outputTokens;
            
            // Get selected timeframe state or fallback to default "1W"
            const selectedTimeframe = timeframes[model.name] || "1W";
            const timeframeData = model.timeframes[selectedTimeframe];
            const values = timeframeData.values;

            // Calculate dynamic tokens processed for the selected timeframe
            const timeframeTotal = values.reduce((acc, v) => acc + v, 0);
            const totalStaticTokens = model.inputTokens + model.outputTokens;
            const inputRatio = totalStaticTokens > 0 ? model.inputTokens / totalStaticTokens : 0.8;
            const dynamicInput = Math.round(timeframeTotal * inputRatio);
            const dynamicOutput = timeframeTotal - dynamicInput;

            // Calculate dynamic cost for the selected timeframe based on input/output split
            const dynamicCost = (dynamicInput / 1000000) * model.pricingPer1MInput + (dynamicOutput / 1000000) * model.pricingPer1MOutput;

            // Generate dynamic labels for 1D to match current local time
            const labels = selectedTimeframe === "1D"
              ? Array.from({ length: values.length }).map((_, i) => getDateTime("1D", i, "").time)
              : timeframeData.labels;

            // Generate coordinates for SVG Stock Chart
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

            // SVG Path strings
            const linePath = coords.reduce((acc, c, i) => {
              return acc + `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
            }, "");

            const areaPath = linePath + ` L ${xOffset + chartWidth} ${yOffset + chartHeight} L ${xOffset} ${yOffset + chartHeight} Z`;

            // Tooltip calculations on Hover (only active if this model card is hovered)
            const isHovered = hoveredModel === model.name;
            const activeHover = isHovered && hoveredIndex !== null && hoveredIndex < values.length
              ? {
                  index: hoveredIndex,
                  x: xOffset + (hoveredIndex / (values.length - 1)) * chartWidth,
                  y: yOffset + chartHeight - ((values[hoveredIndex] / yScaleCeiling) * chartHeight)
                }
              : null;
            const activeValue = activeHover ? values[activeHover.index] : values[values.length - 1];
            const activeLabel = activeHover ? labels[activeHover.index] : labels[labels.length - 1];

            // Resolve date and time
            const hoverDT = activeHover
              ? getDateTime(selectedTimeframe, activeHover.index, labels[activeHover.index])
              : getDateTime(selectedTimeframe, labels.length - 1, labels[labels.length - 1]);

            // Static axis endpoints datetime
            const firstDT = getDateTime(selectedTimeframe, 0, labels[0]);
            const midDT = getDateTime(selectedTimeframe, Math.floor(labels.length / 2), labels[Math.floor(labels.length / 2)]);
            const lastDT = getDateTime(selectedTimeframe, labels.length - 1, labels[labels.length - 1]);

            return (
              <div 
                key={model.name}
                className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between"
              >
                {/* 1. Header Info */}
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

                  {/* 2. Key Metrics Card */}
                  <div className="w-full bg-neutral-100/70 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 p-3 rounded-2xl flex items-center">
                    <div className="flex-1 flex justify-between items-center pr-2">
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens Processed</span>
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{formatTokens(timeframeTotal)}</span>
                      </div>
                      <div className="text-right flex flex-col justify-between h-8">
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium block leading-none pt-[1px]">
                          {formatTokens(dynamicInput)} <span className="opacity-60">tokens in</span>
                        </span>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium block leading-none pb-[1px]">
                          {formatTokens(dynamicOutput)} <span className="opacity-60">tokens out</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Stock-Market Style Interactive Line Chart */}
                  <div className="space-y-4 pt-2">
                    {/* Timeframe controls row & value display */}
                    <div className="flex justify-between items-center border-b border-neutral-100/50 dark:border-neutral-800/50 pb-2">
                      {/* Stock selectors: 1D / 1W / 1M / 1Y / All */}
                      <div className="flex gap-1 bg-neutral-100/60 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800 text-[9px] font-bold">
                        {(["1D", "1W", "1M", "1Y", "All"] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframes(prev => ({ ...prev, [model.name]: tf }))}
                            className={`px-2 py-1 rounded-md transition-all ${
                              selectedTimeframe === tf
                                ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>

                      {/* Right-aligned value display */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">
                          {formatTokens(activeValue)}
                        </span>
                        {activeHover && (
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium font-mono">
                            {selectedTimeframe === "1D" ? hoverDT.time : hoverDT.date.split(",")[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chart Canvas Area */}
                    <div className="relative h-36 w-full pt-1 select-none">
                      <svg
                        className="w-full h-full overflow-visible cursor-crosshair"
                        viewBox="0 0 500 130"
                        preserveAspectRatio="none"
                        onMouseMove={(e) => handleMouseMove(e, values.length, model.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Definitions for Gradient fills */}
                        <defs>
                          <linearGradient id={`chartGrad-${model.name.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Faint background grid lines */}
                        <line x1="0" y1="10" x2="500" y2="10" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.4)" className="dark:stroke-neutral-850/40" strokeWidth="1" strokeDasharray="2 2" />

                        {/* Bottom Axis Line */}
                        <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.7)" className="dark:stroke-neutral-800" strokeWidth="1" />

                        {/* Right Axis Line */}
                        <line x1="500" y1="10" x2="500" y2="100" stroke="rgba(229, 231, 235, 0.7)" className="dark:stroke-neutral-800" strokeWidth="1" />

                        {/* Static Bottom Axis Labels (Dates for >1D, Times for 1D) */}
                        <text x="0" y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="start">
                          {selectedTimeframe === "1D" ? firstDT.time : firstDT.date}
                        </text>
                        <text x={chartWidth / 2} y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="middle">
                          {selectedTimeframe === "1D" ? midDT.time : midDT.date}
                        </text>
                        <text x={chartWidth} y="118" fill="currentColor" className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                          {selectedTimeframe === "1D" ? lastDT.time : lastDT.date}
                        </text>

                        {/* Static Right Axis Labels (Tokens) */}
                        <text x="495" y="14" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                          {yScaleLabels.top}
                        </text>
                        <text x="495" y="59" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                          {yScaleLabels.mid}
                        </text>
                        <text x="495" y="103" fill="currentColor" className="text-[8px] text-neutral-400 dark:text-neutral-500 font-mono" textAnchor="end">
                          {yScaleLabels.bottom}
                        </text>

                        {/* Fill Gradient Area under line */}
                        <path
                          d={areaPath}
                          fill={`url(#chartGrad-${model.name.replace(/\s+/g, "")})`}
                          className="transition-all duration-300 ease-in-out"
                        />

                        {/* Main Royal Blue stroke path */}
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300 ease-in-out"
                        />

                        {/* Interactive vertical guide line & intersection pulse dot */}
                        {activeHover && (
                          <>
                            {/* Crosshair vertical line */}
                            <line
                              x1={activeHover.x}
                              y1={10}
                              x2={activeHover.x}
                              y2={100}
                              stroke="rgba(37, 99, 235, 0.35)"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              pointerEvents="none"
                            />
                            {/* Crosshair horizontal line */}
                            <line
                              x1={0}
                              y1={activeHover.y}
                              x2={500}
                              y2={activeHover.y}
                              stroke="rgba(37, 99, 235, 0.35)"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              pointerEvents="none"
                            />
                            {/* Crosshair pulse outer circle */}
                            <circle
                              cx={activeHover.x}
                              cy={activeHover.y}
                              r="9"
                              fill="#2563eb"
                              fillOpacity="0.15"
                              pointerEvents="none"
                            />
                            {/* Crosshair pulse dot */}
                            <circle
                              cx={activeHover.x}
                              cy={activeHover.y}
                              r="4"
                              fill="#2563eb"
                              stroke="white"
                              strokeWidth="1.5"
                              pointerEvents="none"
                            />

                            {/* Sliding interactive Date/Time badge on the bottom axis */}
                            <g transform={`translate(${Math.max(38, Math.min(462, activeHover.x))}, 118)`} pointerEvents="none">
                              <rect x="-38" y="-9" width="76" height="15" rx="3" fill="#2563eb" />
                              <text x="0" y="2" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                {selectedTimeframe === "1D" ? hoverDT.time : hoverDT.date.split(",")[0]}
                              </text>
                            </g>

                            {/* Sliding interactive Token badge on the right axis */}
                            <g transform={`translate(500, ${Math.max(18, Math.min(92, activeHover.y))})`} pointerEvents="none">
                              <rect x="-52" y="-8" width="52" height="15" rx="3" fill="#2563eb" />
                              <text x="-26" y="2" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                {formatTokens(activeValue)}
                              </text>
                            </g>

                            {/* Segmented capsule tooltip showing Date and Token Use to the right of the exact intersection */}
                            <g transform={`translate(${activeHover.x > 320 ? activeHover.x - 145 : activeHover.x + 10}, ${activeHover.y - 11})`} pointerEvents="none">
                              <rect x="0" y="0" width="136" height="22" rx="11" fill="rgba(15, 15, 17, 0.95)" stroke="#2563eb" strokeWidth="1.5" />
                              <text x="34" y="14" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                {selectedTimeframe === "1D" 
                                  ? `${hoverDT.date.split(" ")[0]} ${hoverDT.date.split(" ")[1].replace(",", "")} ${hoverDT.time}`
                                  : hoverDT.date.split(",")[0]}
                              </text>
                              <line x1="68" y1="3" x2="68" y2="19" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                              <text x="102" y="14" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                {formatTokens(activeValue)}
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
          {/* Title Bar Card */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-[#161b22] p-6 shadow-sm">
            <button 
              onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
              className="flex items-center justify-between w-full text-left focus:outline-none group"
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

          {/* Floating Dropdown Box Panel */}
          {isArchivedExpanded && (
            <div className="mt-3 z-30 space-y-3">
              {archivedModelsData[activeTab].map((model) => (
                <div key={model.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl gap-4 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-150 block">{model.name}</span>
                    <p className="text-[9px] text-neutral-455 dark:text-neutral-500">Decommissioned on {model.decommissionedDate}</p>
                  </div>
                  
                  <div className="flex gap-6 text-right sm:text-right">
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Total Tokens</span>
                      <span className="text-xs font-mono font-bold text-neutral-750 dark:text-neutral-355">{model.totalTokens}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Historical Cost</span>
                      <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">${model.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

