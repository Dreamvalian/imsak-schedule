"use client";

import { useEffect, useState } from "react";
import type { TimePhase } from "@/lib/time";
import { getTimePhase, phaseToBackgroundClass } from "@/lib/time";

export default function BackgroundWrapper(props: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<TimePhase>(() => getTimePhase(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase(getTimePhase(new Date()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const backgroundClass = phaseToBackgroundClass(phase);

  return (
    <div
      className={`${backgroundClass} min-h-screen w-full text-slate-100 transition-colors duration-700`}
    >
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(251,191,36,0.2),_transparent_60%)]" />
        <div className="relative z-10 w-full max-w-6xl">{props.children}</div>
      </div>
    </div>
  );
}
