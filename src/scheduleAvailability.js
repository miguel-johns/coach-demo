export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatTime(minutes) {
  const hour = Math.floor(minutes / 60);
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => formatTime(i * 30));

export function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time || "");
  if (!match) return NaN;
  const [, hour, minute, period] = match;
  if (+hour < 1 || +hour > 12 || +minute > 59) return NaN;
  return (+hour % 12) * 60 + +minute + (period === "PM" ? 720 : 0);
}

export function createWeek(openDays = [0, 1, 2, 3, 4], start = "6:00 AM", end = "7:00 PM") {
  return DAYS.map((_, i) => ({ on: openDays.includes(i), start, end }));
}

export const copyWeek = (hours) => hours.map((day) => ({ ...day }));

// A null schedule follows the live business hours, rather than a saved copy.
export const effectiveHours = (customHours, businessHours) => customHours ?? businessHours;

export function hoursError(hours) {
  if (!Array.isArray(hours) || hours.length !== 7) return "Choose hours for each day of the week.";
  const invalidDay = hours.findIndex((day) => day.on && !(timeToMinutes(day.end) > timeToMinutes(day.start)));
  return invalidDay < 0 ? "" : `${DAY_NAMES[invalidDay]} needs an end time later than its start time.`;
}

export function summarizeHours(days) {
  const rows = [];
  days.forEach((day, index) => {
    if (!day.on) return;
    const last = rows[rows.length - 1];
    if (last && last.lastIndex === index - 1 && last.start === day.start && last.end === day.end) {
      last.lastIndex = index;
    } else {
      rows.push({ firstIndex: index, lastIndex: index, start: day.start, end: day.end });
    }
  });
  return rows.map((row) => ({
    label: row.firstIndex === row.lastIndex ? DAYS[row.firstIndex] : `${DAYS[row.firstIndex]} – ${DAYS[row.lastIndex]}`,
    time: `${row.start} – ${row.end}`,
  }));
}

export function coachLabel(service, coaches) {
  if (service.staff === "none") return "Self-guided";
  if (service.staff === "any") return "Any available coach";
  return coaches.find((coach) => coach.id === service.staff)?.name || "Coach unavailable";
}

export function serviceMeta(service, coaches) {
  const capacity = service.kind === "group" ? `${service.cap} ${service.cap === 1 ? "spot" : "spots"}` : "1 person";
  return `${service.dur} min · ${capacity} · ${coachLabel(service, coaches)}`;
}

export function slotsForDay(service, dayIndex, businessHours, coaches) {
  if (!service || !Number.isFinite(service.dur) || service.dur <= 0) return [];
  const day = effectiveHours(service.hours, businessHours)[dayIndex];
  if (!day?.on) return [];
  const start = timeToMinutes(day.start);
  const end = timeToMinutes(day.end);
  if (!(end > start)) return [];
  const eligibleCoaches = coaches.filter((coach) => service.staff === "any" || coach.id === service.staff);
  const slots = [];
  for (let time = start; time + service.dur <= end; time += 30) {
    const coachAvailable = service.staff === "none" || eligibleCoaches.some((coach) => {
      const coachDay = effectiveHours(coach.hours, businessHours)[dayIndex];
      // One coach must cover the whole session; adjoining shifts cannot be combined.
      return coachDay?.on && time >= timeToMinutes(coachDay.start) && time + service.dur <= timeToMinutes(coachDay.end);
    });
    if (coachAvailable) slots.push(formatTime(time));
  }
  return slots;
}

export function buildBookingDates(service, businessHours, coaches, { today = new Date(), count = 14 } = {}) {
  if (!service) return [];
  const weekSlots = DAYS.map((_, i) => slotsForDay(service, i, businessHours, coaches));
  const dates = [];
  for (let offset = 1; offset < 90 && dates.length < count; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const dayIndex = (date.getDay() + 6) % 7;
    if (!weekSlots[dayIndex].length) continue;
    dates.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      dow: DAY_NAMES[dayIndex],
      day: date.getDate(),
      month: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      slots: weekSlots[dayIndex],
    });
  }
  return dates;
}

export const dateLabel = (date) => date ? `${date.dow}, ${date.month} ${date.day}, ${date.year}` : "";
