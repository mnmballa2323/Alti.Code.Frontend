"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SYMBOLS = [
  "{ }",
  "< />",
  "=>",
  "()",
  "⌘",
  "/*",
  "*/",
  "&&",
  "||",
  "01",
  "AI",
  "API",
  "[]",
  ">_",
  "===",
  "++",
  "+=",
  "${}",
  "->",
  "::",
  "NaN",
  "404",
  "git",
  "npm",
  "ts",
  "js",
  "go",
  "rs",
  "py",
  "{}",
  "()",
  "$",
  "@",
  "!",
  "?:",
  "<T>",
  "/>",
  "~/",
  "IL5",
  "IL6",
  "GCP",
  "SQL",
  "CSS",
  "HTML",
  "C++",
  "C#",
  "K8s",
  "Docker",
  "Blob",
  "VM",
  "Postgres",
  "Redis",
  "TCP",
  "HTTP",
  "REST",
  "JSON",
  "YAML",
  "SSH",
  "Linux",
  "React",
  "Vue",
  "Angular",
  "Swift",
  "Kotlin",
  "Java",
  "PHP",
  "Ruby",
  "Dart",
  "GraphQL",
  "DevOps",
  "CI/CD",
  "0x",
  "127.0.0.1",
  "localhost",
  "sudo",
  "bash",
];
const COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#000000"];

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseDir: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    this.size = Math.random() * 10 + 14;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.3 + 0.1;
    this.pulse = Math.random() * Math.PI;
    this.pulseDir = Math.random() * 0.02 + 0.01;
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += this.pulseDir;

    if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currentAlpha = this.alpha + Math.sin(this.pulse) * 0.1;

    ctx.font = `bold ${this.size}px Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0.05, currentAlpha);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.symbol, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

export default function MagicCodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 10000);

      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    window.addEventListener("resize", resize);

    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 100, 100, ${0.1 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <motion.div
        animate={{
          backgroundPosition: [
            "0% 0%",
            "100% 100%",
            "0% 100%",
            "100% 0%",
            "0% 0%",
          ],
        }}
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(66,133,244,0.12) 0%, rgba(234,67,53,0.08) 35%, rgba(251,188,5,0.05) 70%, rgba(255,255,255,0) 100%)",
          backgroundSize: "400% 400%",
        }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
