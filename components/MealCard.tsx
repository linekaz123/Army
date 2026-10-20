"use client";

import { motion } from "framer-motion";
import { Camera, PenLine, Sparkles, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/date-utils";
import type { Meal } from "@/lib/types";

const SOURCE_ICON = {
  scan: Camera,
  text: Sparkles,
  manual: PenLine,
};

export function MealCard({ meal, onDelete }: { meal: Meal; onDelete?: (id: string) => void }) {
  const SourceIcon = SOURCE_ICON[meal.source];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
    >
      {meal.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meal.imageUrl} alt={meal.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted">
          <SourceIcon size={20} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{meal.name}</p>
        <p className="truncate text-xs text-muted">
          {meal.portion} &middot; {formatTime(meal.loggedAt)}
        </p>
        <div className="mt-1 flex gap-2 text-[11px] font-medium text-muted">
          <span className="text-protein">{meal.protein}g P</span>
          <span className="text-carbs">{meal.carbs}g C</span>
          <span className="text-fat">{meal.fat}g F</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold tabular-nums">{meal.calories}</span>
        <span className="text-[10px] text-muted">kcal</span>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(meal.id)}
          aria-label="Delete meal"
          className="shrink-0 rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      )}
    </motion.div>
  );
}
