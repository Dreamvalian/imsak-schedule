import { z } from "zod";
import type {
  AppPreferences,
  CalculationMethod,
  ThemePreference,
} from "./types";

const calculationMethodEnum = z.enum([
  "MWL",
  "ISNA",
  "Egyptian",
  "Makkah",
  "Karachi",
  "Tehran",
  "Jafari",
]);

const preferencesSchema = z.object({
  imsakOffsetMinutes: z.number().min(5).max(30),
  calculationMethod: calculationMethodEnum,
  theme: z.union([z.literal("dark"), z.literal("light"), z.literal("system")]),
  notificationsEnabled: z.boolean(),
});

const PREFERENCES_KEY = "ramadhan-time-companion:v1:preferences";

export function defaultPreferences(): AppPreferences {
  return {
    imsakOffsetMinutes: 10,
    calculationMethod: "MWL" as CalculationMethod,
    theme: "dark" as ThemePreference,
    notificationsEnabled: false,
  };
}

export function loadPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences();
  }
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return defaultPreferences();
    }
    const parsed = JSON.parse(raw);
    const safe = preferencesSchema.safeParse(parsed);
    if (!safe.success) {
      return defaultPreferences();
    }
    return safe.data as AppPreferences;
  } catch {
    return defaultPreferences();
  }
}

export function savePreferences(preferences: AppPreferences): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {}
}
