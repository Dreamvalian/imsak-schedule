"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Settings2 } from "lucide-react";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import PrayerCard from "@/components/PrayerCard";
import RamadanCalendar from "@/components/RamadanCalendar";
import SettingsDrawer from "@/components/SettingsDrawer";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences
} from "@/lib/preferences";
import type {
  AppPreferences,
  LocationState,
  NextEvent,
  PrayerCalendarPayload,
  TodayTimes
} from "@/lib/types";
import { makeDateFromTimeString, subtractMinutes } from "@/lib/time";

const calendarFetcher = async (url: string): Promise<PrayerCalendarPayload> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch prayer calendar");
  }
  return (await response.json()) as PrayerCalendarPayload;
};

export default function HomePage() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    city: "",
    country: undefined,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC",
    resolved: false
  });
  const [preferences, setPreferences] =
    useState<AppPreferences>(defaultPreferences);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const imsakTimeoutRef = useRef<number | null>(null);
  const maghribTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
  }, []);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    const theme = preferences.theme;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark =
      theme === "dark" || (theme === "system" && prefersDark);
    if (shouldUseDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferences.theme]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation((current) => ({
        ...current,
        resolved: true
      }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((current) => ({
          ...current,
          lat: latitude,
          lng: longitude,
          resolved: true
        }));
        reverseGeocode(latitude, longitude).then((result) => {
          if (!result) {
            return;
          }
          setLocation((current) => ({
            ...current,
            city: result.city,
            country: result.country
          }));
        });
      },
      () => {
        setLocation((current) => ({
          ...current,
          resolved: true
        }));
      },
      {
        enableHighAccuracy: false,
        maximumAge: 600_000,
        timeout: 10_000
      }
    );
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof Notification === "undefined"
    ) {
      return;
    }
    if (!preferences.notificationsEnabled) {
      return;
    }
    if (Notification.permission === "granted") {
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission !== "granted") {
        setPreferences((current) => ({
          ...current,
          notificationsEnabled: false
        }));
      }
    });
  }, [preferences.notificationsEnabled]);

  const swrKey =
    location.lat !== null && location.lng !== null
      ? `/api/prayer-calendar?lat=${location.lat}&lng=${location.lng}&method=${preferences.calculationMethod}&offset=${preferences.imsakOffsetMinutes}`
      : null;

  const {
    data: calendar,
    error: calendarError,
    isLoading: calendarLoading
  } = useSWR<PrayerCalendarPayload>(swrKey, calendarFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  });

  const todayIso = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const todayIndex = useMemo(() => {
    if (!calendar) {
      return null;
    }
    const index = calendar.days.findIndex((day) => day.date === todayIso);
    if (index === -1) {
      return null;
    }
    return index;
  }, [calendar, todayIso]);

  const activeIndex = useMemo(() => {
    if (selectedDayIndex !== null) {
      return selectedDayIndex;
    }
    if (todayIndex !== null) {
      return todayIndex;
    }
    if (calendar && calendar.days.length > 0) {
      return 0;
    }
    return null;
  }, [calendar, selectedDayIndex, todayIndex]);

  const { todayTimes, nextEvent, gregorianLabel, hijriLabel, ramadanDay } =
    useMemo(() => {
      if (!calendar || activeIndex === null) {
        return {
          todayTimes: {
            imsak: null,
            fajr: null,
            maghrib: null
          } as TodayTimes,
          nextEvent: {
            type: "maghrib",
            label: "Awaiting schedule",
            targetTime: null
          } as NextEvent,
          gregorianLabel: "",
          hijriLabel: "",
          ramadanDay: null as number | null
        };
      }
      const day = calendar.days[activeIndex];
      const baseDate = new Date(`${day.date}T00:00:00`);
      const fajr = makeDateFromTimeString(baseDate, day.fajr);
      const imsak = subtractMinutes(fajr, preferences.imsakOffsetMinutes);
      const maghrib = makeDateFromTimeString(baseDate, day.maghrib);
      const todayTimesValue: TodayTimes = {
        imsak,
        fajr,
        maghrib
      };
      const now = new Date();
      const next = resolveNextEvent({
        now,
        calendar,
        todayIndex,
        todayTimes: todayTimesValue,
        offsetMinutes: preferences.imsakOffsetMinutes
      });
      const gregorianLabelValue = day.readableDateLabel.split("·")[0]?.trim();
      const hijriLabelValue = day.hijriDate;
      const ramadanDayValue =
        todayIndex !== null && todayIndex >= 0 ? todayIndex + 1 : null;
      return {
        todayTimes: todayTimesValue,
        nextEvent: next,
        gregorianLabel: gregorianLabelValue,
        hijriLabel: hijriLabelValue,
        ramadanDay: ramadanDayValue
      };
    }, [activeIndex, calendar, preferences.imsakOffsetMinutes, todayIndex]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }
    if (!preferences.notificationsEnabled) {
      return;
    }
    if (!todayTimes.imsak || !todayTimes.maghrib) {
      return;
    }
    if (imsakTimeoutRef.current !== null) {
      window.clearTimeout(imsakTimeoutRef.current);
    }
    if (maghribTimeoutRef.current !== null) {
      window.clearTimeout(maghribTimeoutRef.current);
    }
    const now = new Date();
    const tenMinutesBeforeImsak = subtractMinutes(todayTimes.imsak, 10);
    const msUntilImsak = tenMinutesBeforeImsak.getTime() - now.getTime();
    if (msUntilImsak > 0) {
      imsakTimeoutRef.current = window.setTimeout(() => {
        new Notification("Imsak is approaching", {
          body: "Ten minutes left before Imsak. Wrap up your suhoor.",
          tag: "imsak-reminder"
        });
      }, msUntilImsak);
    }
    const msUntilMaghrib = todayTimes.maghrib.getTime() - now.getTime();
    if (msUntilMaghrib > 0) {
      maghribTimeoutRef.current = window.setTimeout(() => {
        new Notification("Time to break your fast", {
          body: "Maghrib has entered. It is time for iftar.",
          tag: "maghrib-reminder"
        });
      }, msUntilMaghrib);
    }
    return () => {
      if (imsakTimeoutRef.current !== null) {
        window.clearTimeout(imsakTimeoutRef.current);
      }
      if (maghribTimeoutRef.current !== null) {
        window.clearTimeout(maghribTimeoutRef.current);
      }
    };
  }, [preferences.notificationsEnabled, todayTimes.imsak, todayTimes.maghrib]);

  const nextCountdownLabel =
    nextEvent.type === "imsak"
      ? "Time until Imsak"
      : nextEvent.type === "maghrib"
        ? "Time until Iftar"
        : "Upcoming event";

  const loadingState =
    calendarLoading || (location.lat === null && !location.resolved);

  const errorMessage = calendarError
    ? "Unable to load prayer times. You can still adjust your location in Settings."
    : null;

  return (
    <BackgroundWrapper>
      <main className="space-y-6 lg:space-y-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-300">
              Ramadhan Time Companion
            </p>
            <p className="text-xs text-slate-400">
              Focus on ibadah while the timings stay perfectly in sync.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-slate-500"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </button>
        </header>
        <div className="space-y-6 lg:space-y-7">
          <PrayerCard
            city={location.city || "Your location"}
            country={location.country}
            gregorianLabel={
              gregorianLabel || (todayIso || "").replaceAll("-", " / ")
            }
            hijriLabel={hijriLabel || "Ramadan schedule will appear here"}
            ramadanDayNumber={ramadanDay}
            todayTimes={todayTimes}
            nextCountdownLabel={nextCountdownLabel}
            nextCountdownTarget={nextEvent.targetTime}
            timezone={location.timezone}
          />
          {loadingState && (
            <p className="text-xs text-slate-400">
              Detecting your location and loading today&apos;s schedule.
            </p>
          )}
          {errorMessage && (
            <p className="text-xs text-amber-300">{errorMessage}</p>
          )}
          {calendar && (
            <RamadanCalendar
              days={calendar.days}
              activeIndex={activeIndex}
              todayIndex={todayIndex}
              onSelectDay={setSelectedDayIndex}
            />
          )}
        </div>
      </main>
      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onPreferencesChange={setPreferences}
        locationCity={location.city || "Your location"}
        locationCountry={location.country}
        onLocationChange={(newLocation) => {
          setLocation((current) => ({
            ...current,
            lat: newLocation.lat,
            lng: newLocation.lng,
            city: newLocation.city,
            country: newLocation.country,
            resolved: true
          }));
        }}
      />
    </BackgroundWrapper>
  );
}

interface ResolveNextEventInput {
  now: Date;
  calendar: PrayerCalendarPayload;
  todayIndex: number | null;
  todayTimes: TodayTimes;
  offsetMinutes: number;
}

function resolveNextEvent(input: ResolveNextEventInput): NextEvent {
  const { now, calendar, todayIndex, todayTimes, offsetMinutes } = input;
  if (!todayTimes.imsak || !todayTimes.maghrib) {
    return {
      type: "maghrib",
      label: "Awaiting schedule",
      targetTime: null
    };
  }
  if (now.getTime() < todayTimes.imsak.getTime()) {
    return {
      type: "imsak",
      label: "Time until Imsak",
      targetTime: todayTimes.imsak
    };
  }
  if (now.getTime() < todayTimes.maghrib.getTime()) {
    return {
      type: "maghrib",
      label: "Time until Iftar",
      targetTime: todayTimes.maghrib
    };
  }
  if (todayIndex === null) {
    return {
      type: "imsak",
      label: "Time until tomorrow's Imsak",
      targetTime: null
    };
  }
  const nextIndex = todayIndex + 1;
  const nextDay = calendar.days[nextIndex];
  if (!nextDay) {
    const fallback = subtractMinutes(
      makeDateFromTimeString(new Date(), nextTimeString(todayTimes.imsak)),
      offsetMinutes
    );
    return {
      type: "imsak",
      label: "Time until tomorrow's Imsak",
      targetTime: fallback
    };
  }
  const baseDate = new Date(`${nextDay.date}T00:00:00`);
  const nextFajr = makeDateFromTimeString(baseDate, nextDay.fajr);
  const nextImsak = subtractMinutes(nextFajr, offsetMinutes);
  return {
    type: "imsak",
    label: "Time until tomorrow's Imsak",
    targetTime: nextImsak
  };
}

function nextTimeString(date: Date | null): string {
  if (!date) {
    return "04:30";
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

interface ReverseGeocodeResult {
  city: string;
  country?: string;
}

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "10");
    const response = await fetch(url.toString(), {
      headers: {
        "accept-language": "en"
      }
    });
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    const address = json.address as {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
    };
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.state ||
      "Your city";
    return {
      city,
      country: address.country
    };
  } catch {
    return null;
  }
}

