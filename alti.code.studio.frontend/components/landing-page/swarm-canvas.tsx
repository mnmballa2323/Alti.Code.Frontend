"use client";

import { useEffect, useRef } from "react";

class Particle {
  angle: number;
  distance: number;
  speed: number;
  inwardSpeed: number;
  size: number;
  color: string;
  x: number = 0;
  y: number = 0;

  constructor(width: number, height: number, initial: boolean = true) {
    this.angle = Math.random() * Math.PI * 2;
    // Max distance is slightly larger than the container to spawn outside
    const maxDist = Math.max(width, height) / 1.2;

    this.distance = initial ? Math.random() * maxDist : maxDist;

    // Orbital speed and inward suction speed
    this.speed = Math.random() * 0.01 + 0.002;
    this.inwardSpeed = Math.random() * 0.4 + 0.1;

    this.size = Math.random() * 2 + 1;
    const colors = [
      "#3b82f6", // Blue
      "#1d4ed8", // Dark Blue
      "#60a5fa", // Light Blue
      "#06b6d4", // Cyan
      "#0ea5e9", // Sky Blue
    ];

    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(width: number, height: number) {
    // Spin faster as they approach the center (simulating gravity well / black hole)
    const angularVelocity = this.speed * (150 / Math.max(30, this.distance));

    this.angle += angularVelocity;

    // Move inward
    this.distance -= this.inwardSpeed;

    // If swallowed by the center, respawn at the edge
    if (this.distance < 5) {
      const maxDist = Math.max(width, height) / 1.2;

      this.distance = maxDist;
      this.angle = Math.random() * Math.PI * 2;
    }

    // Calculate absolute X and Y for rendering
    this.x = width / 2 + Math.cos(this.angle) * this.distance;
    this.y = height / 2 + Math.sin(this.angle) * this.distance;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

export default function SwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Handle Resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;

      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize Particles
    const particles: Particle[] = [];
    const particleCount = 200; // Vortex looks great with higher density

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height, true));
    }

    let animationFrameId: number;

    const render = () => {
      // Clear canvas with a slight trail effect to create motion blur (clearing with deep dark navy)
      ctx.fillStyle = "rgba(3, 0, 20, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);

        // Draw connecting lines for nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connecting lines emphasize the swirling vortex arms (using purple/blue glowing lines)
          if (distance < 45) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 1 - distance / 45;

            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.25})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[360px] aspect-square rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl group flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]">
      <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-blue-600/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
}
