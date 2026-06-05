"use client";

import { useId } from "react";
import Image from "next/image";
import { ClientOnly } from "@/components/ui/ClientOnly";

const NEURAL_NODES: { x: number; y: number; r: number }[] = [
  { x: 18, y: 32, r: 2 },
  { x: 32, y: 16, r: 1.8 },
  { x: 50, y: 14, r: 2.2 },
  { x: 68, y: 20, r: 2 },
  { x: 82, y: 34, r: 1.6 },
  { x: 14, y: 52, r: 1.8 },
  { x: 28, y: 44, r: 2.4 },
  { x: 44, y: 38, r: 2.6 },
  { x: 58, y: 42, r: 2.2 },
  { x: 72, y: 48, r: 2 },
  { x: 86, y: 58, r: 1.6 },
  { x: 22, y: 68, r: 2 },
  { x: 38, y: 62, r: 2.2 },
  { x: 54, y: 58, r: 2.4 },
  { x: 70, y: 64, r: 2 },
  { x: 48, y: 72, r: 2.6 },
  { x: 32, y: 78, r: 1.8 },
  { x: 62, y: 76, r: 2 },
];

const NEURAL_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [2, 8], [7, 13], [13, 14], [14, 15], [15, 16], [5, 6], [5, 12], [12, 13],
  [11, 12], [11, 16], [1, 7], [3, 9], [4, 10], [8, 13], [8, 14], [14, 17], [17, 16],
];

const ORBIT_PATHS = [
  "M 8 50 A 42 18 0 1 1 92 50",
  "M 12 50 A 38 28 0 0 1 88 50",
  "M 50 8 A 18 42 0 1 1 50 92",
  "M 50 12 A 28 38 0 0 1 50 88",
];

function NeuralNetworkOverlay({
  lineGradId,
  glowId,
  className,
}: {
  lineGradId: string;
  glowId: string;
  className?: string;
}) {
  return (
    <svg
      className={className ?? "team-globe-neural pointer-events-none absolute inset-0 h-full w-full"}
      viewBox="0 0 100 100"
      aria-hidden
    >
      <defs>
        <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
          <stop offset="45%" stopColor="rgba(96, 165, 250, 0.95)" />
          <stop offset="100%" stopColor="rgba(129, 140, 248, 0.35)" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {ORBIT_PATHS.map((d, i) => (
        <path
          key={`orbit-${i}`}
          d={d}
          fill="none"
          stroke={`url(#${lineGradId})`}
          strokeWidth="0.28"
          strokeDasharray="3 5"
          className="team-globe-neural-orbit"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
      {NEURAL_EDGES.map(([a, b], i) => {
        const n1 = NEURAL_NODES[a];
        const n2 = NEURAL_NODES[b];
        return (
          <line
            key={`e-${i}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke={`url(#${lineGradId})`}
            strokeWidth="0.4"
            className="team-globe-neural-line"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        );
      })}
      {NEURAL_NODES.map((node, i) => (
        <g key={`n-${i}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r * 2.4}
            fill="rgba(56, 189, 248, 0.14)"
            className="team-globe-neural-pulse"
            style={{ animationDelay: `${i * 0.14}s` }}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="rgba(186, 230, 253, 0.98)"
            filter={`url(#${glowId})`}
            className="team-globe-neural-node"
            style={{ animationDelay: `${i * 0.11}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

function GlobeScene({ compact }: { compact?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const lineGradId = `earth-neural-line-${uid}`;
  const glowId = `earth-neural-glow-${uid}`;
  const cageGradId = `earth-neural-cage-${uid}`;

  const sizeClass = compact
    ? "h-[200px] w-[200px] md:h-[260px] md:w-[260px]"
    : "h-[min(72vw,320px)] w-[min(72vw,320px)] md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px]";

  return (
    <div className={`team-globe-scene relative flex items-center justify-center ${sizeClass}`}>
      <div className="team-globe-aura pointer-events-none absolute inset-[-22%] rounded-full" aria-hidden />

      <div className="team-globe-neural-cage pointer-events-none absolute inset-[-8%] z-30">
        <NeuralNetworkOverlay
          lineGradId={cageGradId}
          glowId={glowId}
          className="team-globe-neural-cage-svg h-full w-full"
        />
      </div>

      <div className="team-globe-spin-outer relative z-10 h-full w-full">
        <div className="team-globe-sphere relative h-full w-full rounded-full bg-transparent">
          <Image
            src="/images/team-earth-globe.png"
            alt=""
            fill
            priority={!compact}
            className="team-globe-earth-img object-contain object-center"
            sizes={compact ? "260px" : "(max-width: 768px) 320px, 400px"}
          />
          <div className="team-globe-rim pointer-events-none absolute inset-0 rounded-full" aria-hidden />
        </div>
        <div className="team-globe-neural-wrap pointer-events-none absolute inset-[-6%] z-20">
          <NeuralNetworkOverlay lineGradId={lineGradId} glowId={`${glowId}-inner`} />
        </div>
      </div>

      <div className="team-globe-floor-glow pointer-events-none absolute bottom-[-8%] left-1/2 z-0 h-[20%] w-[70%] -translate-x-1/2 rounded-full blur-2xl" aria-hidden />
    </div>
  );
}

interface EarthGlobeNeuralProps {
  compact?: boolean;
}

export function EarthGlobeNeural({ compact = false }: EarthGlobeNeuralProps) {
  return (
    <ClientOnly
      fallback={
        <div
          className={
            compact
              ? "mx-auto aspect-square w-[200px] rounded-full bg-primary-50/30 md:w-[260px]"
              : "mx-auto aspect-square w-[min(72vw,320px)] rounded-full bg-primary-50/30 md:w-[360px]"
          }
        />
      }
    >
      <GlobeScene compact={compact} />
    </ClientOnly>
  );
}
