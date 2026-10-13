"use client";

import React, { useEffect, useRef } from "react";

interface Packet {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}

interface ServerNode {
  x: number;
  y: number;
  label: string;
  region: string;
  active: boolean;
  pulseRadius: number;
  pulseMax: number;
  pulseAlpha: number;
}

export function TechCloudBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = Math.max(canvas.parentElement?.offsetWidth || 0, typeof window !== "undefined" ? window.innerWidth : 1280));
    let height = (canvas.height = Math.max(canvas.parentElement?.offsetHeight || 0, 720));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.max(canvas.parentElement?.offsetWidth || 0, window.innerWidth || 1280);
      height = canvas.height = Math.max(canvas.parentElement?.offsetHeight || 0, 720);
      initTopology();
    };

    window.addEventListener("resize", handleResize);

    // Grid coordinates & Server Nodes
    let nodes: ServerNode[] = [];
    let busLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    let packets: Packet[] = [];

    const packetColorsDark = ["#06b6d4", "#10b981", "#38bdf8", "#818cf8", "#34d399"];
    const packetColorsLight = ["#0284c7", "#059669", "#2563eb", "#6366f1", "#10b981"];

    const isDarkMode = () => document.documentElement.classList.contains("dark");

    const initTopology = () => {
      nodes = [
        { x: width * 0.12, y: height * 0.22, label: "Node US-East", region: "NVMe 11ms", active: true, pulseRadius: 2, pulseMax: 32, pulseAlpha: 0.9 },
        { x: width * 0.86, y: height * 0.18, label: "Node EU-West", region: "SPF/DKIM Pass", active: true, pulseRadius: 10, pulseMax: 28, pulseAlpha: 0.8 },
        { x: width * 0.08, y: height * 0.65, label: "Relay Cloud-1", region: "Active SMTP", active: true, pulseRadius: 18, pulseMax: 34, pulseAlpha: 0.7 },
        { x: width * 0.90, y: height * 0.62, label: "Storage ZFS", region: "Encrypted AES", active: true, pulseRadius: 5, pulseMax: 30, pulseAlpha: 0.85 },
        { x: width * 0.28, y: height * 0.85, label: "DNS Engine", region: "Auto Anycast", active: true, pulseRadius: 14, pulseMax: 30, pulseAlpha: 0.75 },
        { x: width * 0.74, y: height * 0.82, label: "Anti-Spam AI", region: "Zero False Pos", active: true, pulseRadius: 8, pulseMax: 32, pulseAlpha: 0.8 },
      ];

      // Define bus routes connecting the nodes
      busLines = [
        { x1: width * 0.12, y1: height * 0.22, x2: width * 0.86, y2: height * 0.18 },
        { x1: width * 0.12, y1: height * 0.22, x2: width * 0.08, y2: height * 0.65 },
        { x1: width * 0.08, y1: height * 0.65, x2: width * 0.28, y2: height * 0.85 },
        { x1: width * 0.28, y1: height * 0.85, x2: width * 0.74, y2: height * 0.82 },
        { x1: width * 0.74, y1: height * 0.82, x2: width * 0.90, y2: height * 0.62 },
        { x1: width * 0.90, y1: height * 0.62, x2: width * 0.86, y2: height * 0.18 },
        { x1: width * 0.12, y1: height * 0.22, x2: width * 0.50, y2: height * 0.45 },
        { x1: width * 0.86, y1: height * 0.18, x2: width * 0.50, y2: height * 0.45 },
        { x1: width * 0.50, y1: height * 0.45, x2: width * 0.28, y2: height * 0.85 },
        { x1: width * 0.50, y1: height * 0.45, x2: width * 0.74, y2: height * 0.82 },
      ];

      // Initialize packets
      packets = [];
      for (let i = 0; i < 18; i++) {
        const route = busLines[Math.floor(Math.random() * busLines.length)];
        const forward = Math.random() > 0.5;
        const colors = isDarkMode() ? packetColorsDark : packetColorsLight;
        packets.push({
          startX: forward ? route.x1 : route.x2,
          startY: forward ? route.y1 : route.y2,
          targetX: forward ? route.x2 : route.x1,
          targetY: forward ? route.y2 : route.y1,
          x: forward ? route.x1 : route.x2,
          y: forward ? route.y1 : route.y2,
          progress: Math.random(),
          speed: 0.004 + Math.random() * 0.007,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2.5 + Math.random() * 2,
          trail: [],
        });
      }
    };

    initTopology();

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const gridStroke = dark ? "rgba(255, 255, 255, 0.035)" : "rgba(0, 0, 0, 0.04)";
      const busStroke = dark ? "rgba(56, 189, 248, 0.14)" : "rgba(2, 132, 199, 0.12)";
      const busGlow = dark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.06)";

      // Draw subtle server rack matrix grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridStroke;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw bus lines connecting cloud server nodes
      ctx.lineWidth = 1.5;
      busLines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = busStroke;
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        // Subtle glow line
        ctx.beginPath();
        ctx.strokeStyle = busGlow;
        ctx.lineWidth = 4;
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
        ctx.lineWidth = 1.5;
      });

      // Update & Draw Packets (moving data streams)
      const colors = dark ? packetColorsDark : packetColorsLight;
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          // Pick a new route
          const route = busLines[Math.floor(Math.random() * busLines.length)];
          const forward = Math.random() > 0.5;
          p.startX = forward ? route.x1 : route.x2;
          p.startY = forward ? route.y1 : route.y2;
          p.targetX = forward ? route.x2 : route.x1;
          p.targetY = forward ? route.y2 : route.y1;
          p.color = colors[Math.floor(Math.random() * colors.length)];
          p.trail = [];
        }

        p.x = p.startX + (p.targetX - p.startX) * p.progress;
        p.y = p.startY + (p.targetY - p.startY) * p.progress;

        // Record trail for light streak effect
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        // Draw light streak trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = dark ? 0.35 : 0.25;
          ctx.lineWidth = p.size * 0.75;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Draw glowing packet head
        ctx.save();
        ctx.shadowBlur = dark ? 12 : 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Server Nodes and radar pings
      nodes.forEach((n) => {
        // Expand radar ping wave
        n.pulseRadius += dt * 18;
        if (n.pulseRadius > n.pulseMax) {
          n.pulseRadius = 2;
        }
        n.pulseAlpha = Math.max(0, 1 - n.pulseRadius / n.pulseMax);

        // Ping wave ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = dark
          ? `rgba(16, 185, 129, ${n.pulseAlpha * 0.7})`
          : `rgba(5, 150, 105, ${n.pulseAlpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node center core
        ctx.save();
        ctx.shadowBlur = dark ? 14 : 8;
        ctx.shadowColor = dark ? "#10b981" : "#059669";
        ctx.fillStyle = dark ? "#34d399" : "#10b981";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Inner white dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Dynamic Aurora Tech Cloud Radial Glows */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[850px] h-[520px] bg-gradient-to-b from-blue-600/20 via-emerald-500/15 to-transparent dark:from-blue-500/30 dark:via-emerald-400/20 rounded-full blur-[110px] will-change-transform animate-pulseGlow" />
      <div className="absolute top-1/3 left-1/4 w-[550px] h-[380px] bg-indigo-500/15 dark:bg-indigo-600/25 rounded-full blur-[100px] will-change-transform" />
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[90px] will-change-transform" />

      {/* 60FPS Live Animated Cybernetic Server Mesh Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Floating Server Cloud Telemetry Badges with Live Ping Waves */}
      <div className="hidden lg:flex absolute top-24 left-6 xl:left-14 animate-float items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-300/80 dark:border-neutral-700/80 bg-white/90 dark:bg-[#11141e]/90 backdrop-blur-md text-[11px] shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="font-mono text-neutral-600 dark:text-neutral-300 font-medium">Node US-East</span>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
          11ms
        </span>
      </div>

      <div
        className="hidden lg:flex absolute top-36 right-6 xl:right-14 animate-float items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-300/80 dark:border-neutral-700/80 bg-white/90 dark:bg-[#11141e]/90 backdrop-blur-md text-[11px] shadow-sm"
        style={{ animationDelay: "1.2s" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
        <span className="font-mono text-neutral-600 dark:text-neutral-300 font-medium">DKIM / SPF 2048</span>
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px]">
          PASS
        </span>
      </div>

      <div
        className="hidden xl:flex absolute bottom-20 left-16 animate-float items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-300/80 dark:border-neutral-700/80 bg-white/90 dark:bg-[#11141e]/90 backdrop-blur-md text-[11px] shadow-sm"
        style={{ animationDelay: "2.4s" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <span className="font-mono text-neutral-600 dark:text-neutral-300 font-medium">Global DNS Gateway</span>
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px]">
          LIVE
        </span>
      </div>

      <div
        className="hidden xl:flex absolute bottom-28 right-20 animate-float items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-300/80 dark:border-neutral-700/80 bg-white/90 dark:bg-[#11141e]/90 backdrop-blur-md text-[11px] shadow-sm"
        style={{ animationDelay: "3.5s" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="font-mono text-neutral-600 dark:text-neutral-300 font-medium">Cloud NVMe SLA</span>
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
          99.99%
        </span>
      </div>
    </div>
  );
}
