"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Moon, SunMedium, MonitorSmartphone } from "lucide-react";
import type { AppPreferences, CalculationMethod, ThemePreference } from "@/lib/types";
import LocationPicker from "./LocationPicker";

export interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: AppPreferences;
  onPreferencesChange: (preferences: AppPreferences) => void;
  locationCity: string;
  locationCountry?: string;
  onLocationChange: (location: {
    lat: number;
    lng: number;
    city: string;
    country?: string;
  }) => void;
}

const calculationMethods: { value: CalculationMethod; label: string }[] = [
  { value: "MWL", label: "Muslim World League (MWL)" },
  { value: "ISNA", label: "ISNA" },
  { value: "Makkah", label: "Umm al-Qura, Makkah" },
  { value: "Egyptian", label: "Egyptian General Authority" },
  { value: "Karachi", label: "Karachi" },
  { value: "Tehran", label: "Tehran" },
  { value: "Jafari", label: "Jafari" }
];

const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
  { value: "light", label: "Light", icon: <SunMedium className="h-3.5 w-3.5" /> },
  { value: "system", label: "System", icon: <MonitorSmartphone className="h-3.5 w-3.5" /> }
];

export default function SettingsDrawer(props: SettingsDrawerProps) {
  function updatePreferences(patch: Partial<AppPreferences>) {
    props.onPreferencesChange({
      ...props.preferences,
      ...patch
    });
  }

  return (
    <AnimatePresence>
      {props.open && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => props.onOpenChange(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-950/95 px-5 py-6 shadow-2xl sm:px-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <header className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                    Settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Personalize imsak, calculation method, theme, and location.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => props.onOpenChange(false)}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 hover:border-slate-500"
              >
                Close
              </button>
            </header>
            <div className="flex-1 space-y-6 overflow-y-auto pr-1 scrollbar-thin">
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium uppercase tracking-[0.18em]">
                    Imsak offset
                  </span>
                  <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[0.65rem] text-slate-300">
                    {props.preferences.imsakOffsetMinutes} minutes before Fajr
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min={10}
                    max={15}
                    step={1}
                    value={props.preferences.imsakOffsetMinutes}
                    onChange={(event) =>
                      updatePreferences({
                        imsakOffsetMinutes: Number(event.target.value)
                      })
                    }
                    className="w-full accent-emerald-400"
                  />
                </div>
              </section>
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium uppercase tracking-[0.18em]">
                    Calculation method
                  </span>
                </div>
                <select
                  value={props.preferences.calculationMethod}
                  onChange={(event) =>
                    updatePreferences({
                      calculationMethod: event.target.value as CalculationMethod
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                >
                  {calculationMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </section>
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium uppercase tracking-[0.18em]">
                    Theme
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((theme) => {
                    const isActive = props.preferences.theme === theme.value;
                    return (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() =>
                          updatePreferences({
                            theme: theme.value
                          })
                        }
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs ${
                          isActive
                            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                            : "border-slate-700 bg-slate-950 text-slate-200"
                        }`}
                      >
                        <span className="rounded-full bg-slate-900/80 p-1 text-emerald-300">
                          {theme.icon}
                        </span>
                        <span>{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <LocationPicker
                  city={props.locationCity}
                  country={props.locationCountry}
                  onLocationChange={props.onLocationChange}
                />
              </section>
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium uppercase tracking-[0.18em]">
                    Notifications
                  </span>
                  <span className="text-[0.7rem] text-slate-400">
                    10 minutes before Imsak and at Iftar
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePreferences({
                      notificationsEnabled: !props.preferences.notificationsEnabled
                    })
                  }
                  className={`inline-flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                    props.preferences.notificationsEnabled
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                      : "border-slate-700 bg-slate-950 text-slate-200"
                  }`}
                >
                  <span>
                    {props.preferences.notificationsEnabled
                      ? "Notifications enabled"
                      : "Enable browser notifications"}
                  </span>
                  <span
                    className={`ml-2 inline-flex h-5 w-9 items-center rounded-full border ${
                      props.preferences.notificationsEnabled
                        ? "border-emerald-400 bg-emerald-500/40"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        props.preferences.notificationsEnabled
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </button>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
