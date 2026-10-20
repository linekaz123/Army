"use client";

import { useEffect, useRef, useState } from "react";
import { BottomNav } from "./BottomNav";
import { BottomSheet } from "./BottomSheet";
import { LogFoodSheet } from "./LogFoodSheet";
import { FoodReviewModal } from "./FoodReviewModal";
import { MascotToast } from "./Toast";
import { useAppData } from "@/context/AppDataContext";
import { getMealInsight } from "@/lib/mascot";
import type { FoodAnalysis, Meal } from "@/lib/types";

type Pending = {
  analysis: FoodAnalysis;
  source: Meal["source"];
  imageUrl: string | null;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { addMeal, uploadFoodPhoto } = useAppData();
  const [logOpen, setLogOpen] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function handleResult(analysis: FoodAnalysis, meta: { source: Meal["source"]; imageUrl: string | null }) {
    setPending({ analysis, ...meta });
    setLogOpen(false);
  }

  async function handleSave(meal: Omit<Meal, "id">) {
    let finalImageUrl = meal.imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith("data:")) {
      const [, base64 = ""] = finalImageUrl.split(",");
      const mimeMatch = /data:(.*?);base64/.exec(finalImageUrl);
      finalImageUrl = await uploadFoodPhoto(finalImageUrl, base64, mimeMatch?.[1] || "image/jpeg");
    }

    await addMeal({ ...meal, imageUrl: finalImageUrl });
    setPending(null);

    const insight = getMealInsight(meal);
    setToast(insight);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }

  return (
    <>
      <div className="pb-safe-nav">{children}</div>

      <BottomNav onLogClick={() => setLogOpen(true)} />

      <BottomSheet open={logOpen} onClose={() => setLogOpen(false)} title="Log a meal">
        <LogFoodSheet onResult={handleResult} />
      </BottomSheet>

      <FoodReviewModal pending={pending} onClose={() => setPending(null)} onSave={handleSave} />

      <MascotToast message={toast} mood="happy" />
    </>
  );
}
