"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Bot, Cloud, ShieldCheck, Smartphone, Volume2, VolumeX } from "lucide-react";
import { HeroQuantumNeuralOverlay } from "@/components/home/HeroQuantumNeuralOverlay";
import { HOME_HASH_HERO } from "@/lib/home-chapters";

const HERO_PILLS = [
  { key: "hero_pill_ai", Icon: Bot },
  { key: "hero_pill_web", Icon: Smartphone },
  { key: "hero_pill_cloud", Icon: Cloud },
  { key: "hero_pill_qa", Icon: ShieldCheck },
] as const;

// Highlights the closing words of the headline; CJK titles have no spaces so they split by length.
function splitHeadline(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length > 3) {
    const accentCount = Math.min(4, Math.max(2, Math.round(words.length * 0.35)));
    return {
      lead: `${words.slice(0, -accentCount).join(" ")} `,
      accent: words.slice(-accentCount).join(" "),
    };
  }
  const punctuation = Math.max(title.lastIndexOf("、"), title.lastIndexOf("，"), title.lastIndexOf(","));
  const cut = punctuation > 0 ? punctuation + 1 : Math.floor(title.length * 0.55);
  return { lead: title.slice(0, cut), accent: title.slice(cut) };
}

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

export function HomeTechHero({
  copy,
}: {
  copy?: { eyebrow?: string; title?: string; subtitle?: string };
}) {
  const t = useTranslations("home.chapters");
  const headline = splitHeadline(copy?.title || t("hero_title"));

  return (
    <section
      id={HOME_HASH_HERO}
      className="home-tech-hero relative flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(160deg,#05060f_0%,#0b0a24_100%)] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_74%_44%,rgba(108,77,255,0.24),transparent_66%)]" />
      <HeroQuantumNeuralOverlay />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,15,0.78)_0%,rgba(5,6,15,0.28)_52%,rgba(5,6,15,0)_100%),linear-gradient(180deg,rgba(5,6,15,0.1)_0%,rgba(5,6,15,0.2)_60%,rgba(5,6,15,0.85)_100%)]" />

      <div className="container-narrow relative z-10 flex w-full flex-1 items-center px-4 pb-6 pt-28 sm:px-6 lg:px-8">
        <div className="home-hero-copy max-w-[40rem]">
          <p className="home-hero-badge">
            <span aria-hidden />
            {copy?.eyebrow || t("hero_eyebrow")}
          </p>
          <h1 className="home-hero-title">
            {headline.lead}
            {headline.accent ? <span className="home-hero-title-accent">{headline.accent}</span> : null}
          </h1>
          <p className="home-hero-subtitle">{copy?.subtitle || t("hero_subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="home-hero-cta home-hero-cta--primary">
              {t("hero_cta_primary")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById("chapter-01")?.scrollIntoView({ behavior: "smooth" })}
              className="home-hero-cta home-hero-cta--secondary"
            >
              {t("hero_cta_scroll")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <ul className="home-hero-pills" aria-label={t("hero_expertise_label")}>
          {HERO_PILLS.map(({ key, Icon }, index) => (
            <li key={key} className="home-hero-pill" style={{ animationDelay: `${index * -1.1}s` }}>
              <span>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <div className="container-narrow relative z-10 w-full px-4 pb-20 sm:px-6 lg:px-8">
        <div className="home-hero-expertise">
          <span>{t("hero_expertise_label")}</span>
          <p>
            {t("hero_expertise_items")
              .split("|")
              .map((item, index) => (
                <span key={item}>
                  {index > 0 ? <i aria-hidden>·</i> : null}
                  {item}
                </span>
              ))}
          </p>
        </div>
      </div>
      <AmbientAudioToggle />
    </section>
  );
}
