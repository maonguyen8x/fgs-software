"use client";

import { useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ClientOnly } from "@/components/ui/ClientOnly";

function HeroVisualFallback() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg"
      aria-hidden
    />
  );
}

// Generate neuron network nodes with fixed positions for smooth rendering
function generateNeuronNodes(seed: number) {
  const nodes = [];
  const nodeCount = 12;
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 30 + Math.sin(i * 0.7) * 15;
    nodes.push({
      id: i,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      size: 2 + (i % 3) * 1.5,
      delay: (i * 0.1) % 2,
    });
  }
  
  // Add center core nodes
  nodes.push({ id: 100, x: 50, y: 50, size: 3, delay: 0 });
  nodes.push({ id: 101, x: 50, y: 35, size: 2.5, delay: 0.3 });
  nodes.push({ id: 102, x: 65, y: 50, size: 2.5, delay: 0.6 });
  
  return nodes;
}

function HeroVisualScene() {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);

  const nodes = useMemo(() => generateNeuronNodes(1), []);
  
  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const conns: Array<{ from: number; to: number; distance: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40 && distance > 5) {
          conns.push({ from: i, to: j, distance });
        }
      }
    }
    return conns;
  }, [nodes]);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
      style={{ perspective: "1200px" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="relative aspect-square"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Neuron network SVG - connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ transform: "translateZ(30px)" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines */}
          {connections.map((conn, idx) => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            const opacity = 0.3 + (1 - conn.distance / 40) * 0.4;
            
            return (
              <motion.line
                key={`conn-${idx}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#neuronGradient)"
                strokeWidth="0.4"
                opacity={opacity}
                initial={{ opacity: 0 }}
                animate={{ opacity }}
                transition={{ duration: 0.6, delay: idx * 0.02 }}
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="neuronGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.4)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Neuron nodes - floating particles */}
        {nodes.map((node, i) => (
          <motion.div
            key={`node-${i}`}
            className="absolute rounded-full bg-primary-400"
            style={{
              width: `${node.size}%`,
              height: `${node.size}%`,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%) translateZ(40px)",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)",
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + (i % 4) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: node.delay,
            }}
          />
        ))}

        {/* Core center pulsing element */}
        <motion.div
          className="absolute inset-1/3 rounded-full"
          style={{
            transform: "translateZ(50px)",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)",
            boxShadow: "inset 0 0 30px rgba(59, 130, 246, 0.2), 0 0 30px rgba(59, 130, 246, 0.2)",
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating light orbs for depth */}
        {[
          { delay: 0, x: 20, y: 30 },
          { delay: 0.5, x: 75, y: 25 },
          { delay: 1, x: 25, y: 70 },
          { delay: 1.5, x: 70, y: 65 },
        ].map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-1 h-1 rounded-full bg-cyan-400"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              transform: "translate(-50%, -50%) translateZ(35px)",
              boxShadow: "0 0 8px rgba(34, 211, 238, 0.6)",
            }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: orb.delay,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function HomeHeroVisual() {
  return (
    <ClientOnly fallback={<HeroVisualFallback />}>
      <HeroVisualScene />
    </ClientOnly>
  );
}

