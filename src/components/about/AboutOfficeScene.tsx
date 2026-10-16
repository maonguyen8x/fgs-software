import type { CSSProperties } from "react";

const SKIN = ["#f2c6a0", "#d9a073", "#b97a52", "#8d5a3b"] as const;
const CLOTHES = ["#7c5cff", "#38bdf8", "#f472b6", "#34d399", "#fbbf24"] as const;

function Plant({
  x,
  y,
  scale = 1,
  delay = 0,
  pot = "#a4573a",
  leaf = "#22c55e",
  dark = "#15803d",
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
  pot?: string;
  leaf?: string;
  dark?: string;
}) {
  const angles = [-62, -38, -16, 0, 16, 38, 62];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="office-sway" style={{ animationDelay: `${delay}s` }}>
        {angles.map((angle, index) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <ellipse cx="0" cy={-36 - (index % 3) * 8} rx="8.5" ry={26 + (index % 3) * 6} fill={index % 2 ? leaf : dark} />
            <path d={`M0 -6 L0 ${-52 - (index % 3) * 10}`} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          </g>
        ))}
      </g>
      <path d="M-17 0 L17 0 L12 28 L-12 28 Z" fill={pot} />
      <rect x="-18" y="-3" width="36" height="6" rx="3" fill={pot} />
    </g>
  );
}

function HangingPlant({ x, delay = 0 }: { x: number; delay?: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g className="office-swing" style={{ animationDelay: `${delay}s` }}>
        <line x1="0" y1="0" x2="0" y2="62" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M-14 62 L14 62 L10 82 L-10 82 Z" fill="#e2e8f0" opacity="0.9" />
        {[-26, -14, 0, 14, 26].map((offset, index) => (
          <path
            key={offset}
            d={`M${offset * 0.3} 80 Q ${offset * 1.1} ${96 + index * 6} ${offset * 0.8} ${112 + (index % 2) * 18}`}
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>
    </g>
  );
}

function Lamp({ x, delay = 0 }: { x: number; delay?: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g className="office-swing office-swing--slow" style={{ animationDelay: `${delay}s` }}>
        <line x1="0" y1="0" x2="0" y2="44" stroke="#64748b" strokeWidth="1.5" />
        <path d="M-22 70 L-9 44 L9 44 L22 70 Z" fill="#fbbf24" />
        <ellipse cx="0" cy="72" rx="34" ry="30" fill="url(#office-lamp-glow)" className="office-lamp-glow" />
      </g>
    </g>
  );
}

function Person({
  x,
  y,
  tone,
  clothes,
  delay = 0,
  laptop = true,
}: {
  x: number;
  y: number;
  tone: number;
  clothes: number;
  delay?: number;
  laptop?: boolean;
}) {
  const skin = SKIN[tone % SKIN.length];
  const shirt = CLOTHES[clothes % CLOTHES.length];
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="office-bob" style={{ animationDelay: `${delay}s` }}>
        <rect x="-21" y="-30" width="42" height="52" rx="17" fill={shirt} />
        <rect x="-5" y="-34" width="10" height="9" rx="4" fill={skin} />
        <circle cx="0" cy="-48" r="14" fill={skin} />
        <path d="M-15 -50 Q-14 -66 0 -65 Q15 -66 15 -50 Q9 -58 0 -57 Q-9 -58 -15 -50 Z" fill="#1e1b2e" />
        <circle cx="-5" cy="-47" r="1.6" fill="#1e1b2e" />
        <circle cx="5" cy="-47" r="1.6" fill="#1e1b2e" />
        <path d="M-5 -41 Q0 -37 5 -41" stroke="#7a3b2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
      {laptop ? (
        <g transform="translate(-26 4)">
          <rect x="0" y="0" width="52" height="34" rx="4" fill="#cbd5e1" />
          <rect x="0" y="0" width="52" height="34" rx="4" fill="url(#office-lid)" />
          <circle cx="26" cy="17" r="3.2" fill="#fff" opacity="0.8" className="office-lid-logo" />
        </g>
      ) : null}
    </g>
  );
}

function Monitor({ x, y, width = 92, height = 58, seed = 0 }: { x: number; y: number; width?: number; height?: number; seed?: number }) {
  const colors = ["#34d399", "#a78bfa", "#38bdf8", "#f472b6", "#fbbf24"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={width / 2 - 4} y={height} width="8" height="16" fill="#475569" />
      <rect x={width / 2 - 20} y={height + 14} width="40" height="5" rx="2.5" fill="#64748b" />
      <rect x="0" y="0" width={width} height={height} rx="5" fill="#0b1220" stroke="#475569" strokeWidth="2" />
      <rect x="5" y="5" width={width - 10} height={height - 10} rx="2" fill="url(#office-screen)" />
      {Array.from({ length: 6 }, (_, index) => (
        <rect
          key={index}
          className="office-code"
          x={11 + (index % 3) * 6}
          y={11 + index * 7.2}
          width={14 + ((index * 13 + seed * 7) % 34)}
          height="3.4"
          rx="1.7"
          fill={colors[(index + seed) % colors.length]}
          style={{ animationDelay: `${(index * 0.35 + seed * 0.6).toFixed(2)}s` } as CSSProperties}
        />
      ))}
      <rect className="office-cursor" x={width - 22} y={height - 17} width="2.4" height="8" fill="#fff" />
    </g>
  );
}

function Chair({ x, y, color = "#334155" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-20" y="-52" width="40" height="52" rx="14" fill={color} />
      <rect x="-24" y="-6" width="48" height="10" rx="5" fill="#1e293b" />
    </g>
  );
}

export function AboutOfficeScene({ className = "" }: { className?: string }) {
  return (
    <div className={`about-office-scene ${className}`} aria-hidden>
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="presentation">
        <defs>
          <linearGradient id="office-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f2a33" />
            <stop offset="1" stopColor="#0a1822" />
          </linearGradient>
          <linearGradient id="office-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2420" />
            <stop offset="1" stopColor="#14110f" />
          </linearGradient>
          <linearGradient id="office-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#d9f99d" />
          </linearGradient>
          <linearGradient id="office-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fef9c3" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="office-screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#13213f" />
            <stop offset="1" stopColor="#1b1445" />
          </linearGradient>
          <linearGradient id="office-lid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2e8f0" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
          <radialGradient id="office-lamp-glow">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="office-sun">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.35" stopColor="#fef08a" />
            <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="office-window-clip">
            <rect x="76" y="64" width="208" height="176" rx="6" />
          </clipPath>
        </defs>

        <rect width="800" height="340" fill="url(#office-wall)" />
        <rect y="330" width="800" height="170" fill="url(#office-floor)" />
        {Array.from({ length: 9 }, (_, index) => (
          <line key={index} x1="0" x2="800" y1={346 + index * 18} y2={346 + index * 18} stroke="rgba(255,255,255,0.05)" />
        ))}
        <rect y="326" width="800" height="8" fill="#1c3a3a" />

        {/* Window with daylight and drifting clouds */}
        <rect x="68" y="56" width="224" height="192" rx="10" fill="#e2e8f0" />
        <g clipPath="url(#office-window-clip)">
          <rect x="76" y="64" width="208" height="176" fill="url(#office-sky)" />
          <circle cx="232" cy="110" r="52" fill="url(#office-sun)" className="office-sun" />
          <g className="office-cloud">
            <ellipse cx="110" cy="112" rx="26" ry="9" fill="#fff" opacity="0.9" />
            <ellipse cx="128" cy="104" rx="18" ry="9" fill="#fff" opacity="0.9" />
          </g>
          <g className="office-cloud office-cloud--slow">
            <ellipse cx="190" cy="168" rx="22" ry="8" fill="#fff" opacity="0.75" />
            <ellipse cx="204" cy="161" rx="14" ry="8" fill="#fff" opacity="0.75" />
          </g>
          <path d="M76 240 L76 206 Q110 190 140 204 Q175 180 210 202 Q250 186 284 208 L284 240 Z" fill="#16a34a" opacity="0.85" />
          <path d="M76 240 L76 222 Q120 208 160 220 Q210 204 284 224 L284 240 Z" fill="#15803d" />
        </g>
        <line x1="180" y1="64" x2="180" y2="240" stroke="#e2e8f0" strokeWidth="6" />
        <line x1="76" y1="150" x2="284" y2="150" stroke="#e2e8f0" strokeWidth="6" />
        <polygon points="76,248 284,248 470,500 150,500" fill="url(#office-beam)" className="office-beam" />

        {/* Kanban board */}
        <g transform="translate(330 78)">
          <rect width="238" height="146" rx="10" fill="#eef2ff" opacity="0.96" />
          <rect width="238" height="22" rx="10" fill="#c7d2fe" />
          {[0, 1, 2].map((column) => (
            <g key={column} transform={`translate(${12 + column * 76} 32)`}>
              <rect width="66" height="7" rx="3.5" fill={["#a78bfa", "#38bdf8", "#34d399"][column]} />
              <rect y="14" width="66" height="104" rx="6" fill="rgba(99,102,241,0.08)" />
            </g>
          ))}
          {[
            [0, 0, "#fde68a"],
            [0, 1, "#fbcfe8"],
            [1, 0, "#bae6fd"],
            [2, 0, "#bbf7d0"],
            [2, 1, "#ddd6fe"],
          ].map(([column, row, color]) => (
            <rect
              key={`${column}-${row}`}
              x={18 + Number(column) * 76}
              y={54 + Number(row) * 28}
              width="54"
              height="22"
              rx="4"
              fill={String(color)}
            />
          ))}
          <g className="office-note">
            <rect x="18" y="110" width="54" height="22" rx="4" fill="#fdba74" />
            <rect x="24" y="118" width="30" height="3.4" rx="1.7" fill="rgba(0,0,0,0.25)" />
          </g>
        </g>

        {/* Shelf */}
        <rect x="610" y="196" width="170" height="8" rx="3" fill="#8b5e3c" />
        <Plant x={650} y={196} scale={0.62} delay={0.4} pot="#e2e8f0" />
        <Plant x={742} y={196} scale={0.7} delay={1.1} pot="#64748b" leaf="#4ade80" />
        <rect x="684" y="112" width="40" height="52" rx="3" fill="#1e293b" stroke="#a78bfa" strokeWidth="2" />
        <path d="M690 156 L702 138 L710 148 L716 140 L720 156 Z" fill="#34d399" opacity="0.8" />

        {/* Ceiling décor */}
        <Lamp x={330} delay={0} />
        <Lamp x={450} delay={0.8} />
        <Lamp x={570} delay={1.6} />
        <HangingPlant x={40} delay={0.2} />
        <HangingPlant x={770} delay={1.3} />

        {/* Background desk with teammates */}
        <Chair x={188} y={316} color="#475569" />
        <Chair x={330} y={316} color="#4c1d95" />
        <Chair x={472} y={316} color="#0e7490" />
        <Person x={188} y={308} tone={0} clothes={0} delay={0} />
        <Person x={330} y={308} tone={2} clothes={1} delay={0.7} />
        <Person x={472} y={308} tone={1} clothes={2} delay={1.4} />
        <rect x="120" y="330" width="420" height="14" rx="4" fill="#b98258" />
        <rect x="120" y="330" width="420" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
        <rect x="136" y="344" width="8" height="42" fill="#7c5535" />
        <rect x="516" y="344" width="8" height="42" fill="#7c5535" />
        <rect x="548" y="318" width="22" height="12" rx="3" fill="#f8fafc" />
        <path className="office-steam" d="M559 314 q-5 -8 0 -14 q5 -6 0 -12" stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Meeting corner */}
        <g transform="translate(630 0)">
          <Chair x={14} y={366} color="#7c3aed" />
          <Chair x={132} y={366} color="#0891b2" />
          <Person x={14} y={358} tone={3} clothes={3} delay={0.3} laptop={false} />
          <Person x={132} y={358} tone={1} clothes={4} delay={1} laptop={false} />
          <ellipse cx="73" cy="382" rx="82" ry="16" fill="#cda06f" />
          <ellipse cx="73" cy="378" rx="82" ry="14" fill="#e3b983" />
          <rect x="68" y="392" width="10" height="38" fill="#7c5535" />
          <g className="office-bubble">
            <rect x="-4" y="282" width="62" height="30" rx="12" fill="#fff" opacity="0.94" />
            <path d="M12 312 L8 322 L24 312 Z" fill="#fff" opacity="0.94" />
            <circle cx="14" cy="297" r="3" fill="#7c5cff" />
            <circle cx="27" cy="297" r="3" fill="#38bdf8" />
            <circle cx="40" cy="297" r="3" fill="#34d399" />
          </g>
          <g className="office-bubble office-bubble--late">
            <rect x="96" y="268" width="62" height="30" rx="12" fill="#c4b5fd" opacity="0.95" />
            <path d="M138 298 L146 308 L128 298 Z" fill="#c4b5fd" opacity="0.95" />
            <rect x="106" y="279" width="42" height="4" rx="2" fill="#fff" />
            <rect x="106" y="287" width="26" height="4" rx="2" fill="#fff" opacity="0.7" />
          </g>
        </g>

        {/* Foreground workstations with live screens */}
        <rect x="26" y="402" width="270" height="14" rx="4" fill="#c99363" />
        <rect x="26" y="402" width="270" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
        <rect x="46" y="416" width="8" height="70" fill="#7c5535" />
        <rect x="268" y="416" width="8" height="70" fill="#7c5535" />
        <Monitor x={48} y={332} seed={0} />
        <Monitor x={172} y={332} seed={2} />
        <rect x="150" y="394" width="14" height="8" rx="3" fill="#f8fafc" />
        <Plant x={286} y={402} scale={0.5} delay={0.9} pot="#f1f5f9" leaf="#4ade80" />

        <rect x="420" y="430" width="200" height="12" rx="4" fill="#c99363" />
        <rect x="438" y="442" width="7" height="54" fill="#7c5535" />
        <rect x="596" y="442" width="7" height="54" fill="#7c5535" />
        <Monitor x={470} y={366} width={86} height={54} seed={4} />

        {/* Big plants */}
        <Plant x={30} y={452} scale={1.5} delay={0} pot="#b45309" />
        <Plant x={768} y={470} scale={1.7} delay={0.8} pot="#9a3412" leaf="#4ade80" dark="#166534" />
        <Plant x={370} y={494} scale={1.05} delay={1.5} pot="#e2e8f0" leaf="#86efac" dark="#16a34a" />

        {/* Fireflies / dust in the light */}
        {Array.from({ length: 14 }, (_, index) => (
          <circle
            key={index}
            className="office-firefly"
            cx={90 + ((index * 53) % 600)}
            cy={120 + ((index * 37) % 300)}
            r={1.4 + (index % 3) * 0.5}
            fill="#fef9c3"
            style={{ animationDelay: `${(index % 7) * -0.9}s` } as CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}
