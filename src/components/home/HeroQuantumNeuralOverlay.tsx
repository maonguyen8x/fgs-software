"use client";

import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";

interface Node {
  x: number;
  y: number;
  z: number;
  pulse: number;
  speed: number;
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: boolean[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

function initScene(width: number, height: number) {
  const nodes: Node[] = Array.from({ length: 24 }, (_, i) => ({
    x: Math.random() * width,
    y: height * (0.12 + Math.random() * 0.5),
    z: Math.random(),
    pulse: Math.random() * Math.PI * 2,
    speed: 0.25 + Math.random() * 0.55,
  }));

  const buildingCount = Math.floor(width / 70) + 4;
  const buildings: Building[] = Array.from({ length: buildingCount }, (_, i) => {
    const w = 28 + Math.random() * 48;
    const h = height * (0.12 + Math.random() * 0.28);
    const winRows = Math.floor(h / 14);
    const winCols = Math.floor(w / 10);
    const windows = Array.from({ length: winRows * winCols }, () => Math.random() > 0.55);
    return {
      x: i * (width / buildingCount) + Math.random() * 12 - 6,
      w,
      h,
      windows,
    };
  });

  return { nodes, buildings, particles: [] as Particle[] };
}

function HeroQuantumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ReturnType<typeof initScene> | null>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current = initScene(rect.width, rect.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      const ctx = canvas.getContext("2d");
      const state = stateRef.current;
      if (!ctx || !state) return;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const dt = prefersReduced ? 0 : Math.min(32, t - timeRef.current);
      timeRef.current = t;

      ctx.clearRect(0, 0, w, h);

      const horizon = h * 0.72;

      /* Subtle perspective grid */
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 0.45;
      const gridLines = 12;
      for (let i = 0; i <= gridLines; i++) {
        const p = i / gridLines;
        const y = horizon + (h - horizon) * p * p;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const vanishX = w * 0.5;
      for (let i = -10; i <= 10; i++) {
        const x = vanishX + i * (w * 0.09);
        ctx.beginPath();
        ctx.moveTo(vanishX, horizon * 0.92);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.restore();

      /* Soft city silhouette — very faint */
      ctx.save();
      ctx.globalAlpha = 0.22;
      for (const b of state.buildings) {
        const baseY = horizon;
        ctx.fillStyle = "rgba(8, 47, 73, 0.35)";
        ctx.fillRect(b.x, baseY - b.h, b.w, b.h);

        const cols = Math.floor(b.w / 12);
        const rows = Math.floor(b.h / 16);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (!b.windows[idx % b.windows.length]) continue;
            const flicker = 0.35 + Math.sin(t * 0.0015 + idx + b.x) * 0.2;
            ctx.fillStyle = `rgba(125, 211, 252, ${flicker * 0.45})`;
            ctx.fillRect(b.x + 4 + c * 12, baseY - b.h + 6 + r * 16, 4, 6);
          }
        }
      }
      ctx.restore();

      /* Neural connections — submerged */
      const { nodes } = state;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 140) continue;
          const alpha = (1 - dist / 140) * (0.06 + Math.sin(t * 0.002 + i + j) * 0.04);
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
          grad.addColorStop(0.5, `rgba(34, 211, 238, ${alpha * 1.4})`);
          grad.addColorStop(1, `rgba(167, 139, 250, ${alpha})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.7 + a.z * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        if (!prefersReduced) {
          node.pulse += dt * 0.001 * node.speed;
          node.y += Math.sin(node.pulse) * 0.04;
        }
        const glow = 5 + Math.sin(node.pulse) * 2.5;
        const rg = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glow * 1.8);
        rg.addColorStop(0, "rgba(147, 197, 253, 0.55)");
        rg.addColorStop(0.5, "rgba(59, 130, 246, 0.18)");
        rg.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glow * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(224, 242, 254, 0.65)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.1 + node.z * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      /* Quantum orbital rings — faint */
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.translate(w * 0.5, h * 0.38);
      for (let ring = 0; ring < 3; ring++) {
        const rx = w * (0.22 + ring * 0.08);
        const ry = h * (0.07 + ring * 0.02);
        const rot = prefersReduced ? ring * 0.4 : t * 0.00025 * (ring % 2 === 0 ? 1 : -1) + ring;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, rot, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring === 1 ? "34, 211, 238" : "139, 92, 246"}, ${0.35 - ring * 0.08})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      /* Data particles along neural edges */
      if (!prefersReduced && Math.random() < 0.05) {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];
        if (a !== b) {
          state.particles.push({
            x: a.x,
            y: a.y,
            vx: (b.x - a.x) * 0.012,
            vy: (b.y - a.y) * 0.012,
            life: 1,
            hue: Math.random() > 0.5 ? 199 : 263,
          });
        }
      }

      state.particles = state.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
        if (p.life <= 0) return false;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${p.life * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-quantum-canvas absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function OverlayFallback() {
  return (
    <div className="hero-quantum-fallback pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-linear-to-t from-cyan-950/35 via-transparent to-violet-950/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-linear-to-t from-slate-950/55 to-transparent" />
    </div>
  );
}

export function HeroQuantumNeuralOverlay() {
  return (
    <ClientOnly fallback={<OverlayFallback />}>
      <div className="hero-quantum-overlay pointer-events-none absolute inset-0 z-[3]" aria-hidden>
        <HeroQuantumCanvas />
        <div className="hero-quantum-vignette absolute inset-0" />
      </div>
    </ClientOnly>
  );
}
