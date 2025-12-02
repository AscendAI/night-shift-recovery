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

    // Split segments into tracks
    const scheduleSegments = segments.filter(s => ["sleep", "work"].includes(s.type))
    const metabolicSegments = segments.filter(s => s.type.startsWith("metabolic"))
    const protocolSegments = segments.filter(s => ["caffeine", "vampire-mode", "light-control"].includes(s.type))

    const renderTrack = (trackSegments: TimelineSegment[], heightClass: string = "h-8") => (
        <div className={`relative ${heightClass} bg-slate-700/50 rounded-lg overflow-hidden`}>
            {trackSegments.map((segment, index) => {
                const left = Math.max(0, getPosition(segment.startMinutes))
                const width = getWidth(
                    Math.max(timelineStart, segment.startMinutes),
                    Math.min(timelineEnd, segment.endMinutes),
                )

                if (width <= 0) return null

                return (
                    <div
                        key={index}
                        className={`absolute top-0 h-full ${segmentColors[segment.type]} opacity-90 flex items-center justify-center text-[10px] sm:text-xs font-medium text-white truncate px-1 border-r border-white/10`}
                        style={{
                            left: `${left}%`,
                            width: `${width}%`,
                        }}
                        title={segment.label}
                    >
                        {width > 5 && <span className="truncate">{segment.label}</span>}
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-400 uppercase">Schedule (Sleep & Work)</h5>
                {renderTrack(scheduleSegments, "h-10")}
            </div>

            <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-400 uppercase">Metabolic Fuel</h5>
                {renderTrack(metabolicSegments, "h-8")}
            </div>

            <div className="space-y-2">
                <h5 className="text-xs font-medium text-slate-400 uppercase">Protocol (Caffeine & Light)</h5>
                {renderTrack(protocolSegments, "h-8")}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-xs sm:text-sm pt-2">
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
