"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BottomSheet } from "./BottomSheet";

const LB_PER_KG = 2.20462;

export function WeightLogSheet({
  open,
  onClose,
  onSave,
  lastWeightKg,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (weightKg: number) => Promise<void>;
  lastWeightKg: number | null;
}) {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [value, setValue] = useState(() =>
    lastWeightKg ? String(Math.round(lastWeightKg * 10) / 10) : ""
  );
  const [saving, setSaving] = useState(false);

  function toggleUnit(next: "kg" | "lb") {
    if (next === unit) return;
    const num = Number(value);
    if (!Number.isNaN(num) && num > 0) {
      const converted = next === "lb" ? num * LB_PER_KG : num / LB_PER_KG;
      setValue(String(Math.round(converted * 10) / 10));
    }
    setUnit(next);
  }

  async function handleSave() {
    const num = Number(value);
    if (!num || num <= 0) return;
    const kg = unit === "lb" ? num / LB_PER_KG : num;
    setSaving(true);
    await onSave(Math.round(kg * 10) / 10);
    setSaving(false);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log weight">
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              onClick={() => toggleUnit(u)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                unit === u ? "bg-brand text-white" : "bg-surface-muted text-muted"
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <input
          type="number"
          inputMode="decimal"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={unit === "kg" ? "e.g. 70.5" : "e.g. 155"}
          className="w-full rounded-2xl border border-border bg-surface p-4 text-center text-2xl font-bold outline-none focus:border-brand"
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={saving || !value}
          onClick={handleSave}
          className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save weight
        </motion.button>
      </div>
    </BottomSheet>
  );
}
