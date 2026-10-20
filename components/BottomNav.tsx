"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ClipboardList, Timer, LineChart, Plus } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: ClipboardList },
  { href: "/fasting", label: "Fasting", icon: Timer },
  { href: "/progress", label: "Progress", icon: LineChart },
] as const;

export function BottomNav({ onLogClick }: { onLogClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-lg safe-bottom">
      <div className="relative mx-auto flex max-w-md items-center justify-between px-6 pt-2">
        {TABS.slice(0, 2).map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2"
            >
              <Icon size={22} className={active ? "text-brand-dark" : "text-muted"} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[11px] font-medium ${active ? "text-brand-dark" : "text-muted"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        <div className="flex flex-1 justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLogClick}
            aria-label="Log food"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.button>
        </div>

        {TABS.slice(2).map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2"
            >
              <Icon size={22} className={active ? "text-brand-dark" : "text-muted"} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[11px] font-medium ${active ? "text-brand-dark" : "text-muted"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
