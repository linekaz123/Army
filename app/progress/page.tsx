"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, LogOut, CloudOff, CloudCheck } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Mascot } from "@/components/Mascot";
import { WeightChart } from "@/components/WeightChart";
import { WeightLogSheet } from "@/components/WeightLogSheet";
import type { DailyTargets } from "@/lib/types";

export default function ProgressPage() {
  const { ready, mode, user, weightHistory, targets, addWeight, updateTargets, signOut } =
    useAppData();
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [form, setForm] = useState<DailyTargets>(targets);
  const [savedPing, setSavedPing] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Mascot mood="neutral" size={96} />
        <p className="text-sm text-muted">Loading your progress...</p>
      </div>
    );
  }

  const latest = [...weightHistory].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  )[0];

  async function handleSaveTargets() {
    await updateTargets(form);
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 1800);
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-5 text-xl font-bold">Progress</h1>

      <div className="space-y-5">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              <Scale size={15} />
              Weight
            </h2>
            <button
              onClick={() => setWeightSheetOpen(true)}
              className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark"
            >
              + Log weight
            </button>
          </div>
          {latest && (
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {latest.weightKg} <span className="text-sm font-medium text-muted">kg</span>
            </p>
          )}
          <div className="mt-3">
            <WeightChart entries={weightHistory} />
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted">Daily targets</h2>
          <div className="grid grid-cols-2 gap-3">
            <TargetField
              label="Calories"
              value={form.calories}
              onChange={(v) => setForm((f) => ({ ...f, calories: v }))}
            />
            <TargetField
              label="Water (ml)"
              value={form.waterMl}
              onChange={(v) => setForm((f) => ({ ...f, waterMl: v }))}
            />
            <TargetField
              label="Protein (g)"
              value={form.protein}
              onChange={(v) => setForm((f) => ({ ...f, protein: v }))}
            />
            <TargetField
              label="Carbs (g)"
              value={form.carbs}
              onChange={(v) => setForm((f) => ({ ...f, carbs: v }))}
            />
            <TargetField
              label="Fat (g)"
              value={form.fat}
              onChange={(v) => setForm((f) => ({ ...f, fat: v }))}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveTargets}
            className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white"
          >
            {savedPing ? "Saved!" : "Save targets"}
          </motion.button>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-muted">Account</h2>
          {mode === "supabase" && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CloudCheck size={16} className="text-brand" />
                <span className="truncate">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-muted"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-muted">
                <CloudOff size={16} />
                Guest mode — data stays on this device.
              </p>
              <Link
                href="/login"
                className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
              >
                Sign in
              </Link>
            </div>
          )}
        </section>
      </div>

      <WeightLogSheet
        open={weightSheetOpen}
        onClose={() => setWeightSheetOpen(false)}
        onSave={addWeight}
        lastWeightKg={latest?.weightKg ?? null}
      />
    </main>
  );
}

function TargetField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm font-semibold outline-none focus:border-brand"
      />
    </label>
  );
}
