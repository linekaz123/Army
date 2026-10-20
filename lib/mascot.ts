import type { DailyTargets, Macro, MascotMood, Meal } from "./types";

export function sumMacros(meals: Meal[]): Macro {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function getMascotState(
  targets: DailyTargets,
  consumed: Macro,
  mealsLoggedToday: number
): { mood: MascotMood; message: string } {
  const calorieRatio = targets.calories > 0 ? consumed.calories / targets.calories : 0;
  const proteinRatio = targets.protein > 0 ? consumed.protein / targets.protein : 0;
  const hour = new Date().getHours();

  if (mealsLoggedToday === 0) {
    if (hour < 11) {
      return { mood: "neutral", message: "Good morning! Let's log your first bite." };
    }
    return { mood: "sleepy", message: "Nothing logged yet today — I'm getting hungry too." };
  }

  if (calorieRatio > 1.15) {
    return {
      mood: "encouraging",
      message: "A bit over budget today — a lighter dinner balances it out nicely.",
    };
  }

  if (calorieRatio >= 0.85 && calorieRatio <= 1.05 && proteinRatio >= 0.8) {
    return { mood: "ecstatic", message: "You're crushing your targets today!" };
  }

  if (proteinRatio < 0.45 && hour >= 15) {
    return {
      mood: "encouraging",
      message: "Protein's lagging a bit — a snack with protein would help.",
    };
  }

  if (calorieRatio < 0.5 && hour >= 18) {
    return {
      mood: "neutral",
      message: "Quite a bit of your budget is left — make sure you're eating enough.",
    };
  }

  return { mood: "happy", message: "Nice progress today — keep it up!" };
}

export function getMealInsight(meal: Pick<Meal, "calories" | "protein" | "carbs" | "fat">): string {
  const { calories, protein, carbs, fat } = meal;
  const totalMacroCals = protein * 4 + carbs * 4 + fat * 9;
  const proteinShare = totalMacroCals > 0 ? (protein * 4) / totalMacroCals : 0;

  if (protein >= 25 && proteinShare > 0.3) return "Solid protein intake — great for staying full!";
  if (calories > 750) return "That's a calorie-dense meal — maybe keep the next one lighter.";
  if (fat > 0 && (fat * 9) / Math.max(calories, 1) > 0.5) return "High in fats today — balance with veggies later.";
  if (carbs > 70 && proteinShare < 0.15) return "Carb-heavy pick — pair your next meal with some protein.";
  if (calories < 150) return "Light snack logged — don't forget to hydrate!";
  return "Nicely logged! Keep the momentum going.";
}
