import { describe, expect, it } from "vitest";
import {
  getDateKeyInZone,
  getDayOfWeekInZone,
  getTimeKeyInZone,
  wallClockToUtc,
} from "@shared/scheduleTime";

describe("scheduleTime timezone helpers", () => {
  it("resolves Paris wall clock from UTC instant", () => {
    const instant = new Date("2026-06-25T08:30:00.000Z");
    expect(getDateKeyInZone(instant)).toBe("2026-06-25");
    expect(getTimeKeyInZone(instant)).toBe("10:30");
    expect(getDayOfWeekInZone(instant)).toBe(4);
  });

  it("round-trips Paris wall clock to UTC", () => {
    const utc = wallClockToUtc("2026-06-25", "14:00");
    expect(utc.toISOString()).toBe("2026-06-25T12:00:00.000Z");
  });
});
