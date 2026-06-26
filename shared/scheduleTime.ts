export const DEFAULT_SCHEDULE_TIMEZONE = "Europe/Paris";

/** Date/heure saisies par l'utilisateur → instant UTC (fuseau Europe/Paris par défaut). */
export function wallClockToUtc(
  dateStr: string,
  timeStr: string,
  timeZone = DEFAULT_SCHEDULE_TIMEZONE
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return new Date(NaN);
  }

  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offsetMs = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offsetMs);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utc));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const zonedAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  return zonedAsUtc - utc;
}

/** Heure locale du navigateur → ISO UTC (pour envoi API). */
export function buildScheduledAtIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

export function formatTimeInZone(
  date: Date,
  timeZone = DEFAULT_SCHEDULE_TIMEZONE
): string {
  return date.toLocaleTimeString("fr-FR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const WEEKDAY_TO_DOW: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getZonedParts(date: Date, timeZone = DEFAULT_SCHEDULE_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** Jour de la semaine (0 = dimanche) dans le fuseau donné. */
export function getDayOfWeekInZone(
  date: Date = new Date(),
  timeZone = DEFAULT_SCHEDULE_TIMEZONE
): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  return WEEKDAY_TO_DOW[weekday] ?? 0;
}

/** Date calendaire YYYY-MM-DD dans le fuseau donné. */
export function getDateKeyInZone(
  date: Date = new Date(),
  timeZone = DEFAULT_SCHEDULE_TIMEZONE
): string {
  const { year, month, day } = getZonedParts(date, timeZone);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Heure HH:MM dans le fuseau donné. */
export function getTimeKeyInZone(
  date: Date = new Date(),
  timeZone = DEFAULT_SCHEDULE_TIMEZONE
): string {
  const { hour, minute } = getZonedParts(date, timeZone);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hour)}:${pad(minute)}`;
}
