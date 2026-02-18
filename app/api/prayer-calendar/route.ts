import type {
  CalculationMethod,
  PrayerCalendarPayload,
  PrayerDay,
} from "@/lib/types";
import { NextRequest } from "next/server";
import { z } from "zod";

const MUSLIMSALAT_API_KEY = process.env.MUSLIMSALAT_API_KEY;

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  method: z
    .enum(["MWL", "ISNA", "Egyptian", "Makkah", "Karachi", "Tehran", "Jafari"])
    .optional(),
  offset: z.coerce.number().min(5).max(30).optional(),
});

const aladhanResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  data: z.array(
    z.object({
      timings: z.object({
        Fajr: z.string(),
        Maghrib: z.string(),
      }),
      date: z.object({
        readable: z.string(),
        gregorian: z.object({
          date: z.string(),
        }),
        hijri: z.object({
          date: z.string(),
          month: z.object({
            en: z.string(),
          }),
        }),
      }),
    }),
  ),
});

const muslimSalatResponseSchema = z.object({
  status_valid: z.union([z.number(), z.string()]).optional(),
  status_description: z.string().optional(),
  items: z.array(
    z.object({
      date_for: z.string(),
      fajr: z.string(),
      maghrib: z.string(),
    }),
  ),
});

function methodToAladhanCode(method: CalculationMethod): number {
  if (method === "ISNA") {
    return 2;
  }
  if (method === "Egyptian") {
    return 5;
  }
  if (method === "Makkah") {
    return 4;
  }
  if (method === "Karachi") {
    return 1;
  }
  if (method === "Tehran") {
    return 7;
  }
  if (method === "Jafari") {
    return 0;
  }
  return 3;
}

function computeImsakFromFajr(fajr: string, offsetMinutes: number): string {
  const clean = fajr.split(" ")[0];
  const [hoursStr, minutesStr] = clean.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return clean;
  }
  let totalMinutes = hours * 60 + minutes - offsetMinutes;
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  const hh = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

async function fetchCalendarFromAladhan(input: {
  lat: number;
  lng: number;
  month: number;
  year: number;
  method: CalculationMethod;
  offsetMinutes: number;
}): Promise<PrayerDay[] | null> {
  const methodId = methodToAladhanCode(input.method);
  const apiUrl = new URL("https://api.aladhan.com/v1/calendar");
  apiUrl.searchParams.set("latitude", String(input.lat));
  apiUrl.searchParams.set("longitude", String(input.lng));
  apiUrl.searchParams.set("month", String(input.month));
  apiUrl.searchParams.set("year", String(input.year));
  apiUrl.searchParams.set("method", String(methodId));
  const response = await fetch(apiUrl.toString());
  if (!response.ok) {
    return null;
  }
  const json = await response.json();
  const safe = aladhanResponseSchema.safeParse(json);
  if (!safe.success || safe.data.code !== 200) {
    return null;
  }
  const days: PrayerDay[] = safe.data.data.map((entry) => {
    const fajr = entry.timings.Fajr;
    const maghrib = entry.timings.Maghrib;
    const imsak = computeImsakFromFajr(fajr, input.offsetMinutes);
    const [day, monthStr, yearStr] = entry.date.gregorian.date.split("-");
    const isoDate = `${yearStr}-${monthStr}-${day}`;
    const hijri = entry.date.hijri;
    const hijriLabel = `${hijri.date} ${hijri.month.en}`;
    const readableDateLabel = `${entry.date.readable} · ${hijriLabel}`;
    return {
      date: isoDate,
      hijriDate: hijriLabel,
      imsak,
      fajr,
      maghrib,
      readableDateLabel,
    };
  });
  return days;
}

async function fetchCalendarFromMuslimSalat(input: {
  lat: number;
  lng: number;
  offsetMinutes: number;
}): Promise<PrayerDay[] | null> {
  if (!MUSLIMSALAT_API_KEY) {
    return null;
  }
  const locationSegment = `${input.lat.toFixed(4)},${input.lng.toFixed(4)}`;
  const apiUrl = new URL(
    `https://muslimsalat.com/${encodeURIComponent(locationSegment)}/monthly.json`,
  );
  apiUrl.searchParams.set("key", MUSLIMSALAT_API_KEY);
  const response = await fetch(apiUrl.toString());
  if (!response.ok) {
    return null;
  }
  const json = await response.json();
  const safe = muslimSalatResponseSchema.safeParse(json);
  if (!safe.success) {
    return null;
  }
  const days: PrayerDay[] = safe.data.items.map((entry) => {
    const fajr = entry.fajr;
    const maghrib = entry.maghrib;
    const imsak = computeImsakFromFajr(fajr, input.offsetMinutes);
    const isoDate = entry.date_for;
    const readableDateLabel = isoDate;
    return {
      date: isoDate,
      hijriDate: "",
      imsak,
      fajr,
      maghrib,
      readableDateLabel,
    };
  });
  return days;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const getParam = (key: string) => {
    const value = url.searchParams.get(key);
    return value === null ? undefined : value;
  };
  const parsed = querySchema.safeParse({
    lat: getParam("lat"),
    lng: getParam("lng"),
    method: getParam("method"),
    offset: getParam("offset"),
  });
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid query parameters",
        details: parsed.error.issues,
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }
  const now = new Date();
  const { lat, lng } = parsed.data;
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const method = (parsed.data.method ?? "MWL") as CalculationMethod;
  const offsetMinutes = parsed.data.offset ?? 10;

  let days: PrayerDay[] | null = null;

  try {
    days = await fetchCalendarFromMuslimSalat({
      lat,
      lng,
      offsetMinutes,
    });
  } catch {}

  if (!days) {
    days = await fetchCalendarFromAladhan({
      lat,
      lng,
      month,
      year,
      method,
      offsetMinutes,
    });
  }

  if (!days) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch prayer calendar",
      }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }

  const payload: PrayerCalendarPayload = {
    days,
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
