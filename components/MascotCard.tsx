"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mascot } from "./Mascot";
import type { MascotMood } from "@/lib/types";

const MOOD_LABEL: Record<MascotMood, string> = {
  ecstatic: "Thriving",
  happy: "Doing great",
  neutral: "Standing by",
  encouraging: "Here to help",
  sleepy: "Waiting on you",
};

export function MascotCard({ mood, message }: { mood: MascotMood; message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm">
      <div className="shrink-0">
        <Mascot mood={mood} size={84} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
          Kooky &middot; {MOOD_LABEL[mood]}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-1 text-sm leading-snug text-foreground"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
