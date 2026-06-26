export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export { buildScheduledAtIso } from "@shared/scheduleTime";

/** Vérifie que la date/heure choisie est dans le futur (marge 1 min). */
export function isScheduledInFuture(dateStr: string, timeStr: string): boolean {
  const scheduled = combineDateAndTime(dateStr, timeStr);
  return scheduled.getTime() > Date.now() - 60_000;
}

export function getDefaultScheduleTime(): { date: string; time: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return {
    date: formatDateInput(tomorrow),
    time: "09:00",
  };
}
