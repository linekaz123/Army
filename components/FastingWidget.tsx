"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { useNow } from "@/lib/use-now";
import { formatCountdown } from "@/lib/date-utils";
import type { FastingSchedule, FastingSession } from "@/lib/types";

const SCHEDULES: { label: string; value: FastingSchedule; fastHours: number }[] = [
  { label: "16:8", value: "16:8", fastHours: 16 },
  { label: "14:10", value: "14:10", fastHours: 14 },
  { label: "18:6", value: "18:6", fastHours: 18 },
  { label: "20:4", value: "20:4", fastHours: 20 },
];

function useFastProgress(session: FastingSession | null) {
  const now = useNow(1000);
  if (!session) return { progress: 0, label: "", overtime: false };

  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.endsAt).getTime();
  const total = end - start;
  const elapsed = now - start;
  const overtime = now > end;
  const progress = total > 0 ? elapsed / total : 0;
  const label = overtime ? formatCountdown(now - end) : formatCountdown(end - now);
  return { progress, label, overtime };
}

export function FastingWidgetCompact({ session }: { session: FastingSession | null }) {
  const { progress, label, overtime } = useFastProgress(session);

  return (
    <Link href="/fasting" className="block">
      <div className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm active:scale-[0.99] transition-transform">
        <ProgressRing
          progress={session ? progress : 0}
          size={64}
          strokeWidth={7}
          color={overtime ? "var(--brand)" : "var(--fasting)"}
        >
          <Timer size={22} className="text-fasting" />
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-muted">Fasting</h2>
          {session ? (
            <>
              <p className="truncate text-lg font-bold tabular-nums">{label}</p>
              <p className="text-xs text-muted">
                {overtime ? "Goal reached — fasting continues" : `${session.schedule} schedule`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Tap to start a fast</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FastingWidgetFull({
  session,
  history,
  onStart,
  onEnd,
}: {
  session: FastingSession | null;
  history: FastingSession[];
  onStart: (schedule: FastingSchedule, fastHours: number) => void;
  onEnd: () => void;
}) {
  const { progress, label, overtime } = useFastProgress(session);
  const [selected, setSelected] = useState<FastingSchedule>("16:8");
  const [customHours, setCustomHours] = useState(16);
  const now = useNow(1000);

  const selectedHours =
    selected === "custom" ? customHours : SCHEDULES.find((s) => s.value === selected)?.fastHours ?? 16;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <ProgressRing
          progress={session ? progress : 0}
          size={220}
          strokeWidth={16}
          color={overtime ? "var(--brand)" : "var(--fasting)"}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tabular-nums">{session ? label : "00:00:00"}</span>
            <span className="text-xs font-medium text-muted">
              {session ? (overtime ? "goal reached" : "until goal") : "not fasting"}
            </span>
          </div>
        </ProgressRing>

        {session ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onEnd}
            className="mt-5 w-full rounded-2xl bg-danger/10 py-3 text-sm font-semibold text-danger"
          >
            End fast
          </motion.button>
        ) : (
          <div className="mt-5 w-full space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              {SCHEDULES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelected(s.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selected === s.value
                      ? "bg-fasting text-white"
                      : "bg-surface-muted text-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => setSelected("custom")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selected === "custom" ? "bg-fasting text-white" : "bg-surface-muted text-muted"
                }`}
              >
                Custom
              </button>
            </div>

            {selected === "custom" && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <input
                  type="range"
                  min={4}
                  max={48}
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                  className="w-40 accent-fasting"
                />
                <span className="font-semibold tabular-nums">{customHours}h fast</span>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onStart(selected, selectedHours)}
              className="w-full rounded-2xl bg-fasting py-3 text-sm font-semibold text-white"
            >
              Start {selectedHours}h fast
            </motion.button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-muted">Recent fasts</h3>
          <ul className="space-y-2">
            {history.slice(0, 8).map((f) => {
              const durationMs = (f.endedAt ? new Date(f.endedAt).getTime() : now) - new Date(f.startedAt).getTime();
              const hours = (durationMs / 3_600_000).toFixed(1);
              return (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {new Date(f.startedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {f.schedule}
                  </span>
                  <span className="font-semibold tabular-nums">{hours}h</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
