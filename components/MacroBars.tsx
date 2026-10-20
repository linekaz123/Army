"use client";

import { motion } from "framer-motion";

type MacroRow = {
  label: string;
  consumed: number;
  target: number;
  color: string;
};

function Bar({ label, consumed, target, color }: MacroRow) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          <span className="font-semibold text-foreground">{Math.round(consumed)}</span>
          {" / "}
          {Math.round(target)}g
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function MacroBars({
  protein,
  carbs,
  fat,
  targets,
}: {
  protein: number;
  carbs: number;
  fat: number;
  targets: { protein: number; carbs: number; fat: number };
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-muted">Macros</h2>
      <Bar label="Protein" consumed={protein} target={targets.protein} color="var(--protein)" />
      <Bar label="Carbs" consumed={carbs} target={targets.carbs} color="var(--carbs)" />
      <Bar label="Fat" consumed={fat} target={targets.fat} color="var(--fat)" />
    </div>
  );
}
