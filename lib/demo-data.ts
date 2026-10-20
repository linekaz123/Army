import type {
  DailyTargets,
  FastingSession,
  Meal,
  WaterLog,
  WeightEntry,
} from "./types";

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number, hour = 8) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const DEFAULT_TARGETS: DailyTargets = {
  calories: 2100,
  protein: 140,
  carbs: 220,
  fat: 65,
  waterMl: 2500,
};

export const DEMO_MEALS: Meal[] = [
  {
    id: "demo-meal-1",
    name: "Greek yogurt with blueberries & honey",
    portion: "1 bowl (~300g)",
    calories: 310,
    protein: 22,
    carbs: 42,
    fat: 6,
    imageUrl: null,
    source: "text",
    loggedAt: hoursAgo(7),
  },
  {
    id: "demo-meal-2",
    name: "Grilled chicken burrito bowl",
    portion: "1 bowl",
    calories: 640,
    protein: 48,
    carbs: 58,
    fat: 20,
    imageUrl: null,
    source: "scan",
    loggedAt: hoursAgo(3),
  },
  {
    id: "demo-meal-3",
    name: "Almonds",
    portion: "small handful (~28g)",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    imageUrl: null,
    source: "manual",
    loggedAt: hoursAgo(1),
  },
];

export const DEMO_WATER_LOGS: WaterLog[] = [
  { id: "demo-water-1", amountMl: 250, loggedAt: hoursAgo(8) },
  { id: "demo-water-2", amountMl: 250, loggedAt: hoursAgo(6) },
  { id: "demo-water-3", amountMl: 500, loggedAt: hoursAgo(3) },
];

export const DEMO_WEIGHT_HISTORY: WeightEntry[] = Array.from({ length: 10 }).map(
  (_, i) => {
    const daysBack = (9 - i) * 3;
    const trend = 82.4 - i * 0.35 + (i % 3 === 0 ? 0.3 : 0);
    return {
      id: `demo-weight-${i}`,
      weightKg: Math.round(trend * 10) / 10,
      loggedAt: daysAgo(daysBack, 7),
    };
  }
);

export const DEMO_FASTING_SESSIONS: FastingSession[] = [
  {
    id: "demo-fast-active",
    schedule: "16:8",
    fastHours: 16,
    startedAt: hoursAgo(9),
    endsAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    endedAt: null,
  },
];
