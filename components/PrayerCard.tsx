"use client";

import { formatTime } from "@/lib/time";
import type { TodayTimes } from "@/lib/types";
import { motion } from "framer-motion";
import { Clock, MapPin, MoonStar, SunMedium, Sunset } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

export interface PrayerCardProps {
  city: string;
  country?: string;
  gregorianLabel: string;
  hijriLabel: string;
  ramadanDayNumber: number | null;
  todayTimes: TodayTimes;
  nextCountdownLabel: string;
  nextCountdownTarget: Date | null;
  timezone: string;
}

export default function PrayerCard(props: PrayerCardProps) {
  const locationLabel = props.country
    ? `${props.city}, ${props.country}`
    : props.city || "Detecting location";

  const primaryLine = props.ramadanDayNumber
    ? `Ramadan Day ${props.ramadanDayNumber}`
    : props.hijriLabel;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='glass-surface relative overflow-hidden rounded-3xl px-6 py-7 shadow-2xl ring-1 ring-slate-800/80 sm:px-8 sm:py-8 lg:px-10 lg:py-9'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%)]' />
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-amber-500/5' />
      <div className='relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3 text-sm text-slate-300'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300'>
              <MapPin className='h-3 w-3' />
              {locationLabel}
            </span>
            <span className='inline-flex items-center gap-1.5 text-xs text-slate-400'>
              <Clock className='h-3 w-3' />
              {props.timezone}
            </span>
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl md:text-4xl'>
              Ramadhan Time Companion
            </h1>
            <p className='text-sm text-slate-300'>
              {primaryLine} · {props.gregorianLabel}
            </p>
            <p className='text-xs text-slate-400'>{props.hijriLabel}</p>
          </div>
          <div className='grid grid-cols-3 gap-3 pt-2 text-sm text-slate-200 sm:gap-4 sm:text-base'>
            <TimePill
              label='Imsak'
              icon={<MoonStar className='h-4 w-4 text-emerald-300' />}
              highlight
              value={formatTime(props.todayTimes.imsak)}
            />
            <TimePill
              label='Fajr'
              icon={<SunMedium className='h-4 w-4 text-sky-300' />}
              value={formatTime(props.todayTimes.fajr)}
            />
            <TimePill
              label='Iftar'
              icon={<Sunset className='h-4 w-4 text-amber-300' />}
              value={formatTime(props.todayTimes.maghrib)}
            />
          </div>
        </div>
        <div className='mt-2 flex w-full items-center justify-center md:mt-0 md:max-w-xs'>
          <div className='w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-4 shadow-lg'>
            <CountdownTimer
              target={props.nextCountdownTarget}
              label={props.nextCountdownLabel}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function TimePill(props: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border px-3 py-2 sm:px-4 sm:py-3 ${
        props.highlight
          ? "border-emerald-400/60 bg-emerald-400/10"
          : "border-slate-600/70 bg-slate-900/60"
      }`}>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-xs uppercase tracking-[0.2em] text-slate-300'>
          {props.label}
        </span>
        <span>{props.icon}</span>
      </div>
      <div className='text-lg font-semibold tabular-nums sm:text-xl'>
        {props.value}
      </div>
    </div>
  );
}
