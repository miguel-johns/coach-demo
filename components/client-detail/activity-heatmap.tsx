"use client";

import { useState } from "react";
import type { DayActivity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: DayActivity[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);

  // Get today's date string for comparison
  const today = new Date().toISOString().split("T")[0];

  // Organize data into weeks (5 rows x 7 columns)
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const getIntensityClass = (categories: number) => {
    if (categories === 0) return "bg-muted";
    if (categories === 1) return "bg-primary/20";
    if (categories === 2) return "bg-primary/40";
    if (categories === 3) return "bg-primary/60";
    return "bg-primary/80";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        30-Day Activity
      </h2>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-primary" />
          <span>Workout</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-accent" />
          <span>Nutrition</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn("w-3 h-3 rounded-sm", getIntensityClass(i))}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1.5">
            {week.map((day) => {
              const isToday = day.date === today;
              return (
                <button
                  key={day.date}
                  onClick={() =>
                    setSelectedDay(selectedDay?.date === day.date ? null : day)
                  }
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-md relative transition-all hover:ring-2 hover:ring-primary/50",
                    getIntensityClass(day.categoriesLogged),
                    isToday && "ring-2 ring-primary",
                    selectedDay?.date === day.date && "ring-2 ring-foreground"
                  )}
                >
                  {/* Indicator dots */}
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {day.workout && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {day.nutrition && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatDate(selectedDay.date)}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDay.workout && (
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                Workout
              </span>
            )}
            {selectedDay.nutrition && (
              <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                Nutrition
              </span>
            )}
            {selectedDay.sleep && (
              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                Sleep
              </span>
            )}
            {selectedDay.steps && (
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                Steps
              </span>
            )}
            {selectedDay.categoriesLogged === 0 && (
              <span className="text-xs text-muted-foreground">
                No activity logged
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
