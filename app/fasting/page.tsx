"use client";

import { useAppData } from "@/context/AppDataContext";
import { Mascot } from "@/components/Mascot";
import { FastingWidgetFull } from "@/components/FastingWidget";

export default function FastingPage() {
  const { ready, activeFast, fastingSessions, startFast, endFast } = useAppData();

  if (!ready) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Mascot mood="neutral" size={96} />
        <p className="text-sm text-muted">Loading your fasting data...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-5 text-xl font-bold">Fasting</h1>
      <FastingWidgetFull
        session={activeFast}
        history={fastingSessions}
        onStart={startFast}
        onEnd={endFast}
      />
    </main>
  );
}
