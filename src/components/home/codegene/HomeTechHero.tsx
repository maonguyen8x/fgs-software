"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { HeroQuantumNeuralOverlay } from "@/components/home/HeroQuantumNeuralOverlay";
import { HOME_HASH_HERO } from "@/lib/home-chapters";

interface AmbientAudioGraph {
  context: AudioContext;
  output: GainNode;
  oscillators: OscillatorNode[];
}

function AmbientAudioToggle() {
  const t = useTranslations("hero");
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const audioRef = useRef<AmbientAudioGraph | null>(null);
  const toggleInProgressRef = useRef(false);

  useEffect(() => {
    return () => {
      const graph = audioRef.current;
      if (!graph) return;
      graph.oscillators.forEach((oscillator) => oscillator.stop());
      void graph.context.close();
    };
  }, []);

  const toggleAudio = async () => {
    if (toggleInProgressRef.current) return;
    toggleInProgressRef.current = true;

    try {
      const graph = audioRef.current;
      if (enabled && graph) {
        graph.output.gain.cancelScheduledValues(graph.context.currentTime);
        graph.output.gain.setTargetAtTime(0.0001, graph.context.currentTime, 0.18);
        graph.oscillators.forEach((oscillator) =>
          oscillator.stop(graph.context.currentTime + 0.8)
        );
        audioRef.current = null;
        setEnabled(false);
        window.setTimeout(() => void graph.context.close(), 1100);
        return;
      }

      if (typeof window.AudioContext === "undefined") {
        throw new Error("Web Audio API is unavailable");
      }

      const context = new AudioContext();
      const output = context.createGain();
      output.gain.value = 0.0001;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 760;
      filter.Q.value = 0.7;
      output.connect(filter);
      filter.connect(context.destination);
      const nextGraph: AmbientAudioGraph = { context, output, oscillators: [] };
      audioRef.current = nextGraph;

      [55, 82.41, 110, 164.81, 220, 261.63, 329.63].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const voice = context.createGain();
        const modulation = context.createOscillator();
        const modulationDepth = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        voice.gain.value = index < 2 ? 0.1 : 0.075;
        modulation.type = "sine";
        modulation.frequency.value = 0.025 + index * 0.004;
        modulationDepth.gain.value = 0.28;
        modulation.connect(modulationDepth);
        modulationDepth.connect(oscillator.frequency);
        oscillator.connect(voice);
        voice.connect(output);
        nextGraph.oscillators.push(oscillator);
        nextGraph.oscillators.push(modulation);
        oscillator.start();
        modulation.start();
      });

      await context.resume();
      output.gain.setTargetAtTime(0.05, context.currentTime, 1.6);
      setUnavailable(false);
      setEnabled(true);
    } catch {
      const failedGraph = audioRef.current;
      if (failedGraph) {
        failedGraph.oscillators.forEach((oscillator) => oscillator.stop());
        void failedGraph.context.close();
      }
      audioRef.current = null;
      setEnabled(false);
      setUnavailable(true);
    } finally {
      toggleInProgressRef.current = false;
    }
  };

  return (
    <div className="home-ambient-audio">
      <button
        type="button"
        className="home-ambient-audio-button"
        onClick={() => void toggleAudio()}
        aria-label={enabled ? t("ambient_audio_on") : t("ambient_audio_muted")}
        aria-pressed={enabled}
      >
        <span>{enabled ? t("ambient_audio_on") : t("ambient_audio_muted")}</span>
        {enabled ? (
          <Volume2 className="h-4 w-4" aria-hidden />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden />
        )}
      </button>
      {unavailable ? (
        <p className="home-ambient-audio-error" role="status">
          {t("ambient_audio_unavailable")}
        </p>
      ) : null}
    </div>
  );
}

export function HomeTechHero() {
  const t = useTranslations("home.chapters");

  return (
    <section
      id={HOME_HASH_HERO}
      className="home-tech-hero relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#030508] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(88,28,135,0.18),transparent_60%)]" />
      <HeroQuantumNeuralOverlay />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,0.15)_0%,rgba(3,5,8,0.55)_55%,rgba(3,5,8,0.92)_100%)]" />

      <div className="container-narrow relative z-10 w-full px-4 py-24 lg:-translate-y-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/90">
          {t("hero_eyebrow")}
        </p>
        <h1 className="max-w-[28ch] text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:max-w-[36ch] lg:text-[2.65rem]">
          {t("hero_title")}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300/90 md:text-base">
          {t("hero_subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {t("hero_cta_primary")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById("chapter-01")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            {t("hero_cta_scroll")}
          </button>
        </div>
      </div>
      <AmbientAudioToggle />
    </section>
  );
}
