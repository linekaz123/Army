"use client";

import { Droplet, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressRing } from "./ProgressRing";

const QUICK_ADD = [250, 500];

export function WaterTrackerCard({
  totalMl,
  targetMl,
  onAdd,
}: {
  totalMl: number;
  targetMl: number;
  onAdd: (amountMl: number) => void;
}) {
  const progress = targetMl > 0 ? totalMl / targetMl : 0;

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted">
          <Droplet size={15} className="text-water" />
          Hydration
        </h2>
        <span className="text-xs font-medium text-muted">
          {(targetMl / 1000).toFixed(1)}L goal
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <ProgressRing progress={progress} size={84} strokeWidth={9} color="var(--water)">
          <Droplet size={24} className="text-water" fill="var(--water)" fillOpacity={0.25} />
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tabular-nums">
            {(totalMl / 1000).toFixed(2)}
            <span className="text-sm font-medium text-muted"> L</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_ADD.map((amount) => (
              <motion.button
                key={amount}
                whileTap={{ scale: 0.92 }}
                onClick={() => onAdd(amount)}
                className="flex items-center gap-0.5 rounded-full border border-water/30 bg-water/10 px-2 py-1.5 text-xs font-semibold text-water"
              >
                <Plus size={12} className="shrink-0" />
                {amount}ml
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
