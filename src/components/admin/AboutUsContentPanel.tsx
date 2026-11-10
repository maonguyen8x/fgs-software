"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadImage } from "@/components/ui/UploadImage";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
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
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {LOCALES.map((loc) => (
        <div key={loc} className="flex items-start gap-2">
          <span className="mt-2 w-20 shrink-0 text-xs font-semibold text-slate-500">{LOCALE_LABEL[loc]}</span>
          {multiline ? (
            <textarea
              className="min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
              value={value[loc]}
              onChange={(e) => onChange({ ...value, [loc]: e.target.value })}
            />
          ) : (
            <Input value={value[loc]} onChange={(e) => onChange({ ...value, [loc]: e.target.value })} />
          )}
        </div>
      ))}
    </div>
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
            <div className="space-y-3">
              <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-3xl border border-slate-200">
                <UploadImage
                  src={image}
                  alt=""
                  fill
                  sizes="176px"
                  className="object-cover"
                  style={{
                    objectPosition: `${posX}% ${posY}%`,
                    transform: `scale(${zoom})`,
                    transformOrigin: `${posX}% ${posY}%`,
                  }}
                />
              </div>
              <label className="block text-xs text-slate-600">
                Zoom ({zoom.toFixed(2)}x)
                <input type="range" min={1} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </label>
              <label className="block text-xs text-slate-600">
                Horizontal position ({posX}%)
                <input type="range" min={0} max={100} value={posX} onChange={(e) => setPosX(Number(e.target.value))} className="w-full" />
              </label>
              <label className="block text-xs text-slate-600">
                Vertical position ({posY}%)
                <input type="range" min={0} max={100} value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full" />
              </label>
              <Button type="button" variant="outline" size="sm" className="w-full cursor-pointer" onClick={() => setImage("")}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove photo
              </Button>
            </div>
          )}
        </div>
        <LocalizedFields label="Bubble title" value={bubbleTitle} onChange={setBubbleTitle} />
        <LocalizedFields label="Message" value={message} onChange={setMessage} multiline />
        <LocalizedFields label="Role" value={role} onChange={setRole} />
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
            <LocalizedFields label="Text" value={item} onChange={(next) => updateIntro(index, next)} multiline />
          </div>
        ))}
      </section>

      <Button type="button" className="cursor-pointer" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
