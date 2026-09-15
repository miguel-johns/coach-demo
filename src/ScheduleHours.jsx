import React, { useId, useRef, useState } from "react";
import { ChevronRight, Copy, DoorOpen, UserRound, Users } from "lucide-react";
import { DAYS, DAY_NAMES, TIME_OPTIONS, copyWeek, effectiveHours, hoursError, summarizeHours, timeToMinutes } from "./scheduleAvailability";
import "./ScheduleHours.css";

const VIEWS = ["business", "team", "services"];
const VIEW_LABELS = { business: "Business", team: "Team", services: "Services" };

export function ServiceMark({ kind }) {
  const Icon = kind === "space" ? DoorOpen : kind === "group" ? Users : UserRound;
  return <span className="schedule-service-mark"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>;
}

export function HoursBadge({ custom }) {
  return <span className={`hours-badge${custom ? " hours-badge-custom" : ""}`}>{custom ? "Custom" : "Business hours"}</span>;
}

function HoursSummary({ hours }) {
  const rows = summarizeHours(hours);
  return (
    <span className="hours-summary">
      {rows.length ? rows.map((row) => (
        <span className="hours-summary-line" key={row.label}>
          <span className="hours-summary-days">{row.label}</span>
          <span>{row.time}</span>
        </span>
      )) : <span>No open days</span>}
    </span>
  );
}

function WeekDays({ hours }) {
  return <div className="hours-week-days">{DAYS.map((day, i) => (
    <span key={day} className={hours[i].on ? "hours-day-open" : ""} title={`${DAY_NAMES[i]}: ${hours[i].on ? "Open" : "Closed"}`} aria-label={`${DAY_NAMES[i]}: ${hours[i].on ? "Open" : "Closed"}`}>{day[0]}</span>
  ))}</div>;
}

export function HoursCard({ businessHours, coaches, services, view, onViewChange, onEdit }) {
  const id = useId();
  const tabs = useRef([]);
  const entries = view === "team" ? coaches : services;
  const description = view === "business"
    ? "Your default hours. Everyone follows these unless you set custom hours."
    : view === "team"
      ? "Your team, at a glance. Select a coach to adjust their hours."
      : "A different schedule for a service or space? Set it here.";

  function moveTab(event, index) {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % VIEWS.length;
    else if (event.key === "ArrowLeft") next = (index + VIEWS.length - 1) % VIEWS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = VIEWS.length - 1;
    else return;
    event.preventDefault();
    onViewChange(VIEWS[next]);
    tabs.current[next]?.focus();
  }

  return (
    <section className="hours-card" aria-labelledby={`${id}-heading`}>
      <div className="hours-card-top">
        <div className="hours-card-heading">
          <h2 id={`${id}-heading`}>Hours</h2>
          {view === "business" && <button type="button" className="hours-button hours-button-secondary" onClick={() => onEdit("business")}>Edit hours</button>}
        </div>
        <div className="hours-tabs" role="tablist" aria-label="Hours views">
          {VIEWS.map((tab, i) => (
            <button key={tab} ref={(node) => { tabs.current[i] = node; }} type="button" role="tab" id={`${id}-${tab}`} aria-controls={`${id}-panel-${tab}`} aria-selected={view === tab} tabIndex={view === tab ? 0 : -1} onClick={() => onViewChange(tab)} onKeyDown={(event) => moveTab(event, i)}>{VIEW_LABELS[tab]}</button>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`${id}-panel-${view}`} aria-labelledby={`${id}-${view}`}>
        <p className="hours-card-description">{description}</p>
        {view === "business" ? (
          <div className="hours-business-summary">
            <HoursSummary hours={businessHours} />
            <WeekDays hours={businessHours} />
          </div>
        ) : (
          <ul className="hours-list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button type="button" className="hours-list-row" onClick={() => onEdit(view === "team" ? "team" : "service", entry)} aria-label={`Edit ${entry.name} hours`}>
                  {view === "team" ? <span className="hours-avatar" aria-hidden="true">{entry.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}</span> : <ServiceMark kind={entry.kind} />}
                  <span className="hours-row-content">
                    <span className="hours-row-heading"><span className="hours-row-name">{entry.name}</span><HoursBadge custom={entry.hours != null} /></span>
                    <HoursSummary hours={effectiveHours(entry.hours, businessHours)} />
                  </span>
                  <ChevronRight size={16} className="hours-row-chevron" aria-hidden="true" />
                </button>
              </li>
            ))}
            {!entries.length && <li className="hours-list-empty">{view === "team" ? "Connect a coach’s calendar to add them to your team." : "Add a service or space below to set its hours."}</li>}
          </ul>
        )}
      </div>
    </section>
  );
}

export function HoursSourcePicker({ value, onChange }) {
  const name = useId();
  return (
    <fieldset className="hours-source-picker">
      <legend className="schedule-sr-only">Hours source</legend>
      {["business", "custom"].map((mode) => (
        <label key={mode} className="hours-source-option">
          <input type="radio" name={name} value={mode} checked={value === mode} onChange={() => onChange(mode)} />
          <span>{mode === "business" ? "Use business hours" : "Custom hours"}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function WeekHoursEditor({ value, onChange }) {
  const id = useId();
  const updateDay = (index, patch) => onChange(value.map((day, i) => i === index ? { ...day, ...patch } : day));
  return (
    <div className="week-hours-editor">
      {DAY_NAMES.map((name, i) => {
        const day = value[i];
        const invalid = day.on && !(timeToMinutes(day.end) > timeToMinutes(day.start));
        return (
          <div className="week-hours-day" key={name}>
            <div className="week-hours-row">
              <label className="week-hours-toggle">
                <input type="checkbox" checked={day.on} onChange={() => updateDay(i, { on: !day.on })} aria-label={`${name} open`} />
                <span className="week-day-full">{name}</span><span className="week-day-short" aria-hidden="true">{DAYS[i]}</span>
              </label>
              {day.on ? (
                <div className="week-time-controls">
                  <select aria-label={`${name} start time`} aria-invalid={invalid} aria-describedby={invalid ? `${id}-${i}-error` : undefined} value={day.start} onChange={(event) => updateDay(i, { start: event.target.value })}>
                    {TIME_OPTIONS.map((time) => <option key={time}>{time}</option>)}
                  </select>
                  <span className="week-time-separator" aria-hidden="true">–</span>
                  <select aria-label={`${name} end time`} aria-invalid={invalid} aria-describedby={invalid ? `${id}-${i}-error` : undefined} value={day.end} onChange={(event) => updateDay(i, { end: event.target.value })}>
                    {TIME_OPTIONS.map((time) => <option key={time}>{time}</option>)}
                  </select>
                  <button type="button" className="hours-copy" title="Copy to all open days" aria-label={`Copy ${name} hours to all open days`} disabled={invalid} onClick={() => onChange(value.map((other) => other.on ? { ...other, start: day.start, end: day.end } : other))}><Copy size={16} aria-hidden="true" /></button>
                </div>
              ) : <span className="week-hours-closed">Closed</span>}
            </div>
            {invalid && <p className="hours-validation" id={`${id}-${i}-error`} role="alert">End time must be later than start time.</p>}
          </div>
        );
      })}
    </div>
  );
}

export function HoursEditor({ target, businessHours, customHours, onSave, onCancel }) {
  const isBusiness = target.scope === "business";
  const [source, setSource] = useState(!isBusiness && customHours == null ? "business" : "custom");
  const [draft, setDraft] = useState(() => copyWeek(effectiveHours(customHours, businessHours)));
  const inherited = !isBusiness && source === "business";
  const error = inherited ? "" : hoursError(draft);
  return (
    <div className="hours-editor">
      <div className="hours-editor-heading">
        <h2>{isBusiness ? "Business hours" : `${target.name} hours`}</h2>
        <p>{isBusiness ? "The default schedule for your team and services." : "Follow business hours, or give this schedule its own hours."}</p>
      </div>
      {!isBusiness && <HoursSourcePicker value={source} onChange={setSource} />}
      {inherited ? (
        <div className="hours-inherited-preview">
          <HoursSummary hours={businessHours} />
          <WeekDays hours={businessHours} />
          <p>Updates automatically when business hours change.</p>
        </div>
      ) : <WeekHoursEditor value={draft} onChange={setDraft} />}
      <p className="hours-editor-note">
        {isBusiness ? "Custom team and service hours stay unchanged." : target.scope === "service" && target.staff !== "none" ? "Members only see times when both this service and an eligible coach are available." : target.scope === "service" ? "No coach needed. This space uses its own availability." : "These hours are checked when members book with this coach."}
      </p>
      <div className="hours-editor-actions">
        <button type="button" className="hours-button hours-button-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="hours-button hours-button-primary" disabled={!!error} onClick={() => onSave(inherited ? null : copyWeek(draft))}>Save hours</button>
      </div>
    </div>
  );
}
