"use client";

import { useId } from "react";
import Image from "next/image";
import { ClientOnly } from "@/components/ui/ClientOnly";

const NEURAL_NODES: { x: number; y: number; r: number }[] = [
  { x: 22, y: 28, r: 2.2 },
  { x: 38, y: 18, r: 1.8 },
  { x: 55, y: 24, r: 2.4 },
  { x: 72, y: 32, r: 2 },
  { x: 48, y: 42, r: 2.6 },
  { x: 30, y: 52, r: 1.6 },
  { x: 62, y: 48, r: 2.2 },
  { x: 78, y: 58, r: 1.8 },
  { x: 42, y: 62, r: 2 },
  { x: 58, y: 68, r: 2.4 },
  { x: 26, y: 70, r: 1.6 },
  { x: 68, y: 22, r: 1.4 },
];

const NEURAL_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
  [0, 4],
  [4, 5],
  [4, 6],
  [2, 6],
  [6, 7],
  [4, 8],
  [8, 9],
  [5, 8],
  [5, 10],
  [6, 9],
  [2, 11],
  [11, 3],
];

function NeuralNetworkOverlay({ lineGradId, glowId }: { lineGradId: string; glowId: string }) {
  return (
    <svg
      className="team-globe-neural pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <defs>
        <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.15)" />
          <stop offset="50%" stopColor="rgba(96, 165, 250, 0.85)" />
          <stop offset="100%" stopColor="rgba(129, 140, 248, 0.2)" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
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
            strokeWidth="0.35"
            className="team-globe-neural-line"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        );
      })}
      {NEURAL_NODES.map((node, i) => (
        <g key={`n-${i}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r * 2.2}
            fill="rgba(56, 189, 248, 0.12)"
            className="team-globe-neural-pulse"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="rgba(186, 230, 253, 0.95)"
            filter={`url(#${glowId})`}
            className="team-globe-neural-node"
            style={{ animationDelay: `${i * 0.15}s` }}
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

  const sizeClass = compact
    ? "h-[200px] w-[200px] md:h-[260px] md:w-[260px]"
    : "h-[min(72vw,320px)] w-[min(72vw,320px)] md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px]";

  return (
    <div className={`team-globe-scene relative flex items-center justify-center ${sizeClass}`}>
      <div className="team-globe-aura pointer-events-none absolute inset-[-18%] rounded-full" aria-hidden />
      <div className="team-globe-spin-outer relative h-full w-full">
        <div className="team-globe-sphere relative h-full w-full overflow-hidden rounded-full">
          <Image
            src="/images/team-earth-globe.png"
            alt=""
            fill
            priority={!compact}
            className="object-cover object-center"
            sizes={compact ? "260px" : "(max-width: 768px) 320px, 400px"}
          />
          <div className="team-globe-shade pointer-events-none absolute inset-0 rounded-full" aria-hidden />
          <div className="team-globe-rim pointer-events-none absolute inset-0 rounded-full" aria-hidden />
        </div>
        <div className="team-globe-neural-wrap pointer-events-none absolute inset-[4%]">
          <NeuralNetworkOverlay lineGradId={lineGradId} glowId={glowId} />
        </div>
      </div>
      <div className="team-globe-floor-glow pointer-events-none absolute bottom-[-8%] left-1/2 h-[20%] w-[70%] -translate-x-1/2 rounded-full blur-2xl" aria-hidden />
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
              ? "mx-auto aspect-square w-[200px] rounded-full bg-slate-800/80 md:w-[260px]"
              : "mx-auto aspect-square w-[min(72vw,320px)] rounded-full bg-slate-800/80 md:w-[360px]"
          }
        />
      }
    >
      <GlobeScene compact={compact} />
    </ClientOnly>
  );
}
