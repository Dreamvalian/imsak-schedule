"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCountdownParts } from "@/lib/time";

export interface CountdownTimerProps {
  target: Date | null;
  label: string;
}

export default function CountdownTimer(props: CountdownTimerProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = getCountdownParts(props.target, now);
  const isComplete = parts.totalMs === 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-xs uppercase tracking-[0.25em] text-slate-300">
        {isComplete ? "Right now" : props.label}
      </span>
      <div className="flex items-center gap-3 text-3xl font-semibold tabular-nums sm:text-4xl md:text-5xl">
        <TimeUnit label="h" value={parts.hours} />
        <span className="text-slate-400">:</span>
        <TimeUnit label="m" value={parts.minutes} />
        <span className="text-slate-400">:</span>
        <TimeUnit label="s" value={parts.seconds} />
      </div>
    </div>
  );
}

function TimeUnit(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        key={props.value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl bg-slate-900/70 px-4 py-2 shadow-[0_0_0_1px_rgba(148,163,184,0.3)]"
      >
        {props.value}
      </motion.div>
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
        {props.label}
      </span>
    </div>
  );
}
