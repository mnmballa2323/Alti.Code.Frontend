"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSwarm() {
 const [os, setOs] = useState<"mac" | "win" | "other" | null>(null);

 useEffect(() => {
 if (typeof window !== "undefined") {
 const userAgent = window.navigator.userAgent.toLowerCase();

 if (userAgent.includes("mac")) {
 setOs("mac");
 } else if (userAgent.includes("win")) {
 setOs("win");
 } else {
 setOs("other");
 }
 }
 }, []);

 useEffect(() => {
 const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;

 if (!canvas) return;

 const ctx = canvas.getContext("2d");

 if (!ctx) return;

 let animationFrameId: number;
 let width = (canvas.width = window.innerWidth);
 let height = (canvas.height = window.innerHeight);

 // 1. Twinkling Stars Setup
 const stars: Array<{
 x: number;
 y: number;
 radius: number;
 opacity: number;
 pulseSpeed: number;
 phase: number;
 }> = [];
 const starCount = 200;

 for (let i = 0; i < starCount; i++) {
 stars.push({
 x: Math.random() * width,
 y: Math.random() * height,
 radius: Math.random() * 1.1 + 0.3,
 opacity: Math.random() * 0.65 + 0.25,
 pulseSpeed: Math.random() * 0.022 + 0.006,
 phase: Math.random() * Math.PI * 2,
 });
 }

 // 2. Constellation Network Particles Setup
 const particles: Array<{
 x: number;
 y: number;
 vx: number;
 vy: number;
 radius: number;
 }> = [];
 const particleCount = 55;
 const connectionDistance = 165;

 for (let i = 0; i < particleCount; i++) {
 particles.push({
 x: Math.random() * width,
 y: Math.random() * height,
 vx: (Math.random() - 0.5) * 0.28,
 vy: (Math.random() - 0.5) * 0.28,
 radius: Math.random() * 1.6 + 0.8,
 });
 }

 let mouse = { x: -1000, y: -1000 };

 const handleMouseMove = (e: MouseEvent) => {
 const rect = canvas.getBoundingClientRect();

 mouse.x = e.clientX - rect.left;
 mouse.y = e.clientY - rect.top;
 };

 const handleMouseLeave = () => {
 mouse.x = -1000;
 mouse.y = -1000;
 };

 const handleResize = () => {
 width = canvas.width = window.innerWidth;
 height = canvas.height = window.innerHeight;
 };

 window.addEventListener("mousemove", handleMouseMove);
 window.addEventListener("resize", handleResize);
 canvas.addEventListener("mouseleave", handleMouseLeave);

 const animate = () => {
 ctx.clearRect(0, 0, width, height);

 // Draw subtle grid
 ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
 ctx.lineWidth = 1;
 const gridSpacing = 100;

 for (let x = 0; x < width; x += gridSpacing) {
 ctx.beginPath();
 ctx.moveTo(x, 0);
 ctx.lineTo(x, height);
 ctx.stroke();
 }
 for (let y = 0; y < height; y += gridSpacing) {
 ctx.beginPath();
 ctx.moveTo(0, y);
 ctx.lineTo(width, y);
 ctx.stroke();
 }

 // Draw twinkling stars
 stars.forEach((s) => {
 s.phase += s.pulseSpeed;
 const currentOpacity = s.opacity * (0.35 + Math.sin(s.phase) * 0.65);

 ctx.beginPath();
 ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
 ctx.fillStyle = `rgba(0, 0, 0, ${currentOpacity})`;
 ctx.fill();
 });

 // Draw and update network particles
 particles.forEach((p) => {
 p.x += p.vx;
 p.y += p.vy;

 if (p.x < 0 || p.x > width) p.vx *= -1;
 if (p.y < 0 || p.y > height) p.vy *= -1;

 if (mouse.x > 0) {
 const dx = mouse.x - p.x;
 const dy = mouse.y - p.y;
 const dist = Math.sqrt(dx * dx + dy * dy);

 if (dist < 180) {
 p.x += (dx / dist) * 0.12;
 p.y += (dy / dist) * 0.12;
 }
 }

 ctx.beginPath();
 ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
 ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
 ctx.fill();
 });

 // Constellation lines between particles
 for (let i = 0; i < particles.length; i++) {
 for (let j = i + 1; j < particles.length; j++) {
 const p1 = particles[i];
 const p2 = particles[j];
 const dx = p1.x - p2.x;
 const dy = p1.y - p2.y;
 const dist = Math.sqrt(dx * dx + dy * dy);

 if (dist < connectionDistance) {
 const alpha = (1 - dist / connectionDistance) * 0.35;

 ctx.beginPath();
 ctx.moveTo(p1.x, p1.y);
 ctx.lineTo(p2.x, p2.y);
 ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
 ctx.lineWidth = 0.95;
 ctx.stroke();
 }
 }

 // Connection to mouse
 if (mouse.x > 0) {
 const p = particles[i];
 const dx = p.x - mouse.x;
 const dy = p.y - mouse.y;
 const dist = Math.sqrt(dx * dx + dy * dy);

 if (dist < 180) {
 const alpha = (1 - dist / 180) * 0.5;

 ctx.beginPath();
 ctx.moveTo(p.x, p.y);
 ctx.lineTo(mouse.x, mouse.y);
 ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
 ctx.lineWidth = 0.95;
 ctx.stroke();
 }
 }
 }

 animationFrameId = requestAnimationFrame(animate);
 };

 animate();

 return () => {
 cancelAnimationFrame(animationFrameId);
 window.removeEventListener("mousemove", handleMouseMove);
 window.removeEventListener("resize", handleResize);
 };
 }, []);

 return (
 <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white text-black px-4 sm:px-6 lg:px-8 pt-28">
 {/* Interactive Swarm Canvas */}
 <canvas
 className="absolute inset-0 w-full h-full pointer-events-none z-0"
 id="hero-canvas"
 />

 {/* Premium modern-style background gradient mesh */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
 {/* Ambient Magical Glows */}

 </div>

 <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-8 -mt-16 md:-mt-32">
 {/* Apple-style Headline */}
 <div className="flex flex-col items-center gap-6 relative top-2 md:top-4">
 <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter leading-[1.0] text-center">
 <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0000ff]">
 Private and Secure
 </span>
 <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] tracking-tight text-zinc-900 mt-3 whitespace-nowrap">
 Autonomous Software Engineering
 </span>
 </h1>
 <p className="max-w-5xl text-zinc-600 text-lg font-normal leading-relaxed mt-4 px-4">
 Deploy autonomous agent swarms to write clean code, execute tests,
 and fix compilation errors
 <br className="hidden md:inline" />
 directly inside your private cloud environment under complete
 sovereign and deterministic control.
 </p>
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col items-center gap-4 mt-6 md:mt-8 w-full sm:w-auto relative top-2 md:top-4">
 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
 {(os === "win" || os === "other" || os === null) && (
 <Button
 as={Link}
 className="w-full sm:w-auto bg-black text-white font-semibold rounded-full px-10 py-7 text-lg hover:scale-[1.02] hover:bg-zinc-800 transition-all shadow-lg shadow-black/5 flex items-center gap-3"
 href="/download/windows"
 size="lg"
 >
 <svg
 className="w-5 h-5"
 viewBox="0 0 100 100"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path d="M0,0 H47 V47 H0 Z" fill="#F25022" />
 <path d="M53,0 H100 V47 H53 Z" fill="#7FBA00" />
 <path d="M0,53 H47 V100 H0 Z" fill="#00A4EF" />
 <path d="M53,53 H100 V100 H53 Z" fill="#FFB900" />
 </svg>
 Download for Windows
 </Button>
 )}
 {(os === "mac" || os === "other" || os === null) && (
 <Button
 as={Link}
 className="w-full sm:w-auto bg-black text-white font-semibold rounded-full px-10 py-7 text-lg hover:scale-[1.02] hover:bg-zinc-800 transition-all shadow-lg shadow-black/5 flex items-center gap-3"
 href="/download/mac"
 size="lg"
 >
 <svg
 className="w-5 h-5"
 fill="currentColor"
 viewBox="0 0 384 512"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 273.5q-9 59.4 20 114.1c18.9 31.5 45.3 68.1 81.4 66.9 31-1.2 44.5-19.7 82.2-19.7 37.6 0 49.3 19 82.2 19 36.2-.6 58-31 75.9-61.9 22.8-38.3 32-77.8 33-80.4-5.3-2.6-63.6-25-64-82.8zM263.6 84.6c16.6-21.3 27.6-50 24.5-79.6-25.3 1.5-56.1 18.5-73.8 39.5-14.7 17.5-27 46.5-23.2 75.2 28.5 2.5 56.4-15.6 72.5-35.1z" />
 </svg>
 Download for Mac
 </Button>
 )}
 </div>
 {(os === "mac" || os === "win") && (
 <p className="text-sm text-zinc-600 font-medium">
 Also available for{" "}
 <Link
 className="underline hover:text-black transition-colors"
 href={os === "mac" ? "/download/windows" : "/download/mac"}
 >
 {os === "mac" ? "Windows" : "Mac"}
 </Link>
 .
 </p>
 )}
 </div>
 </div>
 </section>
 );
}
