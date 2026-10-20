"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import type { FoodAnalysis, Meal } from "@/lib/types";

type PendingMeal = {
  analysis: FoodAnalysis;
  source: Meal["source"];
  imageUrl: string | null;
};

export function FoodReviewModal({
  pending,
  onClose,
  onSave,
}: {
  pending: PendingMeal | null;
  onClose: () => void;
  onSave: (meal: Omit<Meal, "id">) => Promise<void>;
}) {
  const [form, setForm] = useState<FoodAnalysis | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the editable form whenever a new analysis comes in.
  if (pending && form === null) {
    setForm(pending.analysis);
  }
  if (!pending && form !== null) {
    setForm(null);
  }

  if (!pending || !form) {
    return (
      <BottomSheet open={false} onClose={onClose} title="Review meal">
        {null}
      </BottomSheet>
    );
  }

  function update<K extends keyof FoodAnalysis>(key: K, value: FoodAnalysis[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form || !pending) return;
    setSaving(true);
    await onSave({
      name: form.name || "Logged meal",
      portion: form.portion || "1 serving",
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      imageUrl: pending.imageUrl,
      source: pending.source,
      loggedAt: new Date().toISOString(),
    });
    setSaving(false);
  }

  return (
    <BottomSheet open={Boolean(pending)} onClose={onClose} title="Review before saving">
      <div className="space-y-4">
        {pending.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pending.imageUrl} alt={form.name} className="h-40 w-full rounded-2xl object-cover" />
        )}

        {pending.source !== "manual" && (
          <div className="flex items-center gap-1.5 rounded-xl bg-brand-light px-3 py-2 text-xs font-medium text-brand-dark">
            <BadgeCheck size={14} />
            AI estimate &middot; {Math.round(form.confidence * 100)}% confident — tweak anything below
          </div>
        )}

        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm font-semibold outline-none focus:border-brand"
        />
        <input
          value={form.portion}
          onChange={(e) => update("portion", e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand"
        />

        <div className="grid grid-cols-4 gap-2">
          {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
            <div key={field}>
              <input
                type="number"
                inputMode="numeric"
                value={form[field]}
                onChange={(e) => update(field, Number(e.target.value) as never)}
                className="w-full rounded-xl border border-border bg-surface p-2.5 text-center text-sm outline-none focus:border-brand"
              />
              <p className="mt-1 text-center text-[10px] uppercase text-muted">
                {field === "calories" ? "kcal" : `${field} g`}
              </p>
            </div>
          ))}
        </div>

        {form.note && <p className="text-center text-xs italic text-muted">&ldquo;{form.note}&rdquo;</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Save to log
        </motion.button>
      </div>
    </BottomSheet>
  );
}
