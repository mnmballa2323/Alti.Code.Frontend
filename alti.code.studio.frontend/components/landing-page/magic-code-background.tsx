"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SYMBOLS = ["{ }", "< />", "=>", "()", "⌘", "/*", "*/", "&&", "||", "01", "AI", "API", "[]"];
const COLORS = ["#000000", "#333333", "#666666", "#0070f3", "#7928ca"];

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
    let mouse = { x: -1000, y: -1000 };

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);

        const dxMouse = particles[i].x - mouse.x;
        const dyMouse = particles[i].y - mouse.y;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < 200) {
          ctx.beginPath();
          const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, mouse.x, mouse.y);
          gradient.addColorStop(0, `rgba(0, 112, 243, ${0.4 * (1 - distanceMouse / 200)})`);
          gradient.addColorStop(1, `rgba(121, 40, 202, ${0.4 * (1 - distanceMouse / 200)})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          
          particles[i].x -= dxMouse * 0.01;
          particles[i].y -= dyMouse * 0.01;
        }

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
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <motion.div 
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"] 
        }}
        transition={{ 
          duration: 30, 
          ease: "linear", 
          repeat: Infinity 
        }}
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at center, rgba(121,40,202,0.15) 0%, rgba(0,112,243,0.1) 40%, rgba(255,255,255,0) 100%)",
          backgroundSize: "400% 400%"
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
