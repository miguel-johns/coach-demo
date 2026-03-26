"use client";

import { Clock } from "lucide-react";
import type { Session } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Upcoming Sessions
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-48 rounded-xl p-4 border transition-all",
        session.isToday
          ? "bg-primary/10 border-primary"
          : "bg-card border-border hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "text-sm font-medium",
            session.isToday ? "text-primary" : "text-muted-foreground"
          )}
        >
          {session.day}
        </span>
        {session.isToday && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            Today
          </span>
        )}
      </div>
      <p className="text-foreground font-semibold mb-1">{session.type}</p>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-sm">{session.time}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{session.date}</p>
    </div>
  );
}
