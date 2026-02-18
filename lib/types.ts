export type CalculationMethod =
  | "MWL"
  | "ISNA"
  | "Egyptian"
  | "Makkah"
  | "Karachi"
  | "Tehran"
  | "Jafari";

export type ThemePreference = "dark" | "light" | "system";

export interface LocationState {
  lat: number | null;
  lng: number | null;
  city: string;
  country?: string;
  timezone: string;
  resolved: boolean;
}

export interface PrayerDay {
  date: string;
  hijriDate: string;
  imsak: string;
  fajr: string;
  maghrib: string;
  readableDateLabel: string;
}

export interface PrayerCalendarPayload {
  days: PrayerDay[];
}

export interface AppPreferences {
  imsakOffsetMinutes: number;
  calculationMethod: CalculationMethod;
  theme: ThemePreference;
  notificationsEnabled: boolean;
}

export interface TodayTimes {
  imsak: Date | null;
  fajr: Date | null;
  maghrib: Date | null;
}

export type NextEventType = "imsak" | "fajr" | "maghrib";

export interface NextEvent {
  type: NextEventType;
  label: string;
  targetTime: Date | null;
}
