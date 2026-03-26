"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ProfileData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProfileBaselinesProps {
  profile: ProfileData;
}

export function ProfileBaselines({ profile }: ProfileBaselinesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summaryText = `${profile.weight} lbs · ${profile.bodyFat}% BF · ${profile.trainingStyle}`;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Profile & Baselines
          </h2>
          {!isExpanded && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {summaryText}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-6">
          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Body Composition */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Body Composition
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricItem label="Weight" value={`${profile.weight} lbs`} />
                <MetricItem
                  label="Goal Weight"
                  value={`${profile.goalWeight} lbs`}
                />
                <MetricItem label="Body Fat" value={`${profile.bodyFat}%`} />
                <MetricItem
                  label="Lean Mass"
                  value={`${profile.leanMass} lbs`}
                />
                <MetricItem label="Height" value={profile.height} />
              </div>
            </div>

            {/* Training Details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Training Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricItem label="Style" value={profile.trainingStyle} />
                <MetricItem label="Experience" value={profile.experience} />
                <MetricItem
                  label="Sessions/Week"
                  value={profile.sessionsPerWeek.toString()}
                />
                <MetricItem label="Preferred Time" value={profile.preferredTime} />
                <MetricItem
                  label="Communication"
                  value={profile.communication}
                  className="col-span-2"
                />
              </div>
            </div>
          </div>

          {/* Strength Baselines */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Strength Baselines
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.strengthBaselines.map((baseline) => (
                <div
                  key={baseline.exercise}
                  className="bg-muted rounded-lg px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {baseline.exercise}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="line-through">{baseline.previous}</span>
                    <span className="mx-1.5 text-primary">→</span>
                    <span className="text-primary font-medium">
                      {baseline.current}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Notes */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Coach Notes
            </h3>
            <div className="bg-muted rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm text-foreground leading-relaxed">
                {profile.coachNotes}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted rounded-lg p-3", className)}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
