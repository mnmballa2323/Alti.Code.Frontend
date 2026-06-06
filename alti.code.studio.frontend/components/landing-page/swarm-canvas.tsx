"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = Math.random() * 2 + 1.5; // Slightly larger for better visibility
    const colors = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#111111", "#444444"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(particles: Particle[], width: number, height: number) {
    // Boids physics: separation, alignment, cohesion
    let sepX = 0, sepY = 0;
    let aliX = 0, aliY = 0;
    let cohX = 0, cohY = 0;
    let total = 0;
    
    for (const other of particles) {
      if (other === this) continue;
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < 4000) { // Vision radius ~63px
        total++;
        // Separation (repulsion if too close)
        if (distSq < 800) { 
          sepX += dx / distSq;
          sepY += dy / distSq;
        }
        // Alignment
        aliX += other.vx;
        aliY += other.vy;
        // Cohesion
        cohX += other.x;
        cohY += other.y;
      }
    }
    
    if (total > 0) {
      aliX /= total; aliY /= total;
      cohX = (cohX / total) - this.x;
      cohY = (cohY / total) - this.y;
      
      // Apply Boid forces
      this.vx += (aliX * 0.05) + (cohX * 0.002) + (sepX * 2);
      this.vy += (aliY * 0.05) + (cohY * 0.002) + (sepY * 2);
    }
    
    // Center pull
    const centerX = width / 2;
    const centerY = height / 2;
    this.vx += (centerX - this.x) * 0.0001;
    this.vy += (centerY - this.y) * 0.0001;
    
    // Enforce max speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = 1.2; // Boids look better slightly faster
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    
    // Enforce min speed to prevent stopping
    const minSpeed = 0.4;
    if (speed < minSpeed && speed > 0) {
      this.vx = (this.vx / speed) * minSpeed;
      this.vy = (this.vy / speed) * minSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Soft bounds (turn around smoothly at edges)
    const margin = 30;
    const turnFactor = 0.05;
    if (this.x < margin) this.vx += turnFactor;
    if (this.x > width - margin) this.vx -= turnFactor;
    if (this.y < margin) this.vy += turnFactor;
    if (this.y > height - margin) this.vy -= turnFactor;
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
    const particleCount = 120; // Flocking needs slightly fewer to prevent total chaos
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    let animationFrameId: number;

    const render = () => {
      // Clear canvas with a slight trail effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(particles, canvas.width, canvas.height);
        particles[i].draw(ctx);

        // Draw connecting lines for nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 1 - distance / 50;
            ctx.strokeStyle = `rgba(100, 100, 100, ${opacity * 0.4})`;
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
    <div className="relative w-full max-w-[500px] aspect-square rounded-[2rem] bg-white border border-gray-200 overflow-hidden shadow-2xl flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Center Core Logo */}
      <div className="relative z-10 w-24 h-24 rounded-2xl bg-black/80 backdrop-blur-md shadow-2xl flex items-center justify-center border border-white/10 p-4">
        <Image src="/alti-logo.png" alt="Alti Logo" width={64} height={64} className="w-full h-full object-contain invert brightness-0 opacity-90" />
      </div>
    </div>
  );
}
