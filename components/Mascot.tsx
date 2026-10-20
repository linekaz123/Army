"use client";

import { motion } from "framer-motion";
import type { MascotMood } from "@/lib/types";

// Kooky — an original pink bunny-eared companion with a little attitude
// (tough-on-the-outside, soft-on-the-inside vibe) — not a reproduction of
// any copyrighted character artwork, just drawn in our own linework.
const BODY_COLORS: Record<MascotMood, [string, string]> = {
  ecstatic: ["#f9a8d4", "#db2777"],
  happy: ["#f9a8d4", "#ec4899"],
  neutral: ["#fbcfe8", "#f472b6"],
  encouraging: ["#fde68a", "#f0b429"],
  sleepy: ["#bfdbfe", "#93c5fd"],
};

const INNER_EAR = "#fef3c7";
const HAIR_CLIP = "#fbbf24";

function HeartClip() {
  return (
    <motion.g
      style={{ transformOrigin: "158px 62px" }}
      animate={{ rotate: [-6, 6, -6] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
    >
      <path
        d="M158 58 C154 52 146 54 146 60 C146 66 152 70 158 75 C164 70 170 66 170 60 C170 54 162 52 158 58 Z"
        fill={HAIR_CLIP}
        stroke="#fff7ed"
        strokeWidth="1.5"
      />
    </motion.g>
  );
}

function Sparkle({
  x,
  y,
  scale = 1,
  delay = 0,
  color = "#f9a8d4",
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.path
        d="M0,-11 C1,-3 3,-1 11,0 C3,1 1,3 0,11 C-1,3 -3,1 -11,0 C-3,-1 -1,-3 0,-11 Z"
        fill={color}
        style={{ transformOrigin: "0px 0px" }}
        animate={{ opacity: [0.2, 1, 0.2], scale: [scale * 0.5, scale, scale * 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </g>
  );
}

function Ears({ mood }: { mood: MascotMood }) {
  const [, outer] = BODY_COLORS[mood];
  return (
    <>
      <motion.g
        style={{ transformOrigin: "98px 70px" }}
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="98" cy="34" rx="18" ry="40" fill={outer} />
        <ellipse cx="98" cy="38" rx="8" ry="26" fill={INNER_EAR} />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "142px 70px" }}
        animate={{ rotate: [4, -4, 4] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
      >
        <ellipse cx="142" cy="34" rx="18" ry="40" fill={outer} />
        <ellipse cx="142" cy="38" rx="8" ry="26" fill={INNER_EAR} />
      </motion.g>
    </>
  );
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === "sleepy") {
    return (
      <>
        <path d="M78 110 Q90 120 102 110" stroke="#211a33" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M138 110 Q150 120 162 110" stroke="#211a33" strokeWidth="5" strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (mood === "ecstatic") {
    return (
      <>
        <path d="M80 114 L90 104 M80 104 L90 114" stroke="#211a33" strokeWidth="6" strokeLinecap="round" />
        <path d="M140 114 L150 104 M140 104 L150 114" stroke="#211a33" strokeWidth="6" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      {mood === "happy" && (
        <path
          d="M142 92 Q152 86 162 90"
          stroke="#211a33"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}
      <motion.circle
        className="animate-blink"
        cx="90"
        cy="111"
        r="7"
        fill="#211a33"
        style={{ transformOrigin: "90px 111px" }}
      />
      <motion.circle
        className="animate-blink"
        cx="150"
        cy="111"
        r="7"
        fill="#211a33"
        style={{ transformOrigin: "150px 111px" }}
      />
    </>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case "ecstatic":
      return <path d="M95 132 Q120 160 145 132" stroke="#211a33" strokeWidth="6" strokeLinecap="round" fill="none" />;
    case "happy":
      return <path d="M98 134 Q120 152 142 134" stroke="#211a33" strokeWidth="5" strokeLinecap="round" fill="none" />;
    case "encouraging":
      return <path d="M100 142 Q120 136 140 142" stroke="#211a33" strokeWidth="5" strokeLinecap="round" fill="none" />;
    case "sleepy":
      return <circle cx="120" cy="138" r="6" fill="#211a33" opacity={0.7} />;
    default:
      return <path d="M102 138 L138 138" stroke="#211a33" strokeWidth="5" strokeLinecap="round" />;
  }
}

export function Mascot({
  mood = "happy",
  size = 140,
  className = "",
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  const [from, to] = BODY_COLORS[mood];
  const gradientId = `mascot-grad-${mood}`;

  return (
    <motion.svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      {(mood === "ecstatic" || mood === "happy") && (
        <>
          <Sparkle x={38} y={64} scale={1} delay={0} />
          <Sparkle x={202} y={100} scale={0.8} delay={0.5} color="#fde68a" />
          <Sparkle x={196} y={190} scale={0.9} delay={1} color="#c4b5fd" />
        </>
      )}

      <Ears mood={mood} />
      <HeartClip />

      {/* body */}
      <circle cx="120" cy="140" r="82" fill={`url(#${gradientId})`} />

      {/* hoodie collar peeking out beneath the face */}
      <ellipse cx="120" cy="180" rx="54" ry="26" fill="var(--brand)" />

      {/* face plate */}
      <circle cx="120" cy="122" r="54" fill="#ffffff" />

      {/* cheeks */}
      {mood !== "sleepy" && (
        <>
          <circle cx="80" cy="136" r="8" fill="#fecaca" opacity={0.7} />
          <circle cx="160" cy="136" r="8" fill="#fecaca" opacity={0.7} />
        </>
      )}

      <Eyes mood={mood} />
      <Mouth mood={mood} />

      {mood === "sleepy" && (
        <motion.text
          x="172"
          y="54"
          fontSize="22"
          fill="#ec4899"
          fontWeight="bold"
          animate={{ opacity: [0.3, 1, 0.3], y: [54, 42, 54] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          z
        </motion.text>
      )}
    </motion.svg>
  );
}
