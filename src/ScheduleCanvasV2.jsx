import React from "react";
import MiltonSchedule from "./MiltonSchedule";

/* The schedule canvas now hosts the self-contained Milton scheduler only.
   MiltonSchedule owns its own Calendar / Services / Setup tabs, so the old
   header, intro copy, connected-calendars / services cards, and booking/share
   modals are no longer needed here. */
export default function ScheduleCanvasV2({ onClose }) {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden", background: "#F3F5F6" }}>
      <MiltonSchedule height="100%" />
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 20,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid #DEE4E5",
            background: "#FFFFFF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7D8789",
            boxShadow: "0 1px 0 rgba(14,93,112,.04), 0 2px 8px rgba(14,93,112,.06)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
