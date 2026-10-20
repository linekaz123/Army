"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Sparkles, Loader2, PenLine } from "lucide-react";
import { Mascot } from "./Mascot";
import { compressImageFile } from "@/lib/image";
import type { FoodAnalysis, Meal } from "@/lib/types";

type Tab = "scan" | "text";

export function LogFoodSheet({
  onResult,
}: {
  onResult: (analysis: FoodAnalysis, meta: { source: Meal["source"]; imageUrl: string | null }) => void;
}) {
  const [tab, setTab] = useState<Tab>("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ name: "", portion: "1 serving", calories: "", protein: "", carbs: "", fat: "" });

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const { dataUrl, base64, mimeType } = await compressImageFile(file);
      setPreview(dataUrl);

      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't analyze that photo.");
        setLoading(false);
        return;
      }

      onResult(data as FoodAnalysis, { source: "scan", imageUrl: dataUrl });
    } catch {
      setError("Something went wrong reading that photo. Try again?");
    } finally {
      setLoading(false);
    }
  }

  async function handleTextEstimate() {
    if (!text.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't estimate that meal.");
        setLoading(false);
        return;
      }
      onResult(data as FoodAnalysis, { source: "text", imageUrl: null });
    } catch {
      setError("Something went wrong. Try entering the macros manually below.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualSave() {
    const analysis: FoodAnalysis = {
      name: manual.name.trim() || "Logged meal",
      portion: manual.portion.trim() || "1 serving",
      calories: Number(manual.calories) || 0,
      protein: Number(manual.protein) || 0,
      carbs: Number(manual.carbs) || 0,
      fat: Number(manual.fat) || 0,
      confidence: 1,
    };
    onResult(analysis, { source: "manual", imageUrl: null });
  }

  return (
    <div className="pb-2">
      <div className="mb-4 flex gap-2 rounded-2xl bg-surface-muted p-1">
        <button
          onClick={() => setTab("scan")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
            tab === "scan" ? "bg-surface shadow-sm text-foreground" : "text-muted"
          }`}
        >
          Scan photo
        </button>
        <button
          onClick={() => setTab("text")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
            tab === "text" ? "bg-surface shadow-sm text-foreground" : "text-muted"
          }`}
        >
          Quick log
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-2 py-6">
          <Mascot mood="neutral" size={88} />
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={15} className="animate-spin" />
            Kooky is taking a look...
          </p>
        </div>
      )}

      {!loading && tab === "scan" && (
        <div className="space-y-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected food" className="h-48 w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted">
              <Camera size={28} />
              <p className="mt-2 text-sm">Snap or upload your meal</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white"
            >
              <Camera size={18} />
              Take photo
            </button>
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-muted py-3 text-sm font-semibold text-foreground"
            >
              <ImagePlus size={18} />
              Upload
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {!loading && tab === "text" && !manualMode && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'e.g. "1 bowl of oatmeal with blueberries and honey"'}
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!text.trim()}
            onClick={handleTextEstimate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Sparkles size={16} />
            Estimate with AI
          </motion.button>
          <button
            onClick={() => setManualMode(true)}
            className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted"
          >
            <PenLine size={13} />
            Enter nutrition manually instead
          </button>
        </div>
      )}

      {!loading && tab === "text" && manualMode && (
        <div className="space-y-3">
          <input
            value={manual.name}
            onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
            placeholder="Food name"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
          />
          <input
            value={manual.portion}
            onChange={(e) => setManual((m) => ({ ...m, portion: e.target.value }))}
            placeholder="Portion (e.g. 1 bowl)"
            className="w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
          />
          <div className="grid grid-cols-4 gap-2">
            {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
              <div key={field}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={manual[field]}
                  onChange={(e) => setManual((m) => ({ ...m, [field]: e.target.value }))}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-surface p-2.5 text-center text-sm outline-none focus:border-brand"
                />
                <p className="mt-1 text-center text-[10px] uppercase text-muted">
                  {field === "calories" ? "kcal" : `${field} g`}
                </p>
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!manual.name.trim()}
            onClick={handleManualSave}
            className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Add meal
          </motion.button>
          <button
            onClick={() => setManualMode(false)}
            className="w-full py-1 text-xs font-medium text-muted"
          >
            Back to AI estimate
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
