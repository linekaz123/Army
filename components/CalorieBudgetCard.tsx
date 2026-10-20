"use client";

import { Flame } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

export function CalorieBudgetCard({
  target,
  consumed,
}: {
  target: number;
  consumed: number;
}) {
  const remaining = target - consumed;
  const progress = target > 0 ? consumed / target : 0;
  const isOver = remaining < 0;

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">Calorie budget</h2>
        <div className="flex items-center gap-1 text-xs font-medium text-muted">
          <Flame size={14} className="text-protein" />
          {target.toLocaleString()} kcal goal
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <ProgressRing
          progress={progress}
          size={192}
          strokeWidth={16}
          color={isOver ? "var(--danger)" : "var(--brand)"}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-4xl font-bold tabular-nums ${
                isOver ? "text-danger" : "text-foreground"
              }`}
            >
              {Math.abs(remaining).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-muted">
              {isOver ? "kcal over" : "kcal left"}
            </span>
          </div>
        </ProgressRing>
      </div>

      <div className="mt-4 flex items-center justify-around text-center">
        <div>
          <p className="text-base font-semibold">{consumed.toLocaleString()}</p>
          <p className="text-xs text-muted">Consumed</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-base font-semibold">{target.toLocaleString()}</p>
          <p className="text-xs text-muted">Target</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className={`text-base font-semibold ${isOver ? "text-danger" : ""}`}>
            {remaining.toLocaleString()}
          </p>
          <p className="text-xs text-muted">Remaining</p>
        </div>
      </div>
    </div>
  );
}
