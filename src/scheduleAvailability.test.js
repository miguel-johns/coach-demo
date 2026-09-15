import assert from "node:assert/strict";
import test from "node:test";
import { buildBookingDates, copyWeek, createWeek, effectiveHours, hoursError, slotsForDay, summarizeHours } from "./scheduleAvailability.js";

const service = (overrides = {}) => ({ id: "pt", dur: 60, staff: "miguel", hours: null, ...overrides });
const coaches = [{ id: "miguel", hours: null }, { id: "joe", hours: null }];

test("inherited service and team hours follow business-hour changes", () => {
  const before = createWeek([0], "6:00 AM", "8:00 AM");
  const after = createWeek([0], "10:00 AM", "12:00 PM");
  assert.deepEqual(slotsForDay(service(), 0, before, coaches), ["6:00 AM", "6:30 AM", "7:00 AM"]);
  assert.deepEqual(slotsForDay(service(), 0, after, coaches), ["10:00 AM", "10:30 AM", "11:00 AM"]);
  assert.equal(effectiveHours(null, after), after);
});

test("custom recovery hours can open on a day the business and coaches are closed", () => {
  const business = createWeek();
  const recovery = service({ staff: "none", dur: 30, hours: createWeek([5], "9:00 AM", "10:00 AM") });
  assert.deepEqual(slotsForDay(recovery, 5, business, []), ["9:00 AM", "9:30 AM"]);
  assert.deepEqual(slotsForDay(recovery, 5, createWeek([]), coaches), ["9:00 AM", "9:30 AM"]);
});

test("required coach and service schedules must overlap for the full duration", () => {
  const business = createWeek([0], "6:00 AM", "7:00 PM");
  const team = [{ id: "miguel", hours: createWeek([0], "10:00 AM", "12:00 PM") }];
  const appointment = service({ hours: createWeek([0], "11:00 AM", "3:00 PM") });
  assert.deepEqual(slotsForDay(appointment, 0, business, team), ["11:00 AM"]);
  assert.deepEqual(slotsForDay(appointment, 1, business, team), []);
});

test("any coach uses the union of available coaches, without bridging two shifts", () => {
  const business = createWeek([0], "9:00 AM", "12:00 PM");
  const team = [
    { id: "miguel", hours: createWeek([0], "9:00 AM", "10:00 AM") },
    { id: "joe", hours: createWeek([0], "10:00 AM", "11:00 AM") },
  ];
  assert.deepEqual(slotsForDay(service({ staff: "any" }), 0, business, team), ["9:00 AM", "10:00 AM"]);
});

test("custom hours are not bounded by business hours when all required resources are open", () => {
  const team = [{ id: "miguel", hours: createWeek([5], "9:00 AM", "12:00 PM") }];
  assert.deepEqual(slotsForDay(service({ hours: createWeek([5], "10:00 AM", "11:00 AM") }), 5, createWeek([]), team), ["10:00 AM"]);
});

test("a class window preserves its fixed start and omits closed dates", () => {
  const strength = service({ staff: "joe", hours: createWeek([0, 2, 4], "6:00 AM", "7:00 AM") });
  const dates = buildBookingDates(strength, createWeek(), coaches, { today: new Date(2026, 8, 13), count: 3 });
  assert.deepEqual(dates.map((date) => date.key), ["2026-09-14", "2026-09-16", "2026-09-18"]);
  assert.ok(dates.every((date) => date.slots.length === 1 && date.slots[0] === "6:00 AM"));
});

test("slots never overrun closing time, including 45- and 90-minute sessions", () => {
  const business = createWeek([0], "9:00 AM", "10:00 AM");
  assert.deepEqual(slotsForDay(service({ dur: 45 }), 0, business, coaches), ["9:00 AM"]);
  assert.deepEqual(slotsForDay(service({ dur: 90 }), 0, business, coaches), []);
});

test("no available coach, closed schedules and invalid windows return no dates", () => {
  assert.deepEqual(buildBookingDates(service(), createWeek(), []), []);
  assert.deepEqual(buildBookingDates(service(), createWeek([]), coaches), []);
  assert.deepEqual(buildBookingDates(service(), createWeek([0], "7:00 PM", "6:00 AM"), coaches), []);
  assert.deepEqual(slotsForDay(service({ dur: 0 }), 0, createWeek(), coaches), []);
});

test("resetting a custom schedule restores live inheritance", () => {
  const business = createWeek([0], "9:00 AM", "12:00 PM");
  const custom = createWeek([0], "10:00 AM", "11:00 AM");
  assert.equal(effectiveHours(custom, business), custom);
  assert.deepEqual(slotsForDay(service({ hours: null }), 0, business, coaches), ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"]);
});

test("editing a draft does not mutate business hours", () => {
  const business = createWeek();
  const draft = copyWeek(business);
  draft[0].on = false;
  assert.equal(business[0].on, true);
  assert.deepEqual(summarizeHours(business), [{ label: "Mon – Fri", time: "6:00 AM – 7:00 PM" }]);
});

test("invalid or equal open/close times are rejected, while all-closed is valid", () => {
  assert.match(hoursError(createWeek([0], "10:00 AM", "9:00 AM")), /Monday/);
  assert.match(hoursError(createWeek([1], "10:00 AM", "10:00 AM")), /Tuesday/);
  assert.match(hoursError(createWeek([0], "invalid", "9:00 AM")), /Monday/);
  assert.equal(hoursError(createWeek([])), "");
});
