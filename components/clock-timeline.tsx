"use client"

import React, { useMemo } from "react"
import type { TimelineSegment } from "@/lib/sleep-plan"
import { Monitor, Coffee, Sun, Moon, Zap, Activity } from "lucide-react"

interface ClockTimelineProps {
    segments: TimelineSegment[]
}

const segmentColors: Record<TimelineSegment["type"], string> = {
    sleep: "text-indigo-500",
    caffeine: "text-emerald-500",
    work: "text-amber-500",
    "light-control": "text-orange-400",
    "metabolic-green": "text-green-500",
    "metabolic-yellow": "text-yellow-500",
    "metabolic-red": "text-red-600",
    "vampire-mode": "text-purple-900",
    "nadir": "text-blue-400",
}

const segmentFills: Record<TimelineSegment["type"], string> = {
    sleep: "fill-indigo-500",
    caffeine: "fill-emerald-500",
    work: "fill-amber-500",
    "light-control": "fill-orange-400",
    "metabolic-green": "fill-green-500",
    "metabolic-yellow": "fill-yellow-500",
    "metabolic-red": "fill-red-600",
    "vampire-mode": "fill-purple-900",
    "nadir": "fill-blue-400",
}

const segmentIcons: Record<TimelineSegment["type"], any> = {
    sleep: Moon,
    caffeine: Coffee,
    work: Monitor,
    "light-control": Sun,
    "metabolic-green": Zap,
    "metabolic-yellow": Activity,
    "metabolic-red": Activity,
    "vampire-mode": Moon,
    "nadir": Activity,
}


// Helper to convert polar coordinates to cartesian
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    }
}

// Helper to create an SVG arc path
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const endAngleOriginal = endAngle;
    // If full circle, adjust slightly to avoid 0/360 overlap issue causing disappearance
    if (endAngle - startAngle >= 360) {
        endAngle = startAngle + 359.99;
    }

    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    // If it's a full circle or close to it, we might need two arcs or special handling, 
    // but the 359.99 trick usually works for single path. 
    // However, for pure clarity let's stick to the arc command.

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ")

    return d
}

// Donut segment
function describeDonutSegment(x: number, y: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
    if (endAngle - startAngle >= 360) {
        endAngle = startAngle + 359.999
    }

    const outerStart = polarToCartesian(x, y, outerRadius, endAngle)
    const outerEnd = polarToCartesian(x, y, outerRadius, startAngle)
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle)
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    const d = [
        "M", outerStart.x, outerStart.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "L", outerStart.x, outerStart.y
    ].join(" ")

    return d
}


export function ClockTimeline({ segments }: ClockTimelineProps) {
    // Dimensions
    const size = 300
    const center = size / 2
    const strokeWidth = 20
    const gap = 4

    // Radius Definitions
    // We have 3 tracks. 
    // Outer: Schedule
    // Middle: Metabolic
    // Inner: Protocol
    const outerRadius = (size / 2) - 10
    const middleRadius = outerRadius - strokeWidth - gap
    const innerRadius = middleRadius - strokeWidth - gap

    // Helper to normalize time to degrees (00:00 is 0 degrees at top)
    const minutesToDegrees = (minutes: number) => {
        // 1440 minutes = 360 degrees
        return (minutes / 1440) * 360
    }

    // Filter segments
    const scheduleSegments = segments.filter(s => ["sleep", "work", "nadir"].includes(s.type))
    const metabolicSegments = segments.filter(s => s.type.startsWith("metabolic"))
    const protocolSegments = segments.filter(s => ["caffeine", "vampire-mode", "light-control"].includes(s.type))

    // Render Tracks
    const renderTrack = (trackSegments: TimelineSegment[], radius: number) => {
        return trackSegments.map((segment, i) => {
            // Handle wrapping time (e.g. 22:00 to 06:00)
            // The segment logic passed from parent might already wrap, but let's be safe.
            // Actually, the generateTimelineSegments usually returns wrapped segments for linear timeline,
            // which might mean we have segments > 1440 or < 0 relative to the timelineStart.
            // However, for a clock, we need absolute day minutes (0-1440).

            let start = segment.startMinutes % 1440
            let end = segment.endMinutes % 1440

            if (start < 0) start += 1440
            if (end < 0) end += 1440

            // If segment crosses midnight (e.g. 23:00 to 07:00), end < start
            // We need to draw two arcs or rely on the angle math.
            // describeDonutSegment handles angles. We just need continuous angles.

            let startAngle = minutesToDegrees(start)
            let endAngle = minutesToDegrees(end)

            // If end is effectively "smaller" than start (midnight cross), add 360 to end
            if (endAngle <= startAngle) {
                endAngle += 360
            }

            // Fix for full 24h segments if any
            if (Math.abs(segment.endMinutes - segment.startMinutes) >= 1440) {
                startAngle = 0
                endAngle = 360
            }

            const path = describeDonutSegment(center, center, radius, radius - strokeWidth, startAngle, endAngle)

            return (
                <g key={`${segment.type}-${i}`} className="group cursor-pointer">
                    <path
                        d={path}
                        className={`${segmentFills[segment.type]} opacity-80 group-hover:opacity-100 transition-opacity`}
                    />
                    <title>{segment.label} ({Math.floor(start / 60)}:{String(start % 60).padStart(2, '0')} - {Math.floor(end / 60)}:{String(end % 60).padStart(2, '0')})</title>
                </g>
            )
        })
    }

    // Hours Markers
    const hourMarkers = [0, 6, 12, 18].map(h => {
        const angle = (h / 24) * 360
        const pos = polarToCartesian(center, center, outerRadius + 15, angle)
        return (
            <text
                key={h}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] fill-slate-500 font-mono"
                style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transform: `rotate(${angle}deg)` }}
            >
                {String(h).padStart(2, '0')}:00
            </text>
        )
    })

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <svg width={size + 80} height={size + 80} viewBox={`-40 -40 ${size + 80} ${size + 80}`}>
                    {/* Clock Face Background */}
                    <circle cx={center} cy={center} r={outerRadius + 2} fill="none" strokeWidth="1" className="stroke-slate-800" />
                    <circle cx={center} cy={center} r={innerRadius - strokeWidth - 2} fill="none" strokeWidth="1" className="stroke-slate-800" />

                    {/* Hour ticks */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i / 24) * 360
                        const p1 = polarToCartesian(center, center, outerRadius, angle)
                        const p2 = polarToCartesian(center, center, outerRadius - 5, angle)
                        return (
                            <line
                                key={i}
                                x1={p1.x}
                                y1={p1.y}
                                x2={p2.x}
                                y2={p2.y}
                                className={`stroke-slate-700 ${i % 6 === 0 ? 'stroke-2' : 'stroke-1'}`}
                            />
                        )
                    })}

                    {/* Hour Labels */}
                    {/* For better readability, let's just put simple N/E/S/W labels or 00/06/12/18 fixed orientation */}
                    <text x={center} y={center - outerRadius - 15} textAnchor="middle" className="text-xs fill-slate-500 font-bold">00:00</text>
                    <text x={center} y={center + outerRadius + 20} textAnchor="middle" className="text-xs fill-slate-500 font-bold">12:00</text>
                    <text x={center + outerRadius + 25} y={center + 4} textAnchor="middle" className="text-xs fill-slate-500 font-bold">06:00</text>
                    <text x={center - outerRadius - 25} y={center + 4} textAnchor="middle" className="text-xs fill-slate-500 font-bold">18:00</text>


                    {/* Tracks */}
                    {renderTrack(scheduleSegments, outerRadius)}
                    {renderTrack(metabolicSegments, middleRadius)}
                    {renderTrack(protocolSegments, innerRadius)}

                    {/* Center Label or Icon */}
                    <foreignObject x={center - 30} y={center - 30} width="60" height="60">
                        <div className="w-full h-full flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-xl">
                            <Moon className="w-6 h-6 text-indigo-400" />
                        </div>
                    </foreignObject>
                </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-x-8 gap-y-3 text-xs">
                <div className="col-span-full text-center text-slate-500 mb-2 font-medium">Legend</div>

                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Schedule</div>
                    {["sleep", "work", "nadir"].map(type => (
                        <div key={type} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${segmentColors[type as TimelineSegment["type"]].replace('text-', 'bg-')}`} />
                            <span className="text-slate-300 capitalize">{type === 'nadir' ? 'Nadir/Nap' : type}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Fuel</div>
                    {["metabolic-green", "metabolic-yellow", "metabolic-red"].map(type => (
                        <div key={type} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${segmentColors[type as TimelineSegment["type"]].replace('text-', 'bg-')}`} />
                            <span className="text-slate-300 capitalize">{type.replace('metabolic-', '')}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Protocol</div>
                    {["caffeine", "light-control", "vampire-mode"].map(type => (
                        <div key={type} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${segmentColors[type as TimelineSegment["type"]].replace('text-', 'bg-')}`} />
                            <span className="text-slate-300 capitalize">{type.replace('light-control', 'Light').replace('vampire-mode', 'Vampire')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
