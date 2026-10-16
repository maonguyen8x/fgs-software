"use client";

import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";

type NeuralPoint = readonly [number, number];

interface NeuralRoute {
  points: readonly NeuralPoint[];
  speed: number;
  offset: number;
}

const NEURAL_ROUTES: readonly NeuralRoute[] = [
  {
    points: [[0.15, 0.48], [0.23, 0.42], [0.28, 0.34], [0.35, 0.27], [0.4, 0.17], [0.55, 0.11], [0.72, 0.14], [0.88, 0.26]],
    speed: 0.000075,
    offset: 0.13,
  },
  {
    points: [[0.28, 0.34], [0.24, 0.27], [0.3, 0.18], [0.43, 0.1], [0.57, 0.08]],
    speed: 0.00009,
    offset: 0.42,
  },
  {
    points: [[0.35, 0.27], [0.49, 0.3], [0.64, 0.35], [0.8, 0.32], [0.88, 0.26]],
    speed: 0.00007,
    offset: 0.71,
  },
  {
    points: [[0.4, 0.17], [0.52, 0.24], [0.57, 0.38], [0.55, 0.52], [0.52, 0.64], [0.48, 0.79], [0.46, 0.97]],
    speed: 0.000085,
    offset: 0.24,
  },
  {
    points: [[0.23, 0.42], [0.32, 0.48], [0.42, 0.51], [0.52, 0.64], [0.59, 0.76], [0.68, 0.91]],
    speed: 0.000065,
    offset: 0.56,
  },
  {
    points: [[0.64, 0.35], [0.7, 0.45], [0.65, 0.56], [0.59, 0.64]],
    speed: 0.0001,
    offset: 0.83,
  },
];

function humanBounds(width: number, height: number) {
  const figureHeight = height * 1.08;
  const figureWidth = Math.min(width * 0.62, figureHeight * 0.82);
  return {
    left: width * 0.42,
    top: -height * 0.025,
    width: figureWidth,
    height: figureHeight,
  };
}

function traceHumanProfile(
  ctx: CanvasRenderingContext2D,
  bounds: ReturnType<typeof humanBounds>
) {
  const { left, top, width, height } = bounds;
  const p = (x: number, y: number) => [left + width * x, top + height * y] as const;
  ctx.beginPath();
  ctx.moveTo(...p(0.49, 0.035));
  ctx.bezierCurveTo(...p(0.24, 0.005), ...p(0.08, 0.13), ...p(0.09, 0.3));
  ctx.bezierCurveTo(...p(0.085, 0.35), ...p(0.1, 0.39), ...p(0.2, 0.41));
  ctx.bezierCurveTo(...p(0.15, 0.43), ...p(0.085, 0.45), ...p(0.12, 0.48));
  ctx.bezierCurveTo(...p(0.06, 0.49), ...p(0.105, 0.515), ...p(0.19, 0.53));
  ctx.bezierCurveTo(...p(0.12, 0.55), ...p(0.145, 0.575), ...p(0.22, 0.59));
  ctx.bezierCurveTo(...p(0.2, 0.64), ...p(0.245, 0.69), ...p(0.35, 0.72));
  ctx.bezierCurveTo(...p(0.4, 0.75), ...p(0.39, 0.84), ...p(0.36, 0.91));
  ctx.lineTo(...p(0.32, 0.98));
  ctx.bezierCurveTo(...p(0.52, 1.015), ...p(0.76, 0.99), ...p(0.99, 0.98));
  ctx.bezierCurveTo(...p(0.9, 0.85), ...p(0.82, 0.77), ...p(0.78, 0.72));
  ctx.bezierCurveTo(...p(0.92, 0.62), ...p(0.99, 0.46), ...p(0.96, 0.29));
  ctx.bezierCurveTo(...p(0.94, 0.12), ...p(0.8, 0.01), ...p(0.63, 0.035));
  ctx.bezierCurveTo(...p(0.57, 0.02), ...p(0.52, 0.02), ...p(0.49, 0.035));
  ctx.closePath();
}

function drawFace(ctx: CanvasRenderingContext2D, bounds: ReturnType<typeof humanBounds>) {
  const { left, top, width, height } = bounds;
  const p = (x: number, y: number) => [left + width * x, top + height * y] as const;
  ctx.beginPath();
  ctx.moveTo(...p(0.17, 0.405));
  ctx.quadraticCurveTo(...p(0.22, 0.382), ...p(0.28, 0.405));
  ctx.quadraticCurveTo(...p(0.23, 0.423), ...p(0.18, 0.414));
  ctx.moveTo(...p(0.19, 0.411));
  ctx.quadraticCurveTo(...p(0.22, 0.405), ...p(0.25, 0.409));
  ctx.moveTo(...p(0.21, 0.42));
  ctx.quadraticCurveTo(...p(0.17, 0.455), ...p(0.12, 0.47));
  ctx.quadraticCurveTo(...p(0.15, 0.486), ...p(0.2, 0.48));
  ctx.moveTo(...p(0.13, 0.545));
  ctx.quadraticCurveTo(...p(0.19, 0.56), ...p(0.25, 0.548));
  ctx.stroke();
}

function toCanvasPoint(
  bounds: ReturnType<typeof humanBounds>,
  [x, y]: NeuralPoint
) {
  return {
    x: bounds.left + bounds.width * x,
    y: bounds.top + bounds.height * y,
  };
}

function pointAlongRoute(points: readonly NeuralPoint[], progress: number): NeuralPoint {
  const scaled = progress * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const fraction = scaled - index;
  const start = points[index];
  const end = points[index + 1];
  return [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ];
}

function HeroQuantumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

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
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (prefersReduced) draw(0);
    });
    observer.observe(canvas);

    const draw = (time: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = canvas.getBoundingClientRect();
      const bounds = humanBounds(width, height);
      ctx.clearRect(0, 0, width, height);

      const centerX = bounds.left + bounds.width * 0.55;
      const centerY = bounds.top + bounds.height * 0.32;
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bounds.width * 0.85);
      glow.addColorStop(0, "rgba(93, 43, 190, 0.2)");
      glow.addColorStop(0.55, "rgba(44, 52, 116, 0.11)");
      glow.addColorStop(1, "rgba(3, 5, 8, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      traceHumanProfile(ctx, bounds);
      const fill = ctx.createLinearGradient(bounds.left, bounds.top, bounds.left + bounds.width, bounds.top + bounds.height);
      fill.addColorStop(0, "rgba(103, 65, 190, 0.2)");
      fill.addColorStop(0.48, "rgba(39, 39, 91, 0.25)");
      fill.addColorStop(1, "rgba(25, 132, 164, 0.18)");
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.save();
      traceHumanProfile(ctx, bounds);
      ctx.clip();
      ctx.globalCompositeOperation = "screen";

      for (const route of NEURAL_ROUTES) {
        ctx.beginPath();
        route.points.forEach((point, index) => {
          const canvasPoint = toCanvasPoint(bounds, point);
          if (index === 0) ctx.moveTo(canvasPoint.x, canvasPoint.y);
          else ctx.lineTo(canvasPoint.x, canvasPoint.y);
        });
        ctx.strokeStyle = "rgba(151, 133, 255, 0.42)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        for (let index = 1; index < route.points.length - 1; index++) {
          const node = toCanvasPoint(bounds, route.points[index]);
          const radius = 2.5 + Math.sin(time * 0.002 + index) * 0.8;
          const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 5);
          nodeGlow.addColorStop(0, "rgba(211, 198, 255, 0.95)");
          nodeGlow.addColorStop(0.32, "rgba(145, 102, 255, 0.5)");
          nodeGlow.addColorStop(1, "rgba(91, 65, 180, 0)");
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(224, 243, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        const movingProgress = (time * route.speed + route.offset) % 1;
        const pulsePositions = prefersReduced
          ? [0.32, 0.68]
          : [movingProgress, (1 - movingProgress + 1) % 1];
        for (const progress of pulsePositions) {
          const pulse = toCanvasPoint(bounds, pointAlongRoute(route.points, progress));
          const pulseGlow = ctx.createRadialGradient(pulse.x, pulse.y, 0, pulse.x, pulse.y, 18);
          pulseGlow.addColorStop(0, "rgba(228, 244, 255, 0.95)");
          pulseGlow.addColorStop(0.24, "rgba(155, 120, 255, 0.8)");
          pulseGlow.addColorStop(1, "rgba(101, 92, 246, 0)");
          ctx.fillStyle = pulseGlow;
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(235, 248, 255, 0.98)";
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      traceHumanProfile(ctx, bounds);
      const outline = ctx.createLinearGradient(bounds.left, bounds.top, bounds.left + bounds.width, bounds.top + bounds.height);
      outline.addColorStop(0, "rgba(186, 150, 255, 0.5)");
      outline.addColorStop(1, "rgba(79, 205, 255, 0.42)");
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(195, 176, 255, 0.58)";
      ctx.lineWidth = 1.2;
      drawFace(ctx, bounds);

      if (!prefersReduced) rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(109,40,217,0.22),transparent_50%)]" />
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
