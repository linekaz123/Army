"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { newId, loadLocal, saveLocal } from "@/lib/local-store";
import {
  DEFAULT_TARGETS,
  DEMO_FASTING_SESSIONS,
  DEMO_MEALS,
  DEMO_WATER_LOGS,
  DEMO_WEIGHT_HISTORY,
} from "@/lib/demo-data";
import type {
  DailyTargets,
  FastingSchedule,
  FastingSession,
  Meal,
  WaterLog,
  WeightEntry,
} from "@/lib/types";

type AppDataContextValue = {
  ready: boolean;
  mode: "supabase" | "demo";
  user: User | null;
  targets: DailyTargets;
  meals: Meal[];
  waterLogs: WaterLog[];
  weightHistory: WeightEntry[];
  fastingSessions: FastingSession[];
  activeFast: FastingSession | null;
  addMeal: (meal: Omit<Meal, "id">) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
  addWeight: (weightKg: number) => Promise<void>;
  startFast: (schedule: FastingSchedule, fastHours: number) => Promise<void>;
  endFast: () => Promise<void>;
  updateTargets: (partial: Partial<DailyTargets>) => Promise<void>;
  uploadFoodPhoto: (dataUrl: string, base64: string, mimeType: string) => Promise<string>;
  signOut: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function rowToMeal(row: Record<string, unknown>): Meal {
  return {
    id: row.id as string,
    name: row.name as string,
    portion: (row.portion as string) ?? "",
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    carbs: Number(row.carbs) || 0,
    fat: Number(row.fat) || 0,
    imageUrl: (row.image_url as string) ?? null,
    source: (row.source as Meal["source"]) ?? "manual",
    loggedAt: row.logged_at as string,
  };
}

function rowToWeight(row: Record<string, unknown>): WeightEntry {
  return {
    id: row.id as string,
    weightKg: Number(row.weight_kg) || 0,
    loggedAt: row.logged_at as string,
  };
}

function rowToWater(row: Record<string, unknown>): WaterLog {
  return {
    id: row.id as string,
    amountMl: Number(row.amount_ml) || 0,
    loggedAt: row.logged_at as string,
  };
}

function rowToFasting(row: Record<string, unknown>): FastingSession {
  return {
    id: row.id as string,
    schedule: (row.schedule as FastingSchedule) ?? "16:8",
    fastHours: Number(row.fast_hours) || 16,
    startedAt: row.started_at as string,
    endsAt: row.ends_at as string,
    endedAt: (row.ended_at as string) ?? null,
  };
}

const sinceDays = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"supabase" | "demo">("demo");
  const [user, setUser] = useState<User | null>(null);
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [fastingSessions, setFastingSessions] = useState<FastingSession[]>([]);

  const loadDemo = useCallback(() => {
    setMode("demo");
    setUser(null);
    setTargets(loadLocal("targets", DEFAULT_TARGETS));
    setMeals(loadLocal("meals", DEMO_MEALS));
    setWaterLogs(loadLocal("water", DEMO_WATER_LOGS));
    setWeightHistory(loadLocal("weight", DEMO_WEIGHT_HISTORY));
    setFastingSessions(loadLocal("fasting", DEMO_FASTING_SESSIONS));
    setReady(true);
  }, []);

  const loadFromSupabase = useCallback(
    async (activeUser: User) => {
      if (!supabase) return;
      setMode("supabase");
      setUser(activeUser);

      const [profileRes, mealsRes, waterRes, weightRes, fastingRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", activeUser.id).maybeSingle(),
          supabase
            .from("meals")
            .select("*")
            .gte("logged_at", sinceDays(30))
            .order("logged_at", { ascending: false }),
          supabase
            .from("water_logs")
            .select("*")
            .gte("logged_at", sinceDays(7))
            .order("logged_at", { ascending: false }),
          supabase
            .from("weight_logs")
            .select("*")
            .gte("logged_at", sinceDays(180))
            .order("logged_at", { ascending: false }),
          supabase
            .from("fasting_sessions")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(20),
        ]);

      if (profileRes.data) {
        setTargets({
          calories: profileRes.data.calorie_target,
          protein: profileRes.data.protein_target,
          carbs: profileRes.data.carbs_target,
          fat: profileRes.data.fat_target,
          waterMl: profileRes.data.water_target_ml,
        });
      } else {
        setTargets(DEFAULT_TARGETS);
      }
      setMeals((mealsRes.data ?? []).map(rowToMeal));
      setWaterLogs((waterRes.data ?? []).map(rowToWater));
      setWeightHistory((weightRes.data ?? []).map(rowToWeight));
      setFastingSessions((fastingRes.data ?? []).map(rowToFasting));
      setReady(true);
    },
    [supabase]
  );

  useEffect(() => {
    let cancelled = false;

    if (!supabase) {
      // Deferred to a microtask so we never call setState synchronously
      // from within the effect body itself.
      Promise.resolve().then(() => {
        if (!cancelled) loadDemo();
      });
      return () => {
        cancelled = true;
      };
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) {
        loadFromSupabase(data.user);
      } else {
        loadDemo();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadFromSupabase(session.user);
      } else {
        loadDemo();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Persist demo-mode state to localStorage so a guest's data survives reloads.
  useEffect(() => {
    if (mode === "demo" && ready) saveLocal("meals", meals);
  }, [mode, ready, meals]);
  useEffect(() => {
    if (mode === "demo" && ready) saveLocal("water", waterLogs);
  }, [mode, ready, waterLogs]);
  useEffect(() => {
    if (mode === "demo" && ready) saveLocal("weight", weightHistory);
  }, [mode, ready, weightHistory]);
  useEffect(() => {
    if (mode === "demo" && ready) saveLocal("fasting", fastingSessions);
  }, [mode, ready, fastingSessions]);
  useEffect(() => {
    if (mode === "demo" && ready) saveLocal("targets", targets);
  }, [mode, ready, targets]);

  const addMeal = useCallback<AppDataContextValue["addMeal"]>(
    async (meal) => {
      const optimistic: Meal = { ...meal, id: newId() };
      setMeals((prev) => [optimistic, ...prev]);

      if (mode === "supabase" && supabase && user) {
        const { data, error } = await supabase
          .from("meals")
          .insert({
            user_id: user.id,
            name: optimistic.name,
            portion: optimistic.portion,
            calories: optimistic.calories,
            protein: optimistic.protein,
            carbs: optimistic.carbs,
            fat: optimistic.fat,
            image_url: optimistic.imageUrl,
            source: optimistic.source,
            logged_at: optimistic.loggedAt,
          })
          .select()
          .single();
        if (!error && data) {
          setMeals((prev) =>
            prev.map((m) => (m.id === optimistic.id ? rowToMeal(data) : m))
          );
        }
      }
    },
    [mode, supabase, user]
  );

  const deleteMeal = useCallback<AppDataContextValue["deleteMeal"]>(
    async (id) => {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      if (mode === "supabase" && supabase && user) {
        await supabase.from("meals").delete().eq("id", id);
      }
    },
    [mode, supabase, user]
  );

  const addWater = useCallback<AppDataContextValue["addWater"]>(
    async (amountMl) => {
      const optimistic: WaterLog = {
        id: newId(),
        amountMl,
        loggedAt: new Date().toISOString(),
      };
      setWaterLogs((prev) => [optimistic, ...prev]);
      if (mode === "supabase" && supabase && user) {
        const { data, error } = await supabase
          .from("water_logs")
          .insert({
            user_id: user.id,
            amount_ml: amountMl,
            logged_at: optimistic.loggedAt,
          })
          .select()
          .single();
        if (!error && data) {
          setWaterLogs((prev) =>
            prev.map((w) => (w.id === optimistic.id ? rowToWater(data) : w))
          );
        }
      }
    },
    [mode, supabase, user]
  );

  const addWeight = useCallback<AppDataContextValue["addWeight"]>(
    async (weightKg) => {
      const optimistic: WeightEntry = {
        id: newId(),
        weightKg,
        loggedAt: new Date().toISOString(),
      };
      setWeightHistory((prev) =>
        [optimistic, ...prev].sort(
          (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        )
      );
      if (mode === "supabase" && supabase && user) {
        const { data, error } = await supabase
          .from("weight_logs")
          .insert({
            user_id: user.id,
            weight_kg: weightKg,
            logged_at: optimistic.loggedAt,
          })
          .select()
          .single();
        if (!error && data) {
          setWeightHistory((prev) =>
            prev.map((w) => (w.id === optimistic.id ? rowToWeight(data) : w))
          );
        }
      }
    },
    [mode, supabase, user]
  );

  const startFast = useCallback<AppDataContextValue["startFast"]>(
    async (schedule, fastHours) => {
      const startedAt = new Date().toISOString();
      const endsAt = new Date(Date.now() + fastHours * 60 * 60 * 1000).toISOString();
      const optimistic: FastingSession = {
        id: newId(),
        schedule,
        fastHours,
        startedAt,
        endsAt,
        endedAt: null,
      };
      setFastingSessions((prev) => [optimistic, ...prev]);
      if (mode === "supabase" && supabase && user) {
        const { data, error } = await supabase
          .from("fasting_sessions")
          .insert({
            user_id: user.id,
            schedule,
            fast_hours: fastHours,
            started_at: startedAt,
            ends_at: endsAt,
          })
          .select()
          .single();
        if (!error && data) {
          setFastingSessions((prev) =>
            prev.map((f) => (f.id === optimistic.id ? rowToFasting(data) : f))
          );
        }
      }
    },
    [mode, supabase, user]
  );

  const endFast = useCallback<AppDataContextValue["endFast"]>(async () => {
    const endedAt = new Date().toISOString();
    let activeId: string | null = null;
    setFastingSessions((prev) =>
      prev.map((f) => {
        if (!f.endedAt && !activeId) {
          activeId = f.id;
          return { ...f, endedAt };
        }
        return f;
      })
    );
    if (mode === "supabase" && supabase && user && activeId) {
      await supabase.from("fasting_sessions").update({ ended_at: endedAt }).eq(
        "id",
        activeId
      );
    }
  }, [mode, supabase, user]);

  const updateTargets = useCallback<AppDataContextValue["updateTargets"]>(
    async (partial) => {
      setTargets((prev) => ({ ...prev, ...partial }));
      if (mode === "supabase" && supabase && user) {
        const next = { ...targets, ...partial };
        await supabase.from("profiles").upsert({
          id: user.id,
          calorie_target: next.calories,
          protein_target: next.protein,
          carbs_target: next.carbs,
          fat_target: next.fat,
          water_target_ml: next.waterMl,
        });
      }
    },
    [mode, supabase, user, targets]
  );

  const uploadFoodPhoto = useCallback<AppDataContextValue["uploadFoodPhoto"]>(
    async (dataUrl, base64, mimeType) => {
      if (mode === "supabase" && supabase && user) {
        try {
          const ext = mimeType.split("/")[1] || "jpg";
          const path = `${user.id}/${Date.now()}.${ext}`;
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const { error } = await supabase.storage
            .from("food-photos")
            .upload(path, bytes, { contentType: mimeType, upsert: false });
          if (!error) {
            const { data } = supabase.storage.from("food-photos").getPublicUrl(path);
            return data.publicUrl;
          }
        } catch (err) {
          console.error("photo upload failed, falling back to inline image", err);
        }
      }
      // Demo mode or upload failure: keep the compressed image inline.
      return dataUrl;
    },
    [mode, supabase, user]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    loadDemo();
  }, [supabase, loadDemo]);

  const activeFast = useMemo(
    () => fastingSessions.find((f) => !f.endedAt) ?? null,
    [fastingSessions]
  );

  const value: AppDataContextValue = {
    ready,
    mode,
    user,
    targets,
    meals,
    waterLogs,
    weightHistory,
    fastingSessions,
    activeFast,
    addMeal,
    deleteMeal,
    addWater,
    addWeight,
    startFast,
    endFast,
    updateTargets,
    uploadFoodPhoto,
    signOut,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
