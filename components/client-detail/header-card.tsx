"use client";

import { Flame, Calendar, Dumbbell, MessageSquare } from "lucide-react";
import type { Client } from "@/lib/types";

interface HeaderCardProps {
  client: Client;
  onOpenChat: (prompt?: string) => void;
}

export function HeaderCard({ client, onOpenChat }: HeaderCardProps) {
  const handleGenerateReport = () => {
    onOpenChat(
      `Generate a progress report for ${client.name}. Include their current stats, recent session performance, goal progress, and recommendations for the coming week.`
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Left: Avatar + Name + Badges */}
        <div className="flex items-start gap-4">
          <img
            src={client.avatar}
            alt={client.name}
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-muted object-cover"
          />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {client.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {client.program}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Flame className="w-4 h-4" />
                {client.streak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* Right: Generate Report Button */}
        <button
          onClick={handleGenerateReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors self-start"
        >
          <MessageSquare className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatChip
          icon={<Calendar className="w-4 h-4" />}
          label="This Week"
          value={`${client.sessionsThisWeek}/${client.targetSessionsPerWeek}`}
          subtext="sessions"
        />
        <StatChip
          icon={<Dumbbell className="w-4 h-4" />}
          label="Total Sessions"
          value={client.totalSessions.toString()}
        />
        <StatChip
          label="Last Session"
          value={client.lastSessionType}
          subtext={client.lastSessionDate}
        />
        <div className="col-span-2 md:col-span-1 bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {client.goalDescription}
            </span>
            <span className="text-sm font-medium text-primary">
              {client.goalProgress}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {client.startWeight}
            </span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${client.goalProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {client.goalWeight}
            </span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Current: {client.currentWeight} lbs
          </p>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  subtext,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
