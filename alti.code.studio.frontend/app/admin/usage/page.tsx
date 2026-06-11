"use client";

import React, { useState, useRef } from "react";
import { 
  Cpu, 
  Coins, 
  Activity, 
  Clock, 
  FileText
} from "lucide-react";
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
        name: "GPT-4o",
        version: "2024-05-13",
        isPrimary: true,
        inputTokens: 4120000,
        outputTokens: 1200000,
        requests: 10240,
        avgLatency: 720,
        cost: 16.60,
        pricingPer1MInput: 2.50,
        pricingPer1MOutput: 10.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [25000, 12000, 8000, 45000, 90000, 120000, 85000, 60000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [420000, 510000, 590000, 480000, 730000, 260000, 410000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [1800000, 2100000, 1900000, 2420000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [1200000, 1400000, 1800000, 1500000, 2200000, 2800000, 3200000, 2900000, 3500000, 4100000, 3800000, 4800000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [8500000, 11000000, 13000000, 12000000, 16000000, 19500000]
          }
        },
        recentRequests: [
          {
            id: "req-gpt4o-1",
            timestamp: "Just now",
            promptSnippet: "Assemble dynamic view transitions layouts for admin routes...",
            tokens: 4320,
            latency: 680,
            cost: 0.0151,
          },
          {
            id: "req-gpt4o-2",
            timestamp: "18 mins ago",
            promptSnippet: "Optimize database connection pooling parameters for PostgreSQL...",
            tokens: 2840,
            latency: 750,
            cost: 0.0092,
          },
          {
            id: "req-gpt4o-3",
            timestamp: "1 hr ago",
            promptSnippet: "Translate system documentation translation assets for French localization...",
            tokens: 1850,
            latency: 620,
            cost: 0.0058,
          },
        ]
      },
      {
        name: "GPT-4o-mini",
        version: "2024-07-18",
        isPrimary: false,
        inputTokens: 950000,
        outputTokens: 150000,
        requests: 4262,
        avgLatency: 280,
        cost: 2.30,
        pricingPer1MInput: 0.15,
        pricingPer1MOutput: 0.60,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [8000, 3000, 1000, 12000, 28000, 35000, 22000, 15000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [90000, 110000, 120000, 110000, 160000, 50000, 80000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [380000, 410000, 390000, 480000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [210000, 240000, 320000, 290000, 380000, 450000, 510000, 480000, 550000, 620000, 590000, 710000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [1200000, 1800000, 2400000, 2200000, 3200000, 4100000]
          }
        },
        recentRequests: [
          {
            id: "req-gpt4omini-1",
            timestamp: "45 mins ago",
            promptSnippet: "Form autofill handler autocomplete listeners implementation...",
            tokens: 820,
            latency: 250,
            cost: 0.0002,
          },
          {
            id: "req-gpt4omini-2",
            timestamp: "2 hrs ago",
            promptSnippet: "Sanitize HTML string utility function input checks...",
            tokens: 450,
            latency: 220,
            cost: 0.0001,
          },
          {
            id: "req-gpt4omini-3",
            timestamp: "5 hrs ago",
            promptSnippet: "Fetch user profile status header check values...",
            tokens: 350,
            latency: 290,
            cost: 0.0001,
          },
        ]
      }
    ]
  },
  aws: {
    models: [
      {
        name: "Claude 3.5 Sonnet",
        version: "v2 (Latest)",
        isPrimary: true,
        inputTokens: 2450000,
        outputTokens: 890000,
        requests: 7650,
        avgLatency: 820,
        cost: 11.80,
        pricingPer1MInput: 3.00,
        pricingPer1MOutput: 15.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [15000, 8000, 5000, 32000, 75000, 98000, 68000, 42000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [290000, 360000, 420000, 330000, 510000, 190000, 440000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [1200000, 1500000, 1350000, 1780000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [800000, 950000, 1200000, 1100000, 1500000, 1900000, 2100000, 1850000, 2300000, 2700000, 2500000, 3340000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [5500000, 7200000, 8900000, 8100000, 11200000, 13400000]
          }
        },
        recentRequests: [
          {
            id: "req-claude-1",
            timestamp: "2 mins ago",
            promptSnippet: "Explain clean architecture module dependencies in Kotlin KMP...",
            tokens: 1820,
            latency: 780,
            cost: 0.0078,
          },
          {
            id: "req-claude-2",
            timestamp: "12 mins ago",
            promptSnippet: "Refactor MonacoEditor.tsx component layout parameters...",
            tokens: 3450,
            latency: 950,
            cost: 0.0142,
          },
          {
            id: "req-claude-3",
            timestamp: "2 hrs ago",
            promptSnippet: "Parse incoming git diff layout representation regex helper...",
            tokens: 1250,
            latency: 890,
            cost: 0.0049,
          },
        ]
      },
      {
        name: "Claude 3 Opus",
        version: "v1",
        isPrimary: false,
        inputTokens: 320000,
        outputTokens: 185000,
        requests: 782,
        avgLatency: 2100,
        cost: 3.02,
        pricingPer1MInput: 15.00,
        pricingPer1MOutput: 75.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [2000, 1000, 500, 6000, 14000, 18000, 11000, 8000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [50000, 80000, 90000, 70000, 110000, 40000, 65000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [210000, 240000, 220000, 280000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [120000, 150000, 180000, 160000, 220000, 290000, 310000, 285000, 330000, 380000, 360000, 505000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [850000, 1100000, 1300000, 1200000, 1600000, 1950000]
          }
        },
        recentRequests: [
          {
            id: "req-opus-1",
            timestamp: "1 hr ago",
            promptSnippet: "Execute security scan rules auditor for Supabase postgres.sql...",
            tokens: 8900,
            latency: 2400,
            cost: 0.185,
          },
          {
            id: "req-opus-2",
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
        name: "Gemini 1.5 Pro",
        version: "v1.5",
        isPrimary: true,
        inputTokens: 3100000,
        outputTokens: 710000,
        requests: 6920,
        avgLatency: 980,
        cost: 4.86,
        pricingPer1MInput: 1.25,
        pricingPer1MOutput: 5.00,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [22000, 11000, 7000, 38000, 79000, 95000, 78000, 51000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [380000, 420000, 490000, 350000, 580000, 210000, 490000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [1450000, 1680000, 1520000, 1890000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [950000, 1100000, 1350000, 1200000, 1700000, 2100000, 2350000, 2100000, 2600000, 3050000, 2900000, 3810000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [6800000, 8900000, 10500000, 9800000, 13200000, 15400000]
          }
        },
        recentRequests: [
          {
            id: "req-gemini-1",
            timestamp: "24 mins ago",
            promptSnippet: "Perform evolutionary conservation phyloP scores lookup UCSC...",
            tokens: 12400,
            latency: 1120,
            cost: 0.0182,
          },
          {
            id: "req-gemini-2",
            timestamp: "1 hr ago",
            promptSnippet: "Resolve biological ontology terms resolution lookup EBI OLS...",
            tokens: 4120,
            latency: 890,
            cost: 0.0058,
          },
        ]
      },
      {
        name: "Gemini 1.5 Flash",
        version: "v1.5",
        isPrimary: false,
        inputTokens: 1100000,
        outputTokens: 300000,
        requests: 4283,
        avgLatency: 340,
        cost: 1.26,
        pricingPer1MInput: 0.075,
        pricingPer1MOutput: 0.30,
        timeframes: {
          "1D": {
            labels: ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
            values: [9000, 4000, 1500, 15000, 31000, 38000, 26000, 18000]
          },
          "1W": {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [105000, 140000, 155000, 120000, 170000, 60000, 145000]
          },
          "1M": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [490000, 560000, 520000, 630000]
          },
          "1Y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [310000, 350000, 450000, 410000, 580000, 690000, 780000, 720000, 890000, 990000, 950000, 1400000]
          },
          "All": {
            labels: ["Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"],
            values: [1800000, 2800000, 3600000, 3300000, 4800000, 5900000]
          }
        },
        recentRequests: [
          {
            id: "req-flash-1",
            timestamp: "5 mins ago",
            promptSnippet: "Lookup clinical evidence pathogen classification ClinVar...",
            tokens: 950,
            latency: 280,
            cost: 0.0001,
          },
          {
            id: "req-flash-2",
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

export default function ModelUsagePage() {
  const [activeTab, setActiveTab] = useState<"aws" | "gcp" | "azure">("azure");
  const data = initialUsageData[activeTab];

  // Object tracking timeframe for each model name
  const [timeframes, setTimeframes] = useState<Record<string, "1D" | "1W" | "1M" | "1Y" | "All">>({});

  // Hover states for tooltips
  const [hoveredData, setHoveredData] = useState<Record<string, { index: number; x: number; y: number } | null>>({});

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
    modelName: string,
    labels: string[],
    values: number[]
  ) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x = e.clientX - rect.left; // relative cursor X coordinates
    
    const svgWidth = 500;
    const pointsCount = values.length;
    
    // Scale local cursor coordinate to SVG coordinate space
    const relativeX = (x / rect.width) * svgWidth;
    
    // Get closest data point index
    const index = Math.max(0, Math.min(pointsCount - 1, Math.round((relativeX / svgWidth) * (pointsCount - 1))));
    
    // Calculate Y height for this point
    const maxVal = Math.max(...values, 1);
    const svgHeight = 100;
    const paddingY = 10;
    const val = values[index];
    
    const calculatedX = (index / (pointsCount - 1)) * svgWidth;
    const calculatedY = svgHeight - paddingY - ((val / maxVal) * (svgHeight - 2 * paddingY));

    setHoveredData(prev => ({
      ...prev,
      [modelName]: { index, x: calculatedX, y: calculatedY }
    }));
  };

  const handleMouseLeave = (modelName: string) => {
    setHoveredData(prev => ({
      ...prev,
      [modelName]: null
    }));
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6 max-w-5xl mx-auto">
      <div className="space-y-6">
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
            const { labels, values } = timeframeData;

            // Generate coordinates for SVG Stock Chart
            const maxVal = Math.max(...values, 1);
            const svgWidth = 500;
            const svgHeight = 100;
            const paddingY = 10;

            const coords = values.map((val, i) => {
              const x = (i / (values.length - 1)) * svgWidth;
              const y = svgHeight - paddingY - ((val / maxVal) * (svgHeight - 2 * paddingY));
              return { x, y };
            });

            // SVG Path strings
            const linePath = coords.reduce((acc, c, i) => {
              return acc + `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
            }, "");

            const areaPath = linePath + ` L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

            // Tooltip calculations on Hover
            const activeHover = hoveredData[model.name];
            const activeValue = activeHover ? values[activeHover.index] : values[values.length - 1];
            const activeLabel = activeHover ? labels[activeHover.index] : labels[labels.length - 1];

            return (
              <div 
                key={model.name}
                className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between"
              >
                {/* 1. Header Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        {model.name}
                        {model.isPrimary && (
                          <Chip className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] border-none font-bold h-4" size="sm">
                            Primary
                          </Chip>
                        )}
                      </h3>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Version: {model.version}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-neutral-950 dark:text-white">${model.cost.toFixed(2)}</span>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-500">
                        ${model.pricingPer1MInput.toFixed(2)} / ${model.pricingPer1MOutput.toFixed(2)} <span className="opacity-60">1M t</span>
                      </p>
                    </div>
                  </div>

                  {/* 2. Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* API Requests */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Activity size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">API Calls</span>
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{model.requests.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Latency */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Clock size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Avg Latency</span>
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{model.avgLatency}ms</span>
                      </div>
                    </div>

                    {/* Total Tokens */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3 col-span-2">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Cpu size={14} />
                      </div>
                      <div className="flex-1 flex justify-between items-center pr-2">
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens Processed</span>
                          <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{formatTokens(modelTokens)}</span>
                        </div>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                          In: {formatTokens(model.inputTokens)} | Out: {formatTokens(model.outputTokens)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Stock-Market Style Interactive Line Chart */}
                  <div className="space-y-4 pt-2">
                    {/* Timeframe controls row & value display */}
                    <div className="flex justify-between items-end border-b border-neutral-100/50 dark:border-neutral-800/50 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Token Volume Trend</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">
                            {formatTokens(activeValue)}
                          </span>
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium font-mono">
                            {activeLabel}
                          </span>
                        </div>
                      </div>

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
                    </div>

                    {/* Chart Canvas Area */}
                    <div className="relative h-28 w-full pt-1 select-none">
                      <svg
                        className="w-full h-full overflow-visible cursor-crosshair"
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="none"
                        onMouseMove={(e) => handleMouseMove(e, model.name, labels, values)}
                        onMouseLeave={() => handleMouseLeave(model.name)}
                      >
                        {/* Definitions for Gradient fills */}
                        <defs>
                          <linearGradient id={`chartGrad-${model.name.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

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
                              y1={0}
                              x2={activeHover.x}
                              y2={svgHeight}
                              stroke="rgba(37, 99, 235, 0.25)"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            {/* Crosshair pulse dot */}
                            <circle
                              cx={activeHover.x}
                              cy={activeHover.y}
                              r="5"
                              fill="#2563eb"
                              stroke="white"
                              strokeWidth="2"
                              className="animate-pulse"
                            />
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4. Recent Logs for this specific model */}
                <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={10} /> Model Activity Log
                  </span>
                  
                  <div className="space-y-2.5">
                    {model.recentRequests.map((req) => (
                      <div key={req.id} className="text-xs border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2 last:border-b-0 last:pb-0 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <p className="text-neutral-500 dark:text-neutral-400 truncate flex-1 pr-4">
                            "{req.promptSnippet}"
                          </p>
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono shrink-0">{req.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-neutral-400 font-medium">
                          <span>{req.tokens} t | {req.latency}ms</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-350">${req.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
