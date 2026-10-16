"use client";

import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

interface AboutIdentityOrbitProps {
  title: string;
  subtitle: string;
}

export function AboutIdentityOrbit({ title, subtitle }: AboutIdentityOrbitProps) {
  const t = useTranslations("about");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="about-identity-section">
      <div className="container-narrow px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="about-identity-title">{title}</h2>
          <p className="about-identity-subtitle">{subtitle}</p>
        </div>

        <div
          className="about-identity-diagram"
          role="img"
          aria-label={t("identity_aria")}
        >
          <div className="about-identity-ring" aria-hidden />
          <svg
            className="about-identity-lines"
            viewBox="0 0 800 520"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path className="about-identity-line" d="M400 260 L400 70" />
            <path className="about-identity-line" d="M400 260 L610 390" />
            <path className="about-identity-line" d="M400 260 L190 390" />
            <circle className="about-identity-node" cx="400" cy="70" r="4" />
            <circle className="about-identity-node" cx="610" cy="390" r="4" />
            <circle className="about-identity-node" cx="190" cy="390" r="4" />
            {!shouldReduceMotion ? (
              <circle
                className="about-identity-particle"
                cx="400"
                cy="260"
                r="6"
              >
                <animateMotion
                  dur="8s"
                  repeatCount="indefinite"
                  path="M 0 0 L 0 -190 L 0 0 L 210 130 L 0 0 L -210 130 L 0 0"
                  keyPoints="0;0.16;0.32;0.52;0.68;0.84;1"
                  keyTimes="0;0.14;0.28;0.45;0.59;0.78;1"
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0;1;0;1;0"
                  keyTimes="0;0.14;0.28;0.45;0.59;0.78;1"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
          </svg>

          <div className="about-identity-center">
            <span className="about-identity-center-mark">FGS</span>
            <span className="about-identity-center-name">Software</span>
          </div>

          <div className="about-identity-point about-identity-point--future">
            <span className="about-identity-point-index">01</span>
            <span className="about-identity-point-name">Future</span>
            <span className="about-identity-point-note">{t("identity_future_note")}</span>
          </div>
          <div className="about-identity-point about-identity-point--global">
            <span className="about-identity-point-index">02</span>
            <span className="about-identity-point-name">Global</span>
            <span className="about-identity-point-note">{t("identity_global_note")}</span>
          </div>
          <div className="about-identity-point about-identity-point--software">
            <span className="about-identity-point-index">03</span>
            <span className="about-identity-point-name">Solutions</span>
            <span className="about-identity-point-note">{t("identity_solutions_note")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
