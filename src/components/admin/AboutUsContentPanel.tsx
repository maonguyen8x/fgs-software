"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadImage } from "@/components/ui/UploadImage";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { NewsContentEditor } from "@/components/admin/NewsContentEditor";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";
import { ABOUT_US_CONTENT_KEY, parseAboutUsContent, type LocalizedText } from "@/lib/about-us-content";
import { CEO_IMAGE_KEY, CEO_IMAGE_POS_X_KEY, CEO_IMAGE_POS_Y_KEY, CEO_IMAGE_ZOOM_KEY } from "@/lib/team-page-settings";

const LOCALES = ["en", "ja", "vi"] as const;
const LOCALE_LABEL: Record<(typeof LOCALES)[number], string> = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

export interface AboutUsDefaults {
  bubbleTitle: LocalizedText;
  message: LocalizedText;
  role: LocalizedText;
  name: string;
  signature: string;
  intro: LocalizedText[];
}

interface Props {
  settings: Record<string, string>;
  defaults: AboutUsDefaults;
}

function LocalizedFields({
  id,
  label,
  value,
  onChange,
  richText,
}: {
  id: string;
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  richText?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {LOCALES.map((loc) => (
        <div key={loc} className="grid items-start gap-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
          <span className="pt-2 text-xs font-semibold text-slate-500">{LOCALE_LABEL[loc]}</span>
          {richText ? (
            <NewsContentEditor
              id={`${id}-${loc}`}
              value={value[loc]}
              height={160}
              onChange={(next) => onChange({ ...value, [loc]: next })}
            />
          ) : (
            <Input value={value[loc]} onChange={(e) => onChange({ ...value, [loc]: e.target.value })} />
          )}
        </div>
      ))}
    </div>
  );
}

function ImageAdjustmentSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="block rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm">
      <span className="mb-2 flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold tabular-nums text-blue-700">
          {label === "Zoom" ? `${value.toFixed(2)}x` : `${value}%`}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ceo-image-slider"
        style={{
          background: `linear-gradient(90deg, #2563eb 0%, #3b82f6 ${progress}%, #dbeafe ${progress}%, #dbeafe 100%)`,
        }}
      />
    </label>
  );
}

export function AboutUsContentPanel({ settings, defaults }: Props) {
  const router = useRouter();
  const saved = parseAboutUsContent(settings[ABOUT_US_CONTENT_KEY]);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(settings[CEO_IMAGE_KEY] ?? "");
  const [zoom, setZoom] = useState(Number(settings[CEO_IMAGE_ZOOM_KEY]) || 1);
  const [posX, setPosX] = useState(Number(settings[CEO_IMAGE_POS_X_KEY] ?? 50));
  const [posY, setPosY] = useState(Number(settings[CEO_IMAGE_POS_Y_KEY] ?? 20));
  const [bubbleTitle, setBubbleTitle] = useState(saved.ceo.bubbleTitle ?? defaults.bubbleTitle);
  const [message, setMessage] = useState(saved.ceo.message ?? defaults.message);
  const [role, setRole] = useState(saved.ceo.role ?? defaults.role);
  const [name, setName] = useState(saved.ceo.name || defaults.name);
  const [signature, setSignature] = useState(saved.ceo.signature || defaults.signature);
  const [intro, setIntro] = useState<LocalizedText[]>(saved.intro ?? defaults.intro);

  const updateIntro = (index: number, next: LocalizedText) =>
    setIntro((items) => items.map((item, i) => (i === index ? next : item)));

  const save = async () => {
    setSaving(true);
    const content = { ceo: { bubbleTitle, message, role, name, signature }, intro };
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [CEO_IMAGE_KEY]: image.trim(),
        [CEO_IMAGE_ZOOM_KEY]: String(zoom),
        [CEO_IMAGE_POS_X_KEY]: String(posX),
        [CEO_IMAGE_POS_Y_KEY]: String(posY),
        [ABOUT_US_CONTENT_KEY]: JSON.stringify(content),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      showAdminErrorToast("Save failed");
      return;
    }
    showAdminSuccessToast("Saved");
    publishPublicSiteUpdate(router);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">CEO Messages</h3>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <ImageUploadField
            label="CEO photo"
            hint="Upload, replace or remove the photo. Use zoom and vertical position to crop empty space."
            value={image}
            onChange={setImage}
          />
          {image && (
            <div className="space-y-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm shadow-blue-100/70">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Live image preview</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Live</span>
              </div>
              <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-lg shadow-blue-900/10 ring-1 ring-blue-200/80">
                <UploadImage
                  src={image}
                  alt=""
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-150"
                  style={{
                    objectPosition: `${posX}% ${posY}%`,
                    transform: `scale(${zoom})`,
                    transformOrigin: `${posX}% ${posY}%`,
                  }}
                />
              </div>
              <div className="space-y-2.5">
                <ImageAdjustmentSlider label="Zoom" value={zoom} min={1} max={2.5} step={0.05} onChange={setZoom} />
                <ImageAdjustmentSlider label="Horizontal position" value={posX} min={0} max={100} onChange={setPosX} />
                <ImageAdjustmentSlider label="Vertical position" value={posY} min={0} max={100} onChange={setPosY} />
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full cursor-pointer border-blue-200 bg-white text-blue-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => setImage("")}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove photo
              </Button>
            </div>
          )}
        </div>
        <LocalizedFields id="ceo-bubble-title" label="Bubble title" value={bubbleTitle} onChange={setBubbleTitle} />
        <LocalizedFields id="ceo-message" label="Message" value={message} onChange={setMessage} richText />
        <LocalizedFields id="ceo-role" label="Role" value={role} onChange={setRole} richText />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Signature</Label>
            <Input className="mt-1" value={signature} onChange={(e) => setSignature(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-md shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Introduction blocks</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setIntro((items) => [...items, { en: "", ja: "", vi: "" }])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add block
          </Button>
        </div>
        {intro.map((item, index) => (
          <div key={index} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Block {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer text-red-600"
                onClick={() => setIntro((items) => items.filter((_, i) => i !== index))}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
            <LocalizedFields id={`intro-${index}`} label="Text" value={item} onChange={(next) => updateIntro(index, next)} richText />
          </div>
        ))}
      </section>

      <Button type="button" className="cursor-pointer" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
