"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code, Search, Shield, Database, Cloud } from "lucide-react";
import Image from "next/image";

export default function AgentSwarmAnimation() {
  // Floating node items for orbit ring 1 (inner)
  const innerNodes = [
    {
      name: "Code Swarm",
      icon: Code,
      angle: 0,
      color: "from-cyan-500 to-blue-500",
      glow: "rgba(6,182,212,0.4)",
    },
    {
      name: "DB Gateway",
      icon: Database,
      angle: 180,
      color: "from-rose-500 to-pink-500",
      glow: "rgba(244,63,94,0.4)",
    },
  ];

  // Floating node items for orbit ring 2 (outer)
  const outerNodes = [
    {
      name: "Research Agent",
      icon: Search,
      angle: 30,
      color: "from-amber-500 to-orange-500",
      glow: "rgba(245,158,11,0.4)",
    },
    {
      name: "Zero Trust Node",
      icon: Shield,
      angle: 150,
      color: "from-emerald-500 to-teal-500",
      glow: "rgba(16,185,129,0.4)",
    },
    {
      name: "Cloud Hub",
      icon: Cloud,
      angle: 270,
      color: "from-violet-500 to-purple-500",
      glow: "rgba(139,92,246,0.4)",
    },
  ];

  return (
    <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center bg-gray-50/30 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl overflow-hidden backdrop-blur-md mx-auto">
      {/* Background grid glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Pulsing background ambient light */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        className="absolute w-[250px] h-[250px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-[60px] pointer-events-none"
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Central Core Node */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.4)",
              "0 0 40px rgba(139, 92, 246, 0.7)",
              "0 0 20px rgba(139, 92, 246, 0.4)",
            ],
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white border border-white/20 relative z-20 cursor-pointer"
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            alt="Inso Code Logo"
            className="w-8 h-8 object-contain"
            height={32}
            src="/logo-white.png"
            width={32}
          />
        </motion.div>

        {/* Floating background data particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-30, -100],
              x: [0, i % 2 === 0 ? 30 : -30],
              opacity: [0, 0.8, 0],
            }}
            className="absolute w-1 h-1 rounded-full bg-cyan-400 z-10"
            initial={{ opacity: 0.1, y: 30 }}
            style={{ left: `calc(50% + ${(i - 1.5) * 15}px)` }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Orbit Ring 1 (Inner) */}
      <motion.div
        animate={{ rotate: 360 }}
        className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-gray-200 dark:border-zinc-800/70 flex items-center justify-center pointer-events-none"
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {innerNodes.map((node, index) => {
          const IconComponent = node.icon;
          const rad = (node.angle * Math.PI) / 180;
          const x = 90 * Math.cos(rad);
          const y = 90 * Math.sin(rad);

          return (
            <motion.div
              key={index}
              className="pointer-events-auto"
              style={{
                position: "absolute",
                x,
                y,
              }}
            >
              {/* Counter-rotation to keep the icon upright */}
              <motion.div
                animate={{ rotate: -360 }}
                className="group relative"
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.15 }}
              >
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${node.color} p-[1px] flex items-center justify-center cursor-pointer`}
                  style={{ boxShadow: `0 0 15px ${node.glow}` }}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-gray-700 dark:text-zinc-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
                {/* Tooltip on hover */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded bg-black text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
                  {node.name}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Orbit Ring 2 (Outer) */}
      <motion.div
        animate={{ rotate: -360 }}
        className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-gray-200 dark:border-zinc-800/50 flex items-center justify-center pointer-events-none"
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {outerNodes.map((node, index) => {
          const IconComponent = node.icon;
          const rad = (node.angle * Math.PI) / 180;
          const x = 140 * Math.cos(rad);
          const y = 140 * Math.sin(rad);

          return (
            <motion.div
              key={index}
              className="pointer-events-auto"
              style={{
                position: "absolute",
                x,
                y,
              }}
            >
              {/* Counter-rotation to keep the icon upright */}
              <motion.div
                animate={{ rotate: 360 }}
                className="group relative"
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.15 }}
              >
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${node.color} p-[1px] flex items-center justify-center cursor-pointer`}
                  style={{ boxShadow: `0 0 15px ${node.glow}` }}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-gray-700 dark:text-zinc-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
                {/* Tooltip on hover */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-0.5 rounded bg-black text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
                  {node.name}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
