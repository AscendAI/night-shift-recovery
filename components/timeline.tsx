"use client"

import type { TimelineSegment } from "@/lib/sleep-plan"

interface TimelineProps {
  segments: TimelineSegment[]
  timelineStart: number
  timelineEnd: number
}

const segmentColors: Record<TimelineSegment["type"], string> = {
  sleep: "bg-indigo-500",
  caffeine: "bg-emerald-500",
  work: "bg-amber-500",
  "light-control": "bg-orange-400",
  "metabolic-green": "bg-green-500",
  "metabolic-yellow": "bg-yellow-500",
  "metabolic-red": "bg-red-600",
  "vampire-mode": "bg-purple-900",
}

const segmentLabels: Record<TimelineSegment["type"], string> = {
  sleep: "Sleep",
  caffeine: "Caffeine OK",
  work: "Shift",
  "light-control": "Light Control",
  "metabolic-green": "Complex Carbs",
  "metabolic-yellow": "Protein/Fats",
  "metabolic-red": "Fasting",
  "vampire-mode": "Vampire Mode",
}

export function Timeline({ segments, timelineStart, timelineEnd }: TimelineProps) {
  const totalDuration = timelineEnd - timelineStart

  const getPosition = (minutes: number) => {
    return ((minutes - timelineStart) / totalDuration) * 100
  }

  const getWidth = (start: number, end: number) => {
    return ((end - start) / totalDuration) * 100
  }

  // Sort segments by start time for proper layering
  const sortedSegments = [...segments].sort((a, b) => a.startMinutes - b.startMinutes)

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="relative h-12 bg-slate-700/50 rounded-lg overflow-hidden">
        {sortedSegments.map((segment, index) => {
          const left = Math.max(0, getPosition(segment.startMinutes))
          const width = getWidth(
            Math.max(timelineStart, segment.startMinutes),
            Math.min(timelineEnd, segment.endMinutes),
          )

          if (width <= 0) return null

          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${segmentColors[segment.type]} opacity-80 flex items-center justify-center text-xs font-medium text-white truncate px-1`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
              title={segment.label}
            >
              {width > 8 && <span className="truncate">{segment.label}</span>}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        {Object.entries(segmentColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-slate-300">{segmentLabels[type as TimelineSegment["type"]]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
