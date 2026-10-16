"use client";

import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";

type NeuralPoint = readonly [number, number];

interface NeuralRoute {
  points: readonly NeuralPoint[];
  speed: number;
  offset: number;
}

interface HumanBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface NeuralGraph {
  count: number;
  u: Float32Array;
  v: Float32Array;
  depth: Float32Array;
  phase: Float32Array;
  shade: Uint8Array;
  edges: Uint32Array;
  edgeShade: Uint8Array;
  adjacency: number[][];
}

interface GraphPulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

// Long pulses that sweep from the nose across the crown and down the neck.
const NEURAL_ROUTES: readonly NeuralRoute[] = [
  {
    points: [[0.07, 0.44], [0.16, 0.4], [0.24, 0.35], [0.32, 0.26], [0.4, 0.17], [0.55, 0.11], [0.72, 0.14], [0.88, 0.26]],
    speed: 0.000095,
    offset: 0.13,
  },
  {
    points: [[0.14, 0.4], [0.2, 0.32], [0.25, 0.22], [0.36, 0.14], [0.51, 0.08], [0.68, 0.11]],
    speed: 0.00011,
    offset: 0.42,
  },
  {
    points: [[0.2, 0.4], [0.32, 0.36], [0.45, 0.31], [0.58, 0.38], [0.65, 0.56], [0.59, 0.72], [0.52, 0.96]],
    speed: 0.0001,
    offset: 0.71,
  },
  {
    points: [[0.08, 0.45], [0.13, 0.5], [0.25, 0.53], [0.38, 0.59], [0.46, 0.69], [0.49, 0.83], [0.48, 0.98]],
    speed: 0.00012,
    offset: 0.24,
  },
  {
    points: [[0.34, 0.25], [0.48, 0.28], [0.63, 0.33], [0.78, 0.3], [0.88, 0.26]],
    speed: 0.000085,
    offset: 0.56,
  },
  {
    points: [[0.28, 0.35], [0.39, 0.4], [0.47, 0.49], [0.5, 0.62], [0.55, 0.75], [0.68, 0.91]],
    speed: 0.000095,
    offset: 0.83,
  },
  {
    points: [[0.42, 0.12], [0.51, 0.22], [0.54, 0.34], [0.54, 0.49], [0.53, 0.63], [0.51, 0.82], [0.5, 0.98]],
    speed: 0.000105,
    offset: 0.31,
  },
];

// Electric blue at the crown and back, violet in the middle, soft purple-pink around the face.
const SHADES = [
  [79, 140, 255],
  [96, 120, 255],
  [112, 104, 255],
  [124, 92, 255],
  [152, 108, 255],
  [176, 124, 255],
] as const;

function humanBounds(width: number, height: number): HumanBounds {
  const figureHeight = height * 1.08;
  const figureWidth = Math.min(width * 0.62, figureHeight * 0.82);
  return {
    left: width * 0.42,
    top: -height * 0.025,
    width: figureWidth,
    height: figureHeight,
  };
}

function traceHumanProfile(ctx: CanvasRenderingContext2D, bounds: HumanBounds) {
  const { left, top, width, height } = bounds;
  const p = (x: number, y: number) => [left + width * x, top + height * y] as const;
  ctx.beginPath();
  ctx.moveTo(...p(0.49, 0.035));
  ctx.bezierCurveTo(...p(0.24, 0.005), ...p(0.08, 0.13), ...p(0.09, 0.3));
  ctx.bezierCurveTo(...p(0.095, 0.34), ...p(0.12, 0.375), ...p(0.075, 0.4));
  ctx.bezierCurveTo(...p(0.045, 0.415), ...p(0.015, 0.425), ...p(0.035, 0.44));
  ctx.bezierCurveTo(...p(0.05, 0.45), ...p(0.105, 0.448), ...p(0.13, 0.46));
  ctx.bezierCurveTo(...p(0.1, 0.47), ...p(0.075, 0.477), ...p(0.095, 0.49));
  ctx.bezierCurveTo(...p(0.11, 0.495), ...p(0.15, 0.485), ...p(0.145, 0.5));
  ctx.bezierCurveTo(...p(0.14, 0.515), ...p(0.085, 0.51), ...p(0.095, 0.53));
  ctx.bezierCurveTo(...p(0.11, 0.56), ...p(0.17, 0.57), ...p(0.22, 0.6));
  ctx.bezierCurveTo(...p(0.2, 0.65), ...p(0.245, 0.69), ...p(0.35, 0.72));
  ctx.bezierCurveTo(...p(0.4, 0.75), ...p(0.39, 0.84), ...p(0.36, 0.91));
  ctx.lineTo(...p(0.32, 0.98));
  ctx.bezierCurveTo(...p(0.52, 1.015), ...p(0.76, 0.99), ...p(0.99, 0.98));
  ctx.bezierCurveTo(...p(0.9, 0.85), ...p(0.82, 0.77), ...p(0.78, 0.72));
  ctx.bezierCurveTo(...p(0.92, 0.62), ...p(0.99, 0.46), ...p(0.96, 0.29));
  ctx.bezierCurveTo(...p(0.94, 0.12), ...p(0.8, 0.01), ...p(0.63, 0.035));
  ctx.bezierCurveTo(...p(0.57, 0.02), ...p(0.52, 0.02), ...p(0.49, 0.035));
  ctx.closePath();
}

function drawFace(ctx: CanvasRenderingContext2D, bounds: HumanBounds) {
  const { left, top, width, height } = bounds;
  const p = (x: number, y: number) => [left + width * x, top + height * y] as const;
  ctx.beginPath();
  ctx.moveTo(...p(0.12, 0.37));
  ctx.quadraticCurveTo(...p(0.2, 0.345), ...p(0.28, 0.378));
  ctx.moveTo(...p(0.14, 0.39));
  ctx.quadraticCurveTo(...p(0.205, 0.37), ...p(0.265, 0.39));
  ctx.quadraticCurveTo(...p(0.215, 0.416), ...p(0.15, 0.399));
  ctx.moveTo(...p(0.16, 0.405));
  ctx.quadraticCurveTo(...p(0.125, 0.432), ...p(0.09, 0.443));
  ctx.quadraticCurveTo(...p(0.12, 0.454), ...p(0.155, 0.458));
  ctx.moveTo(...p(0.11, 0.468));
  ctx.quadraticCurveTo(...p(0.155, 0.477), ...p(0.205, 0.468));
  ctx.quadraticCurveTo(...p(0.17, 0.49), ...p(0.12, 0.48));
  ctx.stroke();

  ctx.fillStyle = "rgba(240, 232, 255, 0.95)";
  ctx.beginPath();
  ctx.arc(...p(0.211, 0.393), width * 0.004, 0, Math.PI * 2);
  ctx.fill();
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

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shadeIndex(u: number, v: number) {
  const value = (1 - u) * 0.68 + (v - 0.15) * 0.32;
  return Math.max(0, Math.min(SHADES.length - 1, Math.round(value * (SHADES.length - 0.01))));
}

// Scatters nodes inside the profile and joins close neighbours into a low-poly constellation.
function buildGraph(ctx: CanvasRenderingContext2D, target: number): NeuralGraph {
  const size = 1000;
  const random = createRandom(20260424);
  const minDistance = target > 600 ? 0.021 : 0.03;
  const coords: number[] = [];

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  traceHumanProfile(ctx, { left: 0, top: 0, width: size, height: size });

  const accept = (u: number, v: number, spacing: number) => {
    if (!ctx.isPointInPath(u * size, v * size)) return false;
    for (let index = 0; index < coords.length; index += 2) {
      const du = coords[index] - u;
      const dv = coords[index + 1] - v;
      if (du * du + dv * dv < spacing * spacing) return false;
    }
    coords.push(u, v);
    return true;
  };

  let attempts = 0;
  while (coords.length / 2 < target && attempts < target * 40) {
    attempts++;
    accept(random(), random(), minDistance);
  }

  // The face needs a denser mesh so eyes, nose and lips read clearly.
  const faceTarget = coords.length / 2 + Math.round(target * 0.16);
  attempts = 0;
  while (coords.length / 2 < faceTarget && attempts < 4000) {
    attempts++;
    accept(0.03 + random() * 0.33, 0.28 + random() * 0.3, minDistance * 0.72);
  }
  ctx.restore();

  const count = coords.length / 2;
  const u = new Float32Array(count);
  const v = new Float32Array(count);
  const depth = new Float32Array(count);
  const phase = new Float32Array(count);
  const shade = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    u[index] = coords[index * 2];
    v[index] = coords[index * 2 + 1];
    depth[index] = random();
    phase[index] = random() * Math.PI * 2;
    shade[index] = shadeIndex(u[index], v[index]);
  }

  const maxDistance = minDistance * 2.2;
  const edgeKeys = new Set<number>();
  const edgeList: number[] = [];
  const adjacency: number[][] = Array.from({ length: count }, () => []);

  for (let a = 0; a < count; a++) {
    const candidates: { index: number; distance: number }[] = [];
    for (let b = 0; b < count; b++) {
      if (a === b) continue;
      const du = u[a] - u[b];
      const dv = v[a] - v[b];
      const distance = Math.sqrt(du * du + dv * dv);
      if (distance <= maxDistance) candidates.push({ index: b, distance });
    }
    candidates.sort((left, right) => left.distance - right.distance);
    for (const candidate of candidates.slice(0, 4)) {
      const low = Math.min(a, candidate.index);
      const high = Math.max(a, candidate.index);
      const key = low * count + high;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edgeList.push(low, high);
      adjacency[low].push(high);
      adjacency[high].push(low);
    }
  }

  const edges = Uint32Array.from(edgeList);
  const edgeShade = new Uint8Array(edges.length / 2);
  for (let index = 0; index < edgeShade.length; index++) {
    edgeShade[index] = Math.round((shade[edges[index * 2]] + shade[edges[index * 2 + 1]]) / 2);
  }

  return { count, u, v, depth, phase, shade, edges, edgeShade, adjacency };
}

function HeroQuantumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.innerWidth < 768;
    const graph = buildGraph(ctx, compact ? 380 : 900);
    const random = createRandom(7);

    const pulses: GraphPulse[] = Array.from({ length: compact ? 16 : 40 }, () => {
      const from = Math.floor(random() * graph.count);
      const neighbours = graph.adjacency[from];
      return {
        from,
        to: neighbours.length ? neighbours[Math.floor(random() * neighbours.length)] : from,
        progress: random(),
        speed: 0.0006 + random() * 0.0007,
      };
    });
    const particles: FloatingParticle[] = Array.from({ length: compact ? 26 : 70 }, () => ({
      x: random(),
      y: random(),
      vx: (random() - 0.5) * 0.00002,
      vy: -0.00001 - random() * 0.00002,
      radius: 0.6 + random() * 1.6,
      alpha: 0.15 + random() * 0.4,
    }));
    const twinkleNodes = Array.from({ length: compact ? 24 : 70 }, (_, index) =>
      Math.floor(((index + 0.5) / (compact ? 24 : 70)) * graph.count)
    );
    const positionsX = new Float32Array(graph.count);
    const positionsY = new Float32Array(graph.count);
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let raf = 0;
    let previous = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointer = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const draw = (time: number) => {
      const delta = previous ? Math.min(time - previous, 64) : 16;
      previous = time;
      const { width, height } = canvas.getBoundingClientRect();
      const bounds = humanBounds(width, height);
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;
      const shiftX = pointer.x * 20;
      const shiftY = pointer.y * 12;

      ctx.globalCompositeOperation = "source-over";
      const centerX = bounds.left + bounds.width * 0.55 + shiftX * 0.5;
      const centerY = bounds.top + bounds.height * 0.34 + shiftY * 0.5;
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bounds.width * 0.95);
      glow.addColorStop(0, "rgba(124, 92, 255, 0.3)");
      glow.addColorStop(0.5, "rgba(66, 72, 190, 0.14)");
      glow.addColorStop(1, "rgba(5, 6, 15, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (const particle of particles) {
        if (!prefersReduced) {
          particle.x = (particle.x + particle.vx * delta + 1) % 1;
          particle.y = (particle.y + particle.vy * delta + 1) % 1;
        }
        ctx.fillStyle = `rgba(190, 200, 255, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x * width + shiftX * -0.3, particle.y * height, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let index = 0; index < graph.count; index++) {
        const drift = prefersReduced ? 0 : 1;
        const parallax = 0.35 + graph.depth[index] * 0.9;
        const wobbleX = Math.sin(time * 0.0006 + graph.phase[index]) * 0.0045 * drift;
        const wobbleY = Math.cos(time * 0.0005 + graph.phase[index] * 1.3) * 0.0045 * drift;
        positionsX[index] = bounds.left + bounds.width * (graph.u[index] + wobbleX) + shiftX * parallax;
        positionsY[index] = bounds.top + bounds.height * (graph.v[index] + wobbleY) + shiftY * parallax;
      }

      // Faint silhouette keeps the head readable while the nodes do the real work.
      ctx.save();
      ctx.translate(shiftX * 0.65, shiftY * 0.65);
      traceHumanProfile(ctx, bounds);
      const body = ctx.createLinearGradient(bounds.left + bounds.width, bounds.top, bounds.left, bounds.top + bounds.height);
      body.addColorStop(0, "rgba(79, 140, 255, 0.1)");
      body.addColorStop(0.5, "rgba(124, 92, 255, 0.1)");
      body.addColorStop(1, "rgba(176, 124, 255, 0.14)");
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(160, 140, 255, 0.34)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 0.7;
      for (let shade = 0; shade < SHADES.length; shade++) {
        const [r, g, b] = SHADES[shade];
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.38)`;
        ctx.beginPath();
        for (let edge = 0; edge < graph.edgeShade.length; edge++) {
          if (graph.edgeShade[edge] !== shade) continue;
          const a = graph.edges[edge * 2];
          const b2 = graph.edges[edge * 2 + 1];
          ctx.moveTo(positionsX[a], positionsY[a]);
          ctx.lineTo(positionsX[b2], positionsY[b2]);
        }
        ctx.stroke();
      }

      for (let shade = 0; shade < SHADES.length; shade++) {
        const [r, g] = SHADES[shade];
        ctx.fillStyle = `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, 255, 0.85)`;
        ctx.beginPath();
        for (let index = 0; index < graph.count; index++) {
          if (graph.shade[index] !== shade) continue;
          const radius = 0.7 + graph.depth[index] * 0.9;
          ctx.moveTo(positionsX[index] + radius, positionsY[index]);
          ctx.arc(positionsX[index], positionsY[index], radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      for (let index = 0; index < twinkleNodes.length; index++) {
        const node = twinkleNodes[index];
        const flicker = prefersReduced ? 0.6 : Math.pow(Math.max(0, Math.sin(time * 0.0026 + graph.phase[node] * 3)), 3);
        if (flicker < 0.04) continue;
        const [r, g, b] = SHADES[graph.shade[node]];
        const radius = 4 + flicker * 7;
        const halo = ctx.createRadialGradient(positionsX[node], positionsY[node], 0, positionsX[node], positionsY[node], radius);
        halo.addColorStop(0, `rgba(215, 228, 255, ${0.8 * flicker})`);
        halo.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${0.4 * flicker})`);
        halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(positionsX[node], positionsY[node], radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulses hop from node to node along the connecting lines, like neurons firing.
      for (const pulse of pulses) {
        if (!prefersReduced) {
          pulse.progress += pulse.speed * delta;
          if (pulse.progress >= 1) {
            const neighbours = graph.adjacency[pulse.to];
            const options = neighbours.filter((neighbour) => neighbour !== pulse.from);
            const pool = options.length ? options : neighbours;
            pulse.from = pulse.to;
            pulse.to = pool.length ? pool[Math.floor(Math.random() * pool.length)] : pulse.to;
            pulse.progress = 0;
          }
        }
        const x = positionsX[pulse.from] + (positionsX[pulse.to] - positionsX[pulse.from]) * pulse.progress;
        const y = positionsY[pulse.from] + (positionsY[pulse.to] - positionsY[pulse.from]) * pulse.progress;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 13);
        halo.addColorStop(0, "rgba(240, 248, 255, 0.95)");
        halo.addColorStop(0.3, "rgba(150, 130, 255, 0.6)");
        halo.addColorStop(1, "rgba(110, 90, 255, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const route of NEURAL_ROUTES) {
        const movingProgress = (time * route.speed + route.offset) % 1;
        const pulsePositions = prefersReduced ? [0.32, 0.68] : [movingProgress, (1 - movingProgress + 1) % 1];
        for (const progress of pulsePositions) {
          const tail = [0.05, 0.035, 0.018, 0];
          tail.forEach((lag, step) => {
            const along = Math.max(0, Math.min(1, progress - lag * (progress === movingProgress ? 1 : -1)));
            const [u, v] = pointAlongRoute(route.points, along);
            const x = bounds.left + bounds.width * u + shiftX * 0.65;
            const y = bounds.top + bounds.height * v + shiftY * 0.65;
            const size = 3 + step * 3;
            const halo = ctx.createRadialGradient(x, y, 0, x, y, size * 2.4);
            halo.addColorStop(0, `rgba(205, 216, 255, ${0.2 + step * 0.16})`);
            halo.addColorStop(1, "rgba(140, 110, 255, 0)");
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(x, y, size * 2.4, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.save();
      ctx.translate(shiftX * 0.65, shiftY * 0.65);
      ctx.strokeStyle = "rgba(226, 196, 255, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(176, 124, 255, 0.75)";
      ctx.shadowBlur = 10;
      drawFace(ctx, bounds);
      ctx.restore();

      if (!prefersReduced) raf = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (prefersReduced) draw(0);
    });
    observer.observe(canvas);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-quantum-canvas absolute inset-0 h-full w-full" aria-hidden />;
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
