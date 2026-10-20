"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <Mascot mood="sleepy" size={100} />
        <h1 className="mt-4 text-lg font-bold">Accounts aren&apos;t set up yet</h1>
        <p className="mt-2 text-sm text-muted">
          This BitePal install is running in guest mode. Add Supabase keys to .env.local to enable
          accounts and cross-device sync — see the README.
        </p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("sign-in");
    }
  }

  return (
    <main className="mx-auto flex min-h-[90vh] max-w-md flex-col justify-center px-6">
      <div className="mb-6 flex flex-col items-center">
        <Mascot mood="happy" size={110} />
        <h1 className="mt-3 text-xl font-bold">
          {mode === "sign-in" ? "Welcome back" : "Join BitePal"}
        </h1>
        <p className="text-sm text-muted">Borahae — let&apos;s sync your bites 💜</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Mail size={16} className="text-muted" />
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Lock size={16} className="text-muted" />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {error && <p className="text-center text-sm text-danger">{error}</p>}
        {notice && <p className="text-center text-sm text-brand-dark">{notice}</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </motion.button>
      </form>

      <button
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="mt-4 text-center text-sm text-muted"
      >
        {mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
