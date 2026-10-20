export type Macro = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string | null;
  source: "scan" | "text" | "manual";
  loggedAt: string; // ISO timestamp
};

export type WeightEntry = {
  id: string;
  weightKg: number;
  loggedAt: string; // ISO timestamp
};

export type WaterLog = {
  id: string;
  amountMl: number;
  loggedAt: string; // ISO timestamp
};

export type FastingSchedule = "16:8" | "14:10" | "18:6" | "20:4" | "custom";

export type FastingSession = {
  id: string;
  schedule: FastingSchedule;
  fastHours: number;
  startedAt: string; // ISO timestamp
  endsAt: string; // ISO timestamp
  endedAt: string | null;
};

export type DailyTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
};

export type MascotMood = "ecstatic" | "happy" | "neutral" | "encouraging" | "sleepy";

export type FoodAnalysis = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  note?: string;
};
