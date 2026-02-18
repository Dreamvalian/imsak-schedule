"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { PrayerDay } from "@/lib/types";

export interface RamadanCalendarProps {
  days: PrayerDay[];
  activeIndex: number | null;
  todayIndex: number | null;
  onSelectDay?: (index: number) => void;
}

export default function RamadanCalendar(props: RamadanCalendarProps) {
  if (!props.days.length) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-950/80 px-4 py-4 shadow-xl sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Full Ramadan Schedule
          </h2>
          <p className="text-xs text-slate-400">
            Scroll to browse each day of the month.
          </p>
        </div>
      </div>
      <div className="mt-1 max-h-80 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
        {props.days.map((day, index) => {
          const isActive = props.activeIndex === index;
          const isToday = props.todayIndex === index;
          const ramadanDay = index + 1;
          return (
            <CalendarRow
              key={day.date + index.toString()}
              day={day}
              ramadanDay={ramadanDay}
              isActive={isActive}
              isToday={isToday}
              onClick={() => props.onSelectDay?.(index)}
            />
          );
        })}
      </div>
    </section>
  );
}

interface CalendarRowProps {
  day: PrayerDay;
  ramadanDay: number;
  isActive: boolean;
  isToday: boolean;
  onClick: () => void;
}

function CalendarRow(props: CalendarRowProps) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={props.onClick}
        className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
          props.isActive
            ? "bg-slate-800/80"
            : props.isToday
              ? "bg-slate-900/70"
              : "bg-slate-950/60"
        } ${props.isToday ? "border border-emerald-400/40" : ""}`}
      >
        <div className="flex w-20 flex-col text-xs text-slate-300 sm:w-24">
          <span className="font-semibold text-slate-100">
            Day {props.ramadanDay}
          </span>
          {props.isToday && (
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-300">
              Today
            </span>
          )}
        </div>
        <div className="hidden flex-1 flex-col text-xs text-slate-300 sm:flex">
          <span>{props.day.readableDateLabel}</span>
        </div>
        <div className="ml-auto grid grid-cols-3 gap-2 text-xs tabular-nums text-slate-100 sm:w-52 sm:text-sm">
          <TimeCell label="Imsak" value={props.day.imsak} />
          <TimeCell label="Fajr" value={props.day.fajr} />
          <TimeCell label="Iftar" value={props.day.maghrib} />
        </div>
        <ChevronDown
          className={`ml-1 h-4 w-4 text-slate-400 transition-transform ${
            props.isActive ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {props.isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-800/80 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 sm:px-4 sm:py-3"
          >
            <p>{props.day.hijriDate}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeCell(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">
        {props.label}
      </span>
      <span>{props.value}</span>
    </div>
  );
}
