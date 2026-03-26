"use client";

import { useState } from "react";
import { Check, Utensils, Activity, Moon } from "lucide-react";
import type { DailyMetrics, TimePeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DailyBreakdownProps {
  metrics: Record<string, DailyMetrics>;
}

const periodLabels: Record<TimePeriod, string> = {
  today: "Today",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
};

export function DailyBreakdown({ metrics }: DailyBreakdownProps) {
  const [period, setPeriod] = useState<TimePeriod>("today");

  const data = metrics[period];
  const isAverage = period !== "today";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Daily Breakdown</h2>

        {/* Period Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          {(Object.keys(periodLabels) as TimePeriod[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                period === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {periodLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nutrition Card */}
        <MetricCard
          title="Nutrition"
          icon={<Utensils className="w-4 h-4" />}
          isAverage={isAverage}
        >
          <MetricRow
            label="Calories"
            value={data.nutrition.calories}
            goal={data.nutrition.caloriesGoal}
            unit="kcal"
            showProgress
          />
          <MetricRow
            label="Protein"
            value={data.nutrition.protein}
            goal={data.nutrition.proteinGoal}
            unit="g"
            showProgress
          />
          <MetricRow label="Carbs" value={data.nutrition.carbs} unit="g" />
          <MetricRow label="Fat" value={data.nutrition.fat} unit="g" />
          <MetricRow label="Fiber" value={data.nutrition.fiber} unit="g" />
          <MetricRow label="Water" value={data.nutrition.water} unit="oz" />
        </MetricCard>

        {/* Activity Card */}
        <MetricCard
          title="Activity"
          icon={<Activity className="w-4 h-4" />}
          isAverage={isAverage}
        >
          <MetricRow
            label="Steps"
            value={data.activity.steps.toLocaleString()}
            goal={data.activity.stepsGoal}
            showProgress
          />
          <MetricRow
            label="Active Min"
            value={data.activity.activeMinutes}
            goal={data.activity.activeMinutesGoal}
            unit="min"
            showProgress
          />
          <MetricRow
            label="Burned"
            value={data.activity.caloriesBurned.toLocaleString()}
            unit="kcal"
          />
          <MetricRow
            label="Workouts"
            value={data.activity.workouts}
            unit={isAverage ? "total" : ""}
          />
          <MetricRow label="Distance" value={data.activity.distance} unit="mi" />
          <MetricRow label="Floors" value={data.activity.floors} />
        </MetricCard>

        {/* Sleep Card */}
        <MetricCard
          title="Sleep"
          icon={<Moon className="w-4 h-4" />}
          isAverage={isAverage}
        >
          <MetricRow
            label="Duration"
            value={data.sleep.duration}
            goal={data.sleep.durationGoal}
            unit="hrs"
            showProgress
          />
          <MetricRow
            label="Quality"
            value={data.sleep.quality}
            goal={data.sleep.qualityGoal}
            unit="%"
            showProgress
          />
          <MetricRow label="Deep Sleep" value={data.sleep.deepSleep} unit="hrs" />
          <MetricRow label="REM Sleep" value={data.sleep.remSleep} unit="hrs" />
          <MetricRow label="Awakenings" value={data.sleep.awakenings} />
          <MetricRow label="Efficiency" value={data.sleep.efficiency} unit="%" />
        </MetricCard>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  icon,
  isAverage,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isAverage: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-foreground">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        {isAverage && (
          <span className="text-xs text-muted-foreground">avg</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  goal,
  unit,
  showProgress,
}: {
  label: string;
  value: number | string;
  goal?: number;
  unit?: string;
  showProgress?: boolean;
}) {
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  const isGoalMet = goal ? numValue >= goal : false;
  const progress = goal ? Math.min((numValue / goal) * 100, 100) : 0;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        {showProgress && isGoalMet && (
          <Check className="w-4 h-4 text-success ml-auto" />
        )}
      </div>
      {showProgress && goal && (
        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isGoalMet ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
