export type TimePhase = "night" | "pre-fajr" | "day" | "sunset";

export function makeDateFromTimeString(baseDate: Date, time24: string): Date {
  const clean = time24.split(" ")[0];
  const [hoursStr, minutesStr] = clean.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const date = new Date(baseDate);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return date;
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

export function formatTime(date: Date | null): string {
  if (!date) {
    return "--:--";
  }
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCountdownParts(
  target: Date | null,
  now: Date,
): {
  totalMs: number;
  hours: string;
  minutes: string;
  seconds: string;
} {
  if (!target) {
    return {
      totalMs: 0,
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }
  const diff = target.getTime() - now.getTime();
  const clamped = Math.max(diff, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    totalMs: clamped,
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

export function getTimePhase(date: Date): TimePhase {
  const hour = date.getHours();
  if (hour >= 20 || hour < 4) {
    return "night";
  }
  if (hour >= 4 && hour < 6) {
    return "pre-fajr";
  }
  if (hour >= 17 && hour < 20) {
    return "sunset";
  }
  return "day";
}

export function phaseToBackgroundClass(phase: TimePhase): string {
  if (phase === "pre-fajr") {
    return "bg-gradient-dawn";
  }
  if (phase === "day") {
    return "bg-gradient-day";
  }
  if (phase === "sunset") {
    return "bg-gradient-sunset";
  }
  return "bg-gradient-night";
}
