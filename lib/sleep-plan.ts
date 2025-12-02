// Types for the sleep plan
export interface TimeSlot {
  startMinutes: number
  endMinutes: number
  startTime: string
  endTime: string
}

export interface SleepPlan {
  shiftStart: number
  shiftEnd: number
  shiftStartTime: string
  shiftEndTime: string
  shiftDurationHours: number
  anchorNap: TimeSlot
  caffeineWindow: TimeSlot
  caffeineCutoff: string
  sunglasses: TimeSlot
  mainSleep: TimeSlot
  metabolic: {
    green: TimeSlot
    yellow: TimeSlot
    red: TimeSlot
  }
  vampireMode: TimeSlot
}

export interface TimelineSegment {
  label: string
  startMinutes: number
  endMinutes: number
  type: "sleep" | "caffeine" | "work" | "light-control" | "metabolic-green" | "metabolic-yellow" | "metabolic-red" | "vampire-mode"
}

// Parse time string (HH:mm) to minutes from midnight
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// Convert minutes to HH:mm format
export function minutesToTime(minutes: number): string {
  // Normalize to 24-hour cycle
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalizedMinutes / 60)
  const mins = normalizedMinutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

// Generate the sleep plan based on shift times
export function generatePlan(shiftStartTime: string, shiftEndTime: string): SleepPlan {
  const shiftStartMinutes = parseTimeToMinutes(shiftStartTime)
  let shiftEndMinutes = parseTimeToMinutes(shiftEndTime)

  // Handle shifts crossing midnight
  if (shiftEndMinutes <= shiftStartMinutes) {
    shiftEndMinutes += 1440 // Add 24 hours in minutes
  }

  const shiftDurationMinutes = shiftEndMinutes - shiftStartMinutes
  const shiftDurationHours = shiftDurationMinutes / 60

  // Anchor Nap: 90 minutes, ending 2 hours before shift start
  const anchorNapEnd = shiftStartMinutes - 120 // 2 hours before shift
  const anchorNapStart = anchorNapEnd - 90 // 90 minutes duration

  // Main Sleep: starts 1 hour after shift ends, 7 hours duration
  const mainSleepStart = shiftEndMinutes + 60
  const mainSleepEnd = mainSleepStart + 420 // 7 hours

  // Caffeine Window: Ends 6 hours before main sleep
  // "Hard Stop" alarm sounds 6 hours before sleep
  const caffeineCutoffMinutes = mainSleepStart - 360
  const caffeineStart = shiftStartMinutes
  // Ensure caffeine window doesn't start after it ends (unlikely but safe)
  const caffeineEnd = Math.max(caffeineStart, caffeineCutoffMinutes)

  // Vampire Mode: 30 minutes before shift ends
  const vampireStart = shiftEndMinutes - 30
  const vampireEnd = mainSleepStart // Until sleep starts

  // Metabolic Traffic Light
  // Red: 3 hours before sleep (FASTING MODE)
  const metabolicRedStart = mainSleepStart - 180
  const metabolicRedEnd = mainSleepStart

  // Yellow: Middle of shift to Red
  const shiftMiddle = shiftStartMinutes + Math.floor(shiftDurationMinutes / 2)
  const metabolicYellowStart = shiftMiddle
  const metabolicYellowEnd = metabolicRedStart

  // Green: Start of wake window (approx anchor nap end or before shift) to Yellow
  // Let's say it starts when you wake up for the "day", e.g. Anchor Nap end
  const metabolicGreenStart = anchorNapEnd
  const metabolicGreenEnd = metabolicYellowStart

  // Sunglasses: Old logic kept for compatibility but Vampire Mode supersedes
  const sunglassesStart = shiftEndMinutes
  const sunglassesEnd = shiftEndMinutes + 60

  return {
    shiftStart: shiftStartMinutes,
    shiftEnd: shiftEndMinutes,
    shiftStartTime: minutesToTime(shiftStartMinutes),
    shiftEndTime: minutesToTime(shiftEndMinutes),
    shiftDurationHours: Math.round(shiftDurationHours * 10) / 10,
    anchorNap: {
      startMinutes: anchorNapStart,
      endMinutes: anchorNapEnd,
      startTime: minutesToTime(anchorNapStart),
      endTime: minutesToTime(anchorNapEnd),
    },
    caffeineWindow: {
      startMinutes: caffeineStart,
      endMinutes: caffeineEnd,
      startTime: minutesToTime(caffeineStart),
      endTime: minutesToTime(caffeineEnd),
    },
    caffeineCutoff: minutesToTime(caffeineEnd),
    sunglasses: {
      startMinutes: sunglassesStart,
      endMinutes: sunglassesEnd,
      startTime: minutesToTime(sunglassesStart),
      endTime: minutesToTime(sunglassesEnd),
    },
    mainSleep: {
      startMinutes: mainSleepStart,
      endMinutes: mainSleepEnd,
      startTime: minutesToTime(mainSleepStart),
      endTime: minutesToTime(mainSleepEnd),
    },
    metabolic: {
      green: {
        startMinutes: metabolicGreenStart,
        endMinutes: metabolicGreenEnd,
        startTime: minutesToTime(metabolicGreenStart),
        endTime: minutesToTime(metabolicGreenEnd),
      },
      yellow: {
        startMinutes: metabolicYellowStart,
        endMinutes: metabolicYellowEnd,
        startTime: minutesToTime(metabolicYellowStart),
        endTime: minutesToTime(metabolicYellowEnd),
      },
      red: {
        startMinutes: metabolicRedStart,
        endMinutes: metabolicRedEnd,
        startTime: minutesToTime(metabolicRedStart),
        endTime: minutesToTime(metabolicRedEnd),
      }
    },
    vampireMode: {
      startMinutes: vampireStart,
      endMinutes: vampireEnd,
      startTime: minutesToTime(vampireStart),
      endTime: minutesToTime(vampireEnd),
    }
  }
}

// Generate timeline segments for visualization
export function generateTimelineSegments(plan: SleepPlan): {
  segments: TimelineSegment[]
  timelineStart: number
  timelineEnd: number
} {
  // Use a 24h window anchored around the shift: 8h before to 16h after
  const timelineStart = plan.shiftStart - 480
  const timelineEnd = timelineStart + 1440
  const cycle = timelineEnd - timelineStart

  const baseSegments: TimelineSegment[] = [
    {
      label: "Anchor Nap",
      startMinutes: plan.anchorNap.startMinutes,
      endMinutes: plan.anchorNap.endMinutes,
      type: "sleep",
    },
    {
      label: "Shift",
      startMinutes: plan.shiftStart,
      endMinutes: plan.shiftEnd,
      type: "work",
    },
    {
      label: "Caffeine OK",
      startMinutes: plan.caffeineWindow.startMinutes,
      endMinutes: plan.caffeineWindow.endMinutes,
      type: "caffeine",
    },
    // Metabolic Segments
    {
      label: "Eat Complex Carbs",
      startMinutes: plan.metabolic.green.startMinutes,
      endMinutes: plan.metabolic.green.endMinutes,
      type: "metabolic-green",
    },
    {
      label: "Protein/Fats Only",
      startMinutes: plan.metabolic.yellow.startMinutes,
      endMinutes: plan.metabolic.yellow.endMinutes,
      type: "metabolic-yellow",
    },
    {
      label: "FASTING MODE",
      startMinutes: plan.metabolic.red.startMinutes,
      endMinutes: plan.metabolic.red.endMinutes,
      type: "metabolic-red",
    },
    // Vampire Mode
    {
      label: "Vampire Mode (Sunglasses)",
      startMinutes: plan.vampireMode.startMinutes,
      endMinutes: plan.vampireMode.endMinutes,
      type: "vampire-mode",
    },
    {
      label: "Main Sleep",
      startMinutes: plan.mainSleep.startMinutes,
      endMinutes: plan.mainSleep.endMinutes,
      type: "sleep",
    },
  ]


  const wrapped: TimelineSegment[] = []

  for (const seg of baseSegments) {
    let s = seg.startMinutes - timelineStart
    let e = seg.endMinutes - timelineStart

    // Normalize into [0, cycle)
    while (s < 0) {
      s += cycle
      e += cycle
    }
    while (s >= cycle) {
      s -= cycle
      e -= cycle
    }

    // If segment extends past the cycle boundary, split
    if (e > cycle) {
      const first: TimelineSegment = {
        label: seg.label,
        type: seg.type,
        startMinutes: timelineStart + s,
        endMinutes: timelineStart + cycle,
      }
      const second: TimelineSegment = {
        label: seg.label,
        type: seg.type,
        startMinutes: timelineStart + 0,
        endMinutes: timelineStart + (e - cycle),
      }
      wrapped.push(first, second)
    } else if (e <= s) {
      // Crosses boundary due to modulo wrap
      const first: TimelineSegment = {
        label: seg.label,
        type: seg.type,
        startMinutes: timelineStart + s,
        endMinutes: timelineStart + cycle,
      }
      const second: TimelineSegment = {
        label: seg.label,
        type: seg.type,
        startMinutes: timelineStart + 0,
        endMinutes: timelineStart + e,
      }
      wrapped.push(first, second)
    } else {
      wrapped.push({
        label: seg.label,
        type: seg.type,
        startMinutes: timelineStart + s,
        endMinutes: timelineStart + e,
      })
    }
  }

  return { segments: wrapped, timelineStart, timelineEnd }
}
