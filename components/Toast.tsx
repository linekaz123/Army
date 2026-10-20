"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mascot } from "./Mascot";
import type { MascotMood } from "@/lib/types";

export function MascotToast({
  message,
  mood = "happy",
}: {
  message: string | null;
  mood?: MascotMood;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl"
          >
            <Mascot mood={mood} size={36} />
            <p className="text-sm font-medium text-foreground">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
