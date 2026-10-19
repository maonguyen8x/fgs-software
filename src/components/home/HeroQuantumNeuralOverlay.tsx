"use client";

import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";

type Vec3 = readonly [number, number, number];
type Rgb = readonly [number, number, number];

interface Ring {
  radius: number;
  height: number;
  tiltX: number;
  tiltZ: number;
  spin: number;
  electrons: number;
  hue: Rgb;
}

interface Trace {
  points: Vec3[];
  lengths: number[];
  total: number;
  speed: number;
  offset: number;
}

interface Dust {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
}

interface Orb {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  tilt: number;
}

const FOV = 4.2;
const HALF = 1.1;
const TOP = -0.08;
const BOTTOM = 0.08;
const CORE_HALF = 0.5;
const CORE_TOP = -0.28;

const RINGS: readonly Ring[] = [
  { radius: 1.45, height: -0.85, tiltX: 0.25, tiltZ: 0.18, spin: 0.00042, electrons: 2, hue: [96, 200, 255] },
  { radius: 1.95, height: -0.55, tiltX: -0.3, tiltZ: -0.22, spin: -0.00031, electrons: 3, hue: [160, 130, 255] },
];

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function rotate([x, y, z]: Vec3, rx: number, ry: number, rz: number): Vec3 {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
}

function buildTraces(random: () => number): Trace[] {
  const traces: Trace[] = [];
  const perSide = 7;
  for (let side = 0; side < 4; side++) {
    const angle = (side * Math.PI) / 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    // radial/lateral coordinates are mapped onto the chip's top face for each side
    const map = (radial: number, lateral: number): Vec3 => [radial * c - lateral * s, TOP - 0.004, radial * s + lateral * c];
    for (let i = 0; i < perSide; i++) {
      const lateral = (i - (perSide - 1) / 2) * 0.13;
      const jog = 0.55 + (i % 3) * 0.08;
      const points = [
        map(CORE_HALF, lateral * 0.45),
        map(jog, lateral * 0.45),
        map(jog + 0.14, lateral),
        map(HALF, lateral),
      ];
      const lengths: number[] = [0];
      for (let p = 1; p < points.length; p++) {
        lengths.push(lengths[p - 1] + Math.hypot(points[p][0] - points[p - 1][0], points[p][2] - points[p - 1][2]));
      }
      traces.push({
        points,
        lengths,
        total: lengths[lengths.length - 1],
        speed: 0.00018 + random() * 0.00028,
        offset: random(),
      });
    }
  }
  return traces;
}

function pointOnTrace(trace: Trace, fraction: number): Vec3 {
  const target = fraction * trace.total;
  for (let i = 1; i < trace.points.length; i++) {
    if (target <= trace.lengths[i]) {
      const span = trace.lengths[i] - trace.lengths[i - 1] || 1;
      const f = (target - trace.lengths[i - 1]) / span;
      const a = trace.points[i - 1];
      const b = trace.points[i];
      return [a[0] + (b[0] - a[0]) * f, a[1], a[2] + (b[2] - a[2]) * f];
    }
  }
  return trace.points[trace.points.length - 1];
}

function HeroQuantumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const random = mulberry32(2026);

    const traces = buildTraces(random);
    const dust: Dust[] = Array.from({ length: compact ? 40 : 110 }, () => ({
      x: (random() - 0.5) * 7,
      y: (random() - 0.5) * 4.5,
      z: (random() - 0.5) * 4,
      speed: 0.00004 + random() * 0.00012,
      size: 0.5 + random() * 1.3,
    }));
    const orbs: Orb[] = Array.from({ length: 6 }, (_, i) => ({
      radius: 1.2 + random() * 0.9,
      height: -0.7 - random() * 0.9,
      speed: (0.0005 + random() * 0.0005) * (i % 2 ? 1 : -1),
      phase: (i / 6) * Math.PI * 2,
      tilt: (random() - 0.5) * 0.5,
    }));
    const columns = Array.from({ length: 5 }, (_, i) => ({
      x: (i - 2) * 0.16,
      z: ((i * 37) % 5 - 2) * 0.1,
      width: 0.05 + random() * 0.05,
      phase: random() * 6,
    }));

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const draw = (time: number) => {
      const t = prefersReduced ? 1800 : time;
      ctx.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      const scale = compact ? Math.min(width * 0.2, height * 0.16) : Math.min(width * 0.15, height * 0.26);
      const cx = width * (compact ? 0.5 : 0.72);
      const cy = height * (compact ? 0.3 : 0.52);
      const yaw = 0.6 + Math.sin(t * 0.00035) * 0.55 + pointer.x * 0.45;
      const pitch = 0.82 + Math.sin(t * 0.0005) * 0.05 + pointer.y * 0.14;
      const floatY = Math.sin(t * 0.0012) * 0.06;
      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      const project = (p: Vec3) => {
        const x1 = p[0] * cyaw + p[2] * syaw;
        const z1 = -p[0] * syaw + p[2] * cyaw;
        const y1 = p[1] + floatY;
        const y2 = y1 * cp - z1 * sp;
        const z2 = y1 * sp + z1 * cp;
        const k = FOV / Math.max(1, FOV + z2);
        return { x: cx + x1 * scale * k, y: cy + y2 * scale * k, z: z2, k };
      };

      const glowDot = (x: number, y: number, radius: number, core: string, mid: string, edge: string) => {
        const r = Math.max(0.5, radius);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, core);
        g.addColorStop(0.4, mid);
        g.addColorStop(1, edge);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      const polygon = (pts: { x: number; y: number }[]) => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
      };

      const drawBox = (half: number, yTop: number, yBottom: number, topFill: (pts: { x: number; y: number }[]) => void) => {
        const corners: [number, number][] = [
          [-half, -half],
          [half, -half],
          [half, half],
          [-half, half],
        ];
        const sides = corners.map((a, i) => {
          const b = corners[(i + 1) % 4];
          const quad = [
            project([a[0], yTop, a[1]]),
            project([b[0], yTop, b[1]]),
            project([b[0], yBottom, b[1]]),
            project([a[0], yBottom, a[1]]),
          ];
          const nx = (a[0] + b[0]) / 2 / half;
          const nz = (a[1] + b[1]) / 2 / half;
          const light = Math.max(0, Math.min(1, 0.5 + (nx * cyaw + nz * syaw) * 0.5));
          const depth = quad.reduce((sum, p) => sum + p.z, 0) / 4;
          return { quad, light, depth };
        });
        sides.sort((a, b) => b.depth - a.depth);
        for (const side of sides) {
          polygon(side.quad);
          ctx.fillStyle = `rgb(${14 + side.light * 40}, ${28 + side.light * 70}, ${70 + side.light * 120})`;
          ctx.fill();
          ctx.strokeStyle = "rgba(120, 200, 255, 0.35)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        const top = [
          project([-half, yTop, -half]),
          project([half, yTop, -half]),
          project([half, yTop, half]),
          project([-half, yTop, half]),
        ];
        topFill(top);
      };

      const center = project([0, CORE_TOP, 0]);
      const base = project([0, BOTTOM + 0.5, 0]);

      // Ground glow beneath the floating chip.
      ctx.globalCompositeOperation = "lighter";
      ctx.save();
      ctx.translate(base.x, base.y + scale * 0.2);
      ctx.scale(1, 0.35);
      glowDot(0, 0, scale * 3, "rgba(90, 160, 255, 0.34)", "rgba(110, 90, 255, 0.14)", "rgba(20, 20, 80, 0)");
      ctx.restore();
      glowDot(center.x, center.y, scale * 3.4, "rgba(100, 150, 255, 0.22)", "rgba(120, 90, 240, 0.1)", "rgba(5, 8, 30, 0)");

      // Dust drifting upward for depth.
      for (const d of dust) {
        if (!prefersReduced) {
          d.y -= d.speed * 16;
          if (d.y < -2.4) d.y = 2.4;
        }
        const p = project([d.x, d.y, d.z]);
        const alpha = Math.max(0.05, Math.min(0.8, p.k * 0.45));
        ctx.fillStyle = `rgba(185, 215, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, d.size * p.k), 0, Math.PI * 2);
        ctx.fill();
      }

      // Chip body.
      ctx.globalCompositeOperation = "source-over";
      drawBox(HALF, TOP, BOTTOM, (top) => {
        const g = ctx.createLinearGradient(top[0].x, top[0].y, top[2].x, top[2].y);
        g.addColorStop(0, "#12306e");
        g.addColorStop(0.5, "#0b1c4a");
        g.addColorStop(1, "#1a2b78");
        polygon(top);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(140, 215, 255, 0.85)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "lighter";

      // Gold pins around the substrate with signals running through them.
      const pinCount = compact ? 8 : 14;
      for (let side = 0; side < 4; side++) {
        const angle = (side * Math.PI) / 2;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        for (let i = 0; i < pinCount; i++) {
          const lateral = ((i + 0.5) / pinCount - 0.5) * 2 * (HALF - 0.1);
          const inner = project([HALF * c - lateral * s, 0, HALF * s + lateral * c]);
          const outer = project([(HALF + 0.16) * c - lateral * s, 0, (HALF + 0.16) * s + lateral * c]);
          ctx.strokeStyle = "rgba(255, 205, 120, 0.7)";
          ctx.lineWidth = Math.max(0.6, 1.6 * inner.k);
          ctx.beginPath();
          ctx.moveTo(inner.x, inner.y);
          ctx.lineTo(outer.x, outer.y);
          ctx.stroke();
          const f = (t * 0.0006 + i * 0.13 + side * 0.31) % 1;
          const px = inner.x + (outer.x - inner.x) * f;
          const py = inner.y + (outer.y - inner.y) * f;
          glowDot(px, py, 5 * inner.k, "rgba(255, 240, 200, 0.9)", "rgba(255, 190, 90, 0.4)", "rgba(255, 170, 60, 0)");
        }
      }

      // Circuit traces on the top face.
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(90, 200, 255, 0.5)";
      ctx.beginPath();
      for (const trace of traces) {
        const first = project(trace.points[0]);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < trace.points.length; i++) {
          const p = project(trace.points[i]);
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();

      for (const trace of traces) {
        for (let tail = 0; tail < 6; tail++) {
          const f = ((t * trace.speed + trace.offset) % 1) - tail * 0.018;
          if (f < 0) continue;
          const p = project(pointOnTrace(trace, f));
          const fade = 1 - tail / 6;
          glowDot(p.x, p.y, (6 - tail * 0.7) * p.k, `rgba(230, 250, 255, ${0.95 * fade})`, `rgba(110, 200, 255, ${0.5 * fade})`, "rgba(110, 200, 255, 0)");
        }
      }

      // Pad ring on the substrate.
      const ring = [-0.88, 0.88].flatMap((a) => [-0.88, 0.88].map((b) => [a, b] as const));
      const ringPts = [ring[0], ring[2], ring[3], ring[1]].map(([x, z]) => project([x, TOP - 0.004, z]));
      polygon(ringPts);
      ctx.strokeStyle = "rgba(150, 120, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Raised quantum die.
      ctx.globalCompositeOperation = "source-over";
      drawBox(CORE_HALF, CORE_TOP, TOP, (top) => {
        const pulse = prefersReduced ? 0.7 : 0.7 + Math.sin(t * 0.003) * 0.3;
        const g = ctx.createLinearGradient(top[0].x, top[0].y, top[2].x, top[2].y);
        g.addColorStop(0, `rgba(90, 150, 255, ${0.9})`);
        g.addColorStop(0.5, `rgba(140, 110, 255, ${0.7 + pulse * 0.25})`);
        g.addColorStop(1, "rgba(80, 220, 255, 0.9)");
        polygon(top);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 245, 255, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // qubit lattice etched into the die
        ctx.strokeStyle = "rgba(235, 248, 255, 0.45)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let i = 1; i < 4; i++) {
          const f = i / 4;
          const a = project([-CORE_HALF + f * CORE_HALF * 2, CORE_TOP - 0.003, -CORE_HALF]);
          const b = project([-CORE_HALF + f * CORE_HALF * 2, CORE_TOP - 0.003, CORE_HALF]);
          const c2 = project([-CORE_HALF, CORE_TOP - 0.003, -CORE_HALF + f * CORE_HALF * 2]);
          const d2 = project([CORE_HALF, CORE_TOP - 0.003, -CORE_HALF + f * CORE_HALF * 2]);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.moveTo(c2.x, c2.y);
          ctx.lineTo(d2.x, d2.y);
        }
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "lighter";

      // Light rays sweeping across the chip.
      for (let i = 0; i < 8; i++) {
        const angle = t * (i % 2 ? 0.00022 : -0.00016) + (i / 8) * Math.PI * 2;
        const end = project([Math.cos(angle) * 2.4, CORE_TOP, Math.sin(angle) * 2.4]);
        const g = ctx.createLinearGradient(center.x, center.y, end.x, end.y);
        g.addColorStop(0, "rgba(200, 235, 255, 0.55)");
        g.addColorStop(0.5, "rgba(110, 150, 255, 0.16)");
        g.addColorStop(1, "rgba(90, 100, 255, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      // Vertical light columns streaming out of the die with rising photons.
      for (const col of columns) {
        const flicker = prefersReduced ? 0.8 : 0.65 + Math.sin(t * 0.002 + col.phase) * 0.35;
        const bottomL = project([col.x - col.width, CORE_TOP, col.z]);
        const bottomR = project([col.x + col.width, CORE_TOP, col.z]);
        const topL = project([col.x - col.width * 3, -3.2, col.z]);
        const topR = project([col.x + col.width * 3, -3.2, col.z]);
        const g = ctx.createLinearGradient(bottomL.x, bottomL.y, topL.x, topL.y);
        g.addColorStop(0, `rgba(190, 230, 255, ${0.5 * flicker})`);
        g.addColorStop(0.45, `rgba(120, 140, 255, ${0.16 * flicker})`);
        g.addColorStop(1, "rgba(100, 90, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bottomL.x, bottomL.y);
        ctx.lineTo(bottomR.x, bottomR.y);
        ctx.lineTo(topR.x, topR.y);
        ctx.lineTo(topL.x, topL.y);
        ctx.closePath();
        ctx.fill();
        for (let n = 0; n < 3; n++) {
          const f = ((t * 0.0003 + col.phase * 0.17 + n / 3) % 1);
          const p = project([col.x, CORE_TOP - f * 2.8, col.z]);
          glowDot(p.x, p.y, 6 * p.k * (1 - f), `rgba(240, 250, 255, ${0.9 * (1 - f)})`, `rgba(130, 200, 255, ${0.4 * (1 - f)})`, "rgba(130, 200, 255, 0)");
        }
      }

      // Orbital rings with electrons and trails.
      for (const ringDef of RINGS) {
        const [r, g, b] = ringDef.hue;
        const dir = ringDef.spin > 0 ? 1 : -1;
        const toWorld = (angle: number): Vec3 => {
          const q = rotate([Math.cos(angle) * ringDef.radius, 0, Math.sin(angle) * ringDef.radius], ringDef.tiltX, 0, ringDef.tiltZ);
          return [q[0], q[1] + ringDef.height, q[2]];
        };
        const steps = compact ? 56 : 100;
        let prev = project(toWorld(0));
        for (let s = 1; s <= steps; s++) {
          const cur = project(toWorld((s / steps) * Math.PI * 2));
          const alpha = Math.max(0.06, 0.45 - cur.z * 0.12);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = Math.max(0.5, 0.6 + cur.k * 0.9);
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cur.x, cur.y);
          ctx.stroke();
          prev = cur;
        }
        for (let e = 0; e < ringDef.electrons; e++) {
          const head = t * 0.0011 * dir + (e / ringDef.electrons) * Math.PI * 2;
          for (let trail = 0; trail < 14; trail++) {
            const p = project(toWorld(head - trail * 0.05 * dir));
            const fade = 1 - trail / 14;
            glowDot(
              p.x,
              p.y,
              (4 + p.k * 5) * fade * 2.4,
              `rgba(235, 248, 255, ${0.95 * fade})`,
              `rgba(${r}, ${g}, ${b}, ${0.5 * fade})`,
              `rgba(${r}, ${g}, ${b}, 0)`
            );
          }
        }
      }

      // Entangled qubits floating above the chip.
      const orbPoints = orbs.map((orb) => {
        const a = orb.phase + t * orb.speed;
        const q = rotate([Math.cos(a) * orb.radius, 0, Math.sin(a) * orb.radius], orb.tilt, 0, orb.tilt * 0.6);
        return project([q[0], q[1] + orb.height, q[2]]);
      });
      for (let i = 0; i < orbPoints.length; i++) {
        const a = orbPoints[i];
        const b = orbPoints[(i + 2) % orbPoints.length];
        const link = prefersReduced ? 0.4 : Math.max(0, Math.sin(t * 0.002 + i * 1.3)) * 0.6;
        ctx.strokeStyle = `rgba(170, 150, 255, ${0.08 + link * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (const p of orbPoints) {
        glowDot(p.x, p.y, 14 * p.k, "rgba(245, 250, 255, 0.95)", "rgba(150, 140, 255, 0.5)", "rgba(110, 90, 255, 0)");
      }

      // Pulsing core flare.
      const pulse = prefersReduced ? 1 : 1 + Math.sin(t * 0.002) * 0.14;
      glowDot(center.x, center.y, scale * 0.9 * pulse, "rgba(255, 255, 255, 0.95)", "rgba(160, 215, 255, 0.4)", "rgba(100, 90, 240, 0)");
      const streak = ctx.createLinearGradient(center.x - scale * 2.6, center.y, center.x + scale * 2.6, center.y);
      streak.addColorStop(0, "rgba(120, 180, 255, 0)");
      streak.addColorStop(0.5, `rgba(210, 235, 255, ${0.42 * pulse})`);
      streak.addColorStop(1, "rgba(120, 180, 255, 0)");
      ctx.fillStyle = streak;
      ctx.fillRect(center.x - scale * 2.6, center.y - 1, scale * 5.2, 2);

      ctx.globalCompositeOperation = "source-over";
      if (!prefersReduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-quantum-canvas absolute inset-0 h-full w-full" aria-hidden />;
}

function OverlayFallback() {
  return (
    <div className="hero-quantum-fallback pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(80,130,255,0.28),transparent_55%)]" />
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
