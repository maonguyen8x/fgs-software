"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const STEPS = ["listen", "sketch", "build", "ship"] as const;

export function AboutNotebookWorkflow() {
  const t = useTranslations("about.notebook");
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-notebook-workflow">
      <div className="about-notebook-section-head">
        <p className="about-notebook-chapter">{t("work_chapter")}</p>
        <h2>{t("work_title")}</h2>
        <p>{t("work_note")}</p>
      </div>

      <div className="about-notebook-path" aria-label={STEPS.map((step) => t(`steps.${step}`)).join(" → ")}>
        <svg viewBox="0 0 900 190" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M110 88 C185 46 255 130 335 88 S485 46 560 88 S710 130 790 88"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="7 9"
            initial={{ pathLength: reduceMotion ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </svg>
        {STEPS.map((step, index) => (
          <div key={step} className={`about-notebook-step about-notebook-step--${index + 1}`}>
            <span className="about-notebook-step-circle">
              <span>{t(`steps.${step}`)}</span>
            </span>
            <span className="about-notebook-step-label">{t("step_label", { number: index + 1 })}</span>
          </div>
        ))}
      </div>
      <p className="about-notebook-repeat">{t("repeat")}</p>
    </section>
  );
}
