import type {
  AutoPublishQueue,
  AutoPublishSchedule,
  AutoPublishSettings,
} from "../../drizzle/schema";

export type UpcomingPublicationType = "queued" | "recurring" | "one_shot";
export type UpcomingPublicationStatus = "pending" | "projected";

export interface UpcomingPublication {
  id: string;
  scheduledFor: string;
  type: UpcomingPublicationType;
  status: UpcomingPublicationStatus;
  content: string | null;
  imageUrl: string | null;
  source: string | null;
  queueId: number | null;
  dayLabel: string;
  timeLabel: string;
  relativeLabel: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatDayLabel(date: Date, now: Date): string {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatRelativeLabel(scheduled: Date, now: Date): string {
  const diffMs = scheduled.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 3600000) {
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    return `Dans ${mins} min`;
  }
  if (diffHours < 24) return `Dans ${diffHours}h`;
  if (diffDays === 1) return "Demain";
  return `Dans ${diffDays} jours`;
}

function parseGeneratedFromType(generatedFrom: string | null): string | null {
  if (!generatedFrom) return null;
  try {
    const meta = JSON.parse(generatedFrom);
    return (meta.type as string) || null;
  } catch {
    return null;
  }
}

function isSlotCoveredByQueue(
  scheduledFor: Date,
  queue: AutoPublishQueue[]
): boolean {
  return queue.some((item) => {
    if (item.status !== "pending") return false;
    const itemTime = new Date(item.scheduledFor).getTime();
    return Math.abs(itemTime - scheduledFor.getTime()) < 5 * 60 * 1000;
  });
}

export function projectUpcomingPublications(options: {
  settings: AutoPublishSettings | null;
  schedule: AutoPublishSchedule[];
  queue: AutoPublishQueue[];
  days?: number;
  now?: Date;
}): UpcomingPublication[] {
  const { settings, schedule, queue } = options;
  const days = options.days ?? 7;
  const now = options.now ?? new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);

  const results: UpcomingPublication[] = [];

  for (const item of queue) {
    if (item.status !== "pending") continue;
    const scheduled = new Date(item.scheduledFor);
    if (scheduled <= now || scheduled > end) continue;

    const sourceType = parseGeneratedFromType(item.generatedFrom);
    let type: UpcomingPublicationType = "queued";
    if (sourceType === "auto-publish" || sourceType === "auto_recurring") {
      type = sourceType === "auto_recurring" ? "recurring" : "queued";
    } else if (sourceType === "manual" || sourceType === "generator") {
      type = "queued";
    }

    results.push({
      id: `queue-${item.id}`,
      scheduledFor: scheduled.toISOString(),
      type,
      status: "pending",
      content: item.content,
      imageUrl: item.imageUrl,
      source: sourceType,
      queueId: item.id,
      dayLabel: formatDayLabel(scheduled, now),
      timeLabel: scheduled.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      relativeLabel: formatRelativeLabel(scheduled, now),
    });
  }

  if (!settings?.isEnabled) {
    return results.sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  }

  for (let offset = 0; offset <= days; offset++) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();

    for (const slot of schedule) {
      if (!slot.isActive) continue;

      if (slot.publishDate) {
        if (slot.publishDate !== dateKey) continue;
      } else if (slot.dayOfWeek !== dayOfWeek) {
        continue;
      }

      const scheduledFor = combineDateTime(date, slot.publishTime);
      if (scheduledFor <= now || scheduledFor > end) continue;
      if (isSlotCoveredByQueue(scheduledFor, queue)) continue;

      const type: UpcomingPublicationType = slot.publishDate
        ? "one_shot"
        : "recurring";

      results.push({
        id: `slot-${slot.id}-${dateKey}-${slot.publishTime}`,
        scheduledFor: scheduledFor.toISOString(),
        type,
        status: "projected",
        content: null,
        imageUrl: null,
        source: "auto_recurring",
        queueId: null,
        dayLabel: formatDayLabel(scheduledFor, now),
        timeLabel: scheduledFor.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        relativeLabel: formatRelativeLabel(scheduledFor, now),
      });
    }
  }

  return results.sort(
    (a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
}

export function groupPublicationsByDay(
  publications: UpcomingPublication[]
): { dateKey: string; dayLabel: string; items: UpcomingPublication[] }[] {
  const map = new Map<
    string,
    { dateKey: string; dayLabel: string; items: UpcomingPublication[] }
  >();

  for (const pub of publications) {
    const date = new Date(pub.scheduledFor);
    const dateKey = formatDateKey(date);
    if (!map.has(dateKey)) {
      map.set(dateKey, { dateKey, dayLabel: pub.dayLabel, items: [] });
    }
    map.get(dateKey)!.items.push(pub);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey)
  );
}
