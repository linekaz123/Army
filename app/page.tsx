"use client";

import { AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { Mascot } from "@/components/Mascot";
import { MascotCard } from "@/components/MascotCard";
import { CalorieBudgetCard } from "@/components/CalorieBudgetCard";
import { MacroBars } from "@/components/MacroBars";
import { WaterTrackerCard } from "@/components/WaterTrackerCard";
import { FastingWidgetCompact } from "@/components/FastingWidget";
import { MealCard } from "@/components/MealCard";
import { getMascotState, sumMacros } from "@/lib/mascot";
import { calcStreak, isSameDay } from "@/lib/date-utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { ready, targets, meals, waterLogs, activeFast, deleteMeal, addWater } = useAppData();

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Mascot mood="neutral" size={96} />
        <p className="text-sm text-muted">Warming up your bites...</p>
      </div>
    );
  }

  const todayMeals = meals.filter((m) => isSameDay(m.loggedAt));
  const consumed = sumMacros(todayMeals);
  const todayWaterMl = waterLogs
    .filter((w) => isSameDay(w.loggedAt))
    .reduce((sum, w) => sum + w.amountMl, 0);
  const streak = calcStreak(meals.map((m) => m.loggedAt));
  const { mood, message } = getMascotState(targets, consumed, todayMeals.length);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">
            {getGreeting()}, ARMY <span className="text-brand">💜</span>
          </p>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-sm font-semibold text-brand-dark">
            <Heart size={14} fill="currentColor" />
            {streak}
          </div>
        )}
      </header>

      <div className="space-y-4">
        <MascotCard mood={mood} message={message} />

        <CalorieBudgetCard target={targets.calories} consumed={consumed.calories} />

        <MacroBars
          protein={consumed.protein}
          carbs={consumed.carbs}
          fat={consumed.fat}
          targets={targets}
        />

        <div className="grid grid-cols-1 gap-4">
          <WaterTrackerCard totalMl={todayWaterMl} targetMl={targets.waterMl} onAdd={addWater} />
          <FastingWidgetCompact session={activeFast} />
        </div>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-muted">Today&apos;s bites</h2>
          {todayMeals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Nothing logged yet — tap the + button to scan your first meal.
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {todayMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={deleteMeal} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
