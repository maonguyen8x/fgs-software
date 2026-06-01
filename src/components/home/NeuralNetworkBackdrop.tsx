"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
}

interface Edge {
  from: number;
  to: number;
}

function buildGraph(seed: number): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2 + seed * 0.3;
    const radius = 28 + (i % 5) * 7 + ((i * 17) % 11);
    return {
      id: i,
      x: 50 + Math.cos(angle) * radius * 0.9 + ((i * 13) % 7) - 3,
      y: 50 + Math.sin(angle) * radius * 0.75 + ((i * 7) % 9) - 4,
      r: 1.4 + (i % 3) * 0.55,
      delay: (i % 8) * 0.18,
    };
  });

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 22) edges.push({ from: i, to: j });
    }
  }
  return { nodes, edges };
}

export function NeuralNetworkBackdrop({ className = "" }: { className?: string }) {
  const { nodes, edges } = useMemo(() => buildGraph(1.2), []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-primary-400/20 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-[60%] w-[60%] rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />

      <motion.svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-70"
        initial={false}
        animate={{ rotate: [0, 1.5, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="neural-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="rgb(34 211 238)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="neural-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(96 165 250)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {edges.map((edge, i) => {
          const a = nodes[edge.from];
          const b = nodes[edge.to];
          return (
            <motion.line
              key={`e-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#neural-line)"
              strokeWidth="0.35"
              initial={false}
              animate={{ opacity: [0.25, 0.65, 0.25] }}
              transition={{
                duration: 3.5 + (i % 5) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 7) * 0.2,
              }}
            />
          );
        })}

        {nodes.map((node) => (
          <motion.g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r * 2.2}
              fill="url(#neural-glow)"
              initial={false}
              animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.9, 1.15, 0.9] }}
              transition={{
                duration: 4 + node.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay,
              }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="rgb(147 197 253)"
              initial={false}
              animate={{
                opacity: [0.5, 1, 0.5],
                cy: [node.y - 0.4, node.y + 0.4, node.y - 0.4],
              }}
              transition={{
                duration: 5 + node.delay * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay,
              }}
            />
          </motion.g>
        ))}
      </motion.svg>

      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_88%)]"
        style={{ backgroundColor: "transparent" }}
      />
    </div>
  );
}
