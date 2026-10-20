"use client";

import { AnimatePresence } from "framer-motion";
import { useAppData } from "@/context/AppDataContext";
import { Mascot } from "@/components/Mascot";
import { MealCard } from "@/components/MealCard";
import { dayKey, formatDayHeading } from "@/lib/date-utils";

export default function HistoryPage() {
  const { ready, meals, deleteMeal } = useAppData();

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Mascot mood="neutral" size={96} />
        <p className="text-sm text-muted">Loading your history...</p>
      </div>
    );
  }

  const sorted = [...meals].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  const groups = new Map<string, typeof sorted>();
  for (const meal of sorted) {
    const key = dayKey(meal.loggedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(meal);
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-5 text-xl font-bold">History</h1>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 pt-16 text-center">
          <Mascot mood="sleepy" size={96} />
          <p className="text-sm text-muted">No meals logged yet. Your history will show up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([key, dayMeals]) => {
            const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
            return (
              <section key={key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-muted">
                    {formatDayHeading(dayMeals[0].loggedAt)}
                  </h2>
                  <span className="text-xs font-medium text-muted">{totalCalories} kcal</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {dayMeals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} onDelete={deleteMeal} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
