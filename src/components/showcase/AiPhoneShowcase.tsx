"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  ArrowUpRight,
  BatteryFull,
  Bell,
  Cloud,
  FileCheck2,
  FileText,
  Folder,
  Languages,
  Layers,
  ListChecks,
  ListTodo,
  Mic,
  NotebookPen,
  PenLine,
  Search,
  ShieldAlert,
  Signal,
  Sparkles,
  TriangleAlert,
  UserCheck,
  Video,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

export interface PhoneShowcaseProduct {
  id: string;
  title: string;
  description: string;
  features: string[];
  appUrl?: string | null;
}

interface AiPhoneShowcaseProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  productLabel: string;
  products: PhoneShowcaseProduct[];
  className?: string;
}

const FEATURE_INTERVAL_MS = 3200;
const MAX_FEATURES = 5;
const DEPTH = 22;
const SLICES = Array.from({ length: DEPTH + 1 }, (_, index) => index - DEPTH / 2);

const ACCENTS = [
  { from: "#7c5cff", to: "#38bdf8", glow: "124, 92, 255" },
  { from: "#22d3ee", to: "#34d399", glow: "34, 211, 238" },
  { from: "#f472b6", to: "#fbbf24", glow: "244, 114, 182" },
] as const;

function featureIcon(text: string): LucideIcon {
  const value = text.toLowerCase();
  if (/meet|zoom|call|video/.test(value)) return Video;
  if (/translat|speech|language|multilingual/.test(value)) return Languages;
  if (/note|summar/.test(value)) return NotebookPen;
  if (/action|next|suggest/.test(value)) return ListChecks;
  if (/assign/.test(value)) return UserCheck;
  if (/notion|backlog|jira|task|estimate/.test(value)) return ListTodo;
  if (/risk|alert|warn/.test(value)) return ShieldAlert;
  if (/chat|notif|remind/.test(value)) return Bell;
  if (/cloud/.test(value)) return Cloud;
  if (/search/.test(value)) return Search;
  if (/contract|review/.test(value)) return FileCheck2;
  if (/edit|writ/.test(value)) return PenLine;
  return Sparkles;
}

function productFeatures(product: PhoneShowcaseProduct) {
  const features = product.features.filter(Boolean).slice(0, MAX_FEATURES);
  return features.length > 0 ? features : [product.title];
}

function MeetingVisual({ features }: { features: string[] }) {
  return (
    <div className="ph-visual">
      <div className="flex gap-1.5">
        {features.slice(0, 2).map((feature, index) => (
          <span key={feature} className="ph-chip-mini">
            <span className={index === 0 ? "bg-emerald-400" : "bg-sky-400"} />
            {feature}
          </span>
        ))}
      </div>
      <div className="ph-wave" aria-hidden>
        {Array.from({ length: 30 }, (_, index) => (
          <i
            key={index}
            style={{ animationDelay: `${(index % 9) * -0.18}s`, height: `${28 + ((index * 17) % 60)}%` }}
          />
        ))}
      </div>
      <div className="ph-bubble ph-bubble--in">
        <b>EN</b>
        <span className="ph-skeleton" style={{ width: "86%" }} />
        <span className="ph-skeleton" style={{ width: "52%" }} />
      </div>
      <div className="ph-bubble ph-bubble--out">
        <b>JA</b>
        <span className="ph-skeleton ph-skeleton--accent" style={{ width: "74%" }} />
        <span className="ph-skeleton ph-skeleton--accent" style={{ width: "40%" }} />
      </div>
    </div>
  );
}

function TaskVisual({ features }: { features: string[] }) {
  return (
    <div className="ph-visual">
      <div className="flex gap-1.5">
        {features.slice(0, 3).map((feature) => (
          <span key={feature} className="ph-chip-mini">
            {feature}
          </span>
        ))}
      </div>
      <div className="ph-board">
        {[0, 1, 2].map((column) => (
          <div key={column} className="ph-board-col">
            {Array.from({ length: column === 1 ? 3 : 2 }, (_, card) => {
              const warning = column === 1 && card === 1;
              return (
                <div key={card} className={`ph-task ${warning ? "ph-task--warn" : ""}`}>
                  <span className="ph-skeleton" style={{ width: `${70 - card * 14}%` }} />
                  <span className="ph-skeleton" style={{ width: "46%" }} />
                  {warning ? <TriangleAlert className="ph-task-icon" aria-hidden /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ph-bubble ph-bubble--in">
        <Bell className="h-3 w-3 text-amber-300" aria-hidden />
        <span className="ph-skeleton" style={{ width: "80%" }} />
      </div>
    </div>
  );
}

function DocumentVisual({ features }: { features: string[] }) {
  return (
    <div className="ph-visual">
      <div className="flex gap-1.5">
        {features.slice(0, 2).map((feature) => (
          <span key={feature} className="ph-chip-mini">
            <Cloud className="h-2.5 w-2.5" aria-hidden />
            {feature}
          </span>
        ))}
      </div>
      <div className="ph-files">
        <span className="ph-scan" aria-hidden />
        {[Folder, FileText, FileCheck2, FileText].map((Icon, index) => (
          <div key={index} className={`ph-file ${index === 2 ? "ph-file--risk" : ""}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="ph-skeleton" style={{ width: `${68 - index * 9}%` }} />
            {index === 2 ? <ShieldAlert className="ph-task-icon" aria-hidden /> : null}
          </div>
        ))}
      </div>
      <div className="ph-bubble ph-bubble--out">
        <PenLine className="h-3 w-3 text-pink-300" aria-hidden />
        <span className="ph-skeleton ph-skeleton--accent" style={{ width: "78%" }} />
      </div>
    </div>
  );
}

const VISUALS = [MeetingVisual, TaskVisual, DocumentVisual] as const;
const APP_ICONS = [Mic, ListTodo, FileCheck2] as const;

function PhoneScreen({
  product,
  productIndex,
  featureIndex,
  productLabel,
}: {
  product: PhoneShowcaseProduct;
  productIndex: number;
  featureIndex: number;
  productLabel: string;
}) {
  const accent = ACCENTS[productIndex % ACCENTS.length];
  const features = productFeatures(product);
  const Visual = VISUALS[productIndex % VISUALS.length];
  const AppIcon = APP_ICONS[productIndex % APP_ICONS.length];
  const safeIndex = featureIndex % features.length;
  const activeFeature = features[safeIndex];
  const ActiveIcon = featureIcon(activeFeature);

  return (
    <div
      className="ph-screen"
      style={
        {
          "--ph-from": accent.from,
          "--ph-to": accent.to,
          "--ph-glow": accent.glow,
        } as CSSProperties
      }
    >
      <div className="ph-status">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <Signal className="h-3 w-3" aria-hidden />
          <Wifi className="h-3 w-3" aria-hidden />
          <BatteryFull className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
      <div className="ph-island" aria-hidden>
        <i />
      </div>

      <div className="ph-app-head">
        <span className="ph-app-icon">
          <AppIcon aria-hidden />
        </span>
        <span className="min-w-0">
          <b>{product.title}</b>
          <small>{productLabel}</small>
        </span>
        <span className="ph-ai-badge">
          <Sparkles className="h-2.5 w-2.5" aria-hidden />
          AI
        </span>
      </div>

      <Visual features={features} />

      <div className="ph-feature-card" key={`${product.id}-${safeIndex}`}>
        <span className="ph-feature-icon">
          <ActiveIcon aria-hidden />
        </span>
        <span className="min-w-0">
          <small>
            {String(safeIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
          </small>
          <b>{activeFeature}</b>
        </span>
        <span className="ph-progress" style={{ animationDuration: `${FEATURE_INTERVAL_MS}ms` }} aria-hidden />
      </div>

      <ul className="ph-feature-list">
        {features.map((feature, index) => {
          const Icon = featureIcon(feature);
          return (
            <li key={feature} className={index === safeIndex ? "is-active" : ""}>
              <Icon aria-hidden />
              <span>{feature}</span>
            </li>
          );
        })}
      </ul>

      <div className="ph-tabbar" aria-hidden>
        <Layers />
        <Sparkles />
        <Search />
        <Bell />
      </div>
      <span className="ph-home-bar" aria-hidden />
    </div>
  );
}

function PhoneModel({
  product,
  productIndex,
  featureIndex,
  productLabel,
  reducedMotion,
}: {
  product: PhoneShowcaseProduct;
  productIndex: number;
  featureIndex: number;
  productLabel: string;
  reducedMotion: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetY = useMotionValue(reducedMotion ? -14 : 0);
  const targetX = useMotionValue(0);
  const rotateY = useSpring(targetY, { stiffness: 70, damping: 16, mass: 0.9 });
  const rotateX = useSpring(targetX, { stiffness: 70, damping: 16, mass: 0.9 });
  const [glare, setGlare] = useState(50);
  const interacting = useRef(false);
  const dragging = useRef<{ x: number; base: number } | null>(null);
  const features = productFeatures(product);
  const safeIndex = featureIndex % features.length;
  const ChipIcon = featureIcon(features[safeIndex]);

  useAnimationFrame((time) => {
    if (reducedMotion) return;
    if (!interacting.current && !dragging.current) {
      targetY.set(Math.sin(time / 2600) * 15 - 6);
      targetX.set(Math.cos(time / 3300) * 3);
    }
  });

  useEffect(
    () => rotateY.on("change", (latest) => setGlare(Math.round(50 + Math.max(-90, Math.min(90, latest)) * 0.9))),
    [rotateY]
  );

  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || reducedMotion) return;
    if (dragging.current) {
      const delta = event.clientX - dragging.current.x;
      targetY.set(Math.max(-200, Math.min(200, dragging.current.base + delta * 0.55)));
      return;
    }
    if (event.pointerType === "touch") return;
    const rect = stage.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    interacting.current = true;
    targetY.set(nx * 36);
    targetX.set(-ny * 16);
  };

  const release = () => {
    dragging.current = null;
    interacting.current = false;
    targetY.set(0);
    targetX.set(0);
  };

  return (
    <div
      ref={stageRef}
      className="ph-stage"
      onPointerMove={handleMove}
      onPointerLeave={release}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerDown={(event) => {
        if (reducedMotion) return;
        dragging.current = { x: event.clientX, base: targetY.get() };
        interacting.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
    >
      <div className="ph-viewport">
        <div className="ph-scene">
          <div className="ph-float">
            <motion.div className="ph-body" style={{ rotateX, rotateY }}>
              {SLICES.map((z) => (
                <i key={z} className="ph-slice" style={{ transform: `translateZ(${z}px)` }} />
              ))}

              <span className="ph-btn ph-btn--action" />
              <span className="ph-btn ph-btn--vol-up" />
              <span className="ph-btn ph-btn--vol-down" />
              <span className="ph-btn ph-btn--power" />
              <span className="ph-btn ph-btn--control" />

              <div className="ph-back" aria-hidden>
                <div className="ph-camera">
                  <i />
                  <i />
                  <i />
                  <b />
                </div>
                <span className="ph-back-mark">FGS</span>
              </div>

              <div className="ph-front">
                <div className="ph-glass">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={product.id}
                      className="h-full"
                      initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <PhoneScreen
                        product={product}
                        productIndex={productIndex}
                        featureIndex={featureIndex}
                        productLabel={productLabel}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <span className="ph-glare" aria-hidden style={{ backgroundPositionX: `${glare}%` }} />
                </div>
              </div>

              <div className="ph-orbit-chip ph-orbit-chip--left" aria-hidden>
                <span>
                  <ChipIcon />
                  {features[safeIndex]}
                </span>
              </div>
              <div className="ph-orbit-chip ph-orbit-chip--right" aria-hidden>
                <span>
                  <Sparkles />
                  {product.title}
                </span>
              </div>
            </motion.div>
            <div className="ph-shadow" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiPhoneShowcase({
  eyebrow,
  title,
  subtitle,
  productLabel,
  products,
  className = "",
}: AiPhoneShowcaseProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [state, setState] = useState({ product: 0, feature: 0 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion || paused || products.length === 0) return;
    const timer = window.setInterval(() => {
      setState((current) => {
        const features = productFeatures(products[current.product] ?? products[0]);
        if (current.feature + 1 < features.length) {
          return { product: current.product, feature: current.feature + 1 };
        }
        return { product: (current.product + 1) % products.length, feature: 0 };
      });
    }, FEATURE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, products, reducedMotion]);

  const select = useCallback((index: number) => setState({ product: index, feature: 0 }), []);

  if (products.length === 0) return null;
  const activeIndex = Math.min(state.product, products.length - 1);
  const active = products[activeIndex];

  return (
    <section className={`ai-phone-showcase ${className}`}>
      <div className="ai-phone-stars" aria-hidden />
      <div className="container-narrow relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">{eyebrow}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">{subtitle}</p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
          <PhoneModel
            product={active}
            productIndex={activeIndex}
            featureIndex={state.feature}
            productLabel={productLabel}
            reducedMotion={reducedMotion}
          />

          <div
            className="ph-products"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
          >
            {products.map((product, index) => {
              const isActive = index === activeIndex;
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <div
                  key={product.id}
                  className={`ph-product ${isActive ? "is-active" : ""}`}
                  style={{ "--ph-from": accent.from, "--ph-to": accent.to } as CSSProperties}
                >
                  <button
                    type="button"
                    className="ph-product-head"
                    onClick={() => select(index)}
                    aria-expanded={isActive}
                  >
                    <span className="ph-product-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ph-product-title">{product.title}</span>
                    <span className="ph-product-badge">{productLabel}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="ph-product-desc">{product.description}</p>
                        <div className="ph-product-tags">
                          {productFeatures(product).map((feature, featureIndex) => (
                            <span key={feature} className={featureIndex === state.feature ? "is-active" : ""}>
                              {feature}
                            </span>
                          ))}
                        </div>
                        {product.appUrl?.startsWith("https://") ? (
                          <a href={product.appUrl} target="_blank" rel="noreferrer" className="ph-product-link">
                            {product.appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
