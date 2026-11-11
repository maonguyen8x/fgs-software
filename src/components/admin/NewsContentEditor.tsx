"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { toast } from "sonner";
import { NewsArticleContent } from "@/components/news/NewsArticleContent";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface NewsContentEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function NewsContentEditor({ id, value, onChange }: NewsContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const applyToSelection = (
    transform: (selectedText: string) => string,
    restoreSelection = false
  ) => {
    const textarea = textareaRef.current;
    const { start, end } = selectionRef.current;
    if (!textarea || start === end) {
      toast.error("Select the text you want to format first.");
      return;
    }

    const selectedText = value.slice(start, end);
    if (selectedText.includes("\n")) {
      toast.error("Apply text formatting to one line at a time.");
      return;
    }

    const replacement = transform(selectedText);
    onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      const selectionEnd = restoreSelection ? start + replacement.length : start;
      textarea.setSelectionRange(selectionEnd, selectionEnd);
    });
  };

  const wrapSelection = (kind: "color" | "font", setting: string) => {
    applyToSelection((text) => `[[${kind}:${setting}]]${text}[[/${kind}]]`, true);
  };

  return (
    <div className="space-y-2" data-color-mode="light">
      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 bg-slate-50 p-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          Text color
          <input
            type="color"
            aria-label="Text color"
            defaultValue="#2563eb"
            className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-1"
            onChange={(event) => wrapSelection("color", event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          Font
          <select
            aria-label="Font family"
            defaultValue=""
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
            onChange={(event) => {
              const font = event.target.value;
              if (font) wrapSelection("font", font);
              event.target.value = "";
            }}
          >
            <option value="" disabled>Choose</option>
            <option value="sans-serif">Sans serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="system-ui">System</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
          onClick={() => applyToSelection((text) => text.toUpperCase(), true)}
        >
          UPPERCASE
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
          onClick={() => applyToSelection((text) => text.toLowerCase(), true)}
        >
          lowercase
        </button>
        <span className="text-xs text-slate-500">Select text, then format it. Bold and italic are in the editor toolbar.</span>
      </div>
      <div className="overflow-hidden rounded-b-lg border border-slate-200" id={id}>
        <MarkdownEditor
          value={value}
          height={320}
          preview="live"
          components={{
            preview: (source) => <NewsArticleContent content={source} />,
          }}
          onChange={(nextValue, _event, state) => {
            if (state?.textarea) textareaRef.current = state.textarea;
            onChange(nextValue ?? "");
          }}
          textareaProps={{
            "aria-label": "Article content",
            onSelect: (event) => {
              textareaRef.current = event.currentTarget;
              selectionRef.current = {
                start: event.currentTarget.selectionStart,
                end: event.currentTarget.selectionEnd,
              };
            },
            onFocus: (event) => {
              textareaRef.current = event.currentTarget;
              selectionRef.current = {
                start: event.currentTarget.selectionStart,
                end: event.currentTarget.selectionEnd,
              };
            },
          }}
        />
      </div>
    </div>
  );
}
