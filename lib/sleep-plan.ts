// Types for the sleep plan
export interface TimeSlot {
  startMinutes: number
  endMinutes: number
  startTime: string
  endTime: string
}

export interface SleepPlan {
  targetWakeTime: string
  targetSleepTime: string
  // Optional shift times for reference/visualization
  shiftStart?: string
  shiftEnd?: string

  // Protocol Windows
  lightAnchor: TimeSlot
  caffeineWindow: TimeSlot
  caffeineCutoff: string
  nadirDip: TimeSlot
  vampireMode: TimeSlot
  mainSleep: TimeSlot

  // Metabolic Traffic Light
  metabolic: {
    green: TimeSlot
    yellow: TimeSlot
    red: TimeSlot
  }
}

export interface TimelineSegment {
  label: string
  startMinutes: number
  endMinutes: number
  type: "sleep" | "caffeine" | "work" | "light-control" | "metabolic-green" | "metabolic-yellow" | "metabolic-red" | "vampire-mode" | "nadir"
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

/**
 * THE UNIVERSAL CIRCADIAN HEURISTIC (T-Wake Algorithm)
 * 
 * Logic Pivot:
 * - Old: Shift-Relative (Shift Start -> Action)
 * - New: Wake-Relative (Wake Time -> Action)
 * 
 * Core Formula:
 * - Wake Time (T-Wake) is the Anchor.
 * - Sleep Pressure builds for ~16 hours.
 * - Sleep Start = T-Wake + 16 hours.
 */
export function generatePlan(
  targetWakeTimeStr: string,
  shiftStartStr?: string,
  shiftEndStr?: string
): SleepPlan {
  // 1. ANCHOR: The user wakes up here.
  const wakeMinutes = parseTimeToMinutes(targetWakeTimeStr)

  // 2. SLEEP START: 16 hours after waking (Standard Adenosine Load)
  // 16 hours * 60 minutes = 960 minutes
  const sleepStartMinutes = wakeMinutes + 960

  // Sleep Duration: 8 hours (standard)
  // 8 hours * 60 minutes = 480 minutes
  const sleepEndMinutes = sleepStartMinutes + 480

  // --- PROTOCOL WINDOWS ---

  // 1. Light Anchor: Immediate cortisol spike (Wake to +60m)
  const lightStart = wakeMinutes
  const lightEnd = wakeMinutes + 60

  // 2. Caffeine: Delay 90m, Stop 10h before sleep
  // Start: Wake + 90m
  // End: Sleep Start - 10h (600m)
  const caffeineStart = wakeMinutes + 90
  const caffeineEnd = sleepStartMinutes - 600

  // 3. Nadir Dip: The afternoon crash (6-7 hours after wake)
  // Used for NSDR or 20 min nap
  const nadirStart = wakeMinutes + 360 // Wake + 6h
  const nadirEnd = nadirStart + 20 // 20 min duration

  // 4. Vampire Mode: 2 hours before sleep
  const vampireStart = sleepStartMinutes - 120
  const vampireEnd = sleepStartMinutes

  // 5. Metabolic Traffic Light
  // Green: Wake to +8 hours
  const metabolicGreenStart = wakeMinutes
  const metabolicGreenEnd = wakeMinutes + 480

  // Yellow: +8 hours to Sleep Start - 3 hours
  const metabolicYellowStart = metabolicGreenEnd
  const metabolicYellowEnd = sleepStartMinutes - 180

  // Red (Fasting): Sleep Start - 3 hours to Sleep Start
  const metabolicRedStart = metabolicYellowEnd
  const metabolicRedEnd = sleepStartMinutes

  // Helper to create TimeSlot
  const createSlot = (s: number, e: number): TimeSlot => ({
    startMinutes: s,
    endMinutes: e,
    startTime: minutesToTime(s),
    endTime: minutesToTime(e)
  })

  return {
    targetWakeTime: targetWakeTimeStr,
    targetSleepTime: minutesToTime(sleepStartMinutes),
    shiftStart: shiftStartStr,
    shiftEnd: shiftEndStr,

    lightAnchor: createSlot(lightStart, lightEnd),

    caffeineWindow: createSlot(caffeineStart, caffeineEnd),
    caffeineCutoff: minutesToTime(caffeineEnd),

    nadirDip: createSlot(nadirStart, nadirEnd),

    vampireMode: createSlot(vampireStart, vampireEnd),

    mainSleep: createSlot(sleepStartMinutes, sleepEndMinutes),

    metabolic: {
      green: createSlot(metabolicGreenStart, metabolicGreenEnd),
      yellow: createSlot(metabolicYellowStart, metabolicYellowEnd),
      red: createSlot(metabolicRedStart, metabolicRedEnd)
    }
  }
}

// Generate timeline segments for visualization
export function generateTimelineSegments(plan: SleepPlan): {
  segments: TimelineSegment[]
  timelineStart: number
  timelineEnd: number
} {
  // Use a 24h window anchored around Wake Time
  // Start 2 hours before wake for context
  const timelineStart = parseTimeToMinutes(plan.targetWakeTime) - 120
  const timelineEnd = timelineStart + 1440
  const cycle = 1440 // 24 hours

  const baseSegments: TimelineSegment[] = [
    // Shift (Visual Only) - If provided
    ...(plan.shiftStart && plan.shiftEnd ? [{
      label: "Work Shift",
      startMinutes: parseTimeToMinutes(plan.shiftStart),
      endMinutes: parseTimeToMinutes(plan.shiftEnd) <= parseTimeToMinutes(plan.shiftStart)
        ? parseTimeToMinutes(plan.shiftEnd) + 1440
        : parseTimeToMinutes(plan.shiftEnd),
      type: "work" as const,
    }] : []),

    // Main Sleep
    {
      label: "Main Sleep",
      startMinutes: plan.mainSleep.startMinutes,
      endMinutes: plan.mainSleep.endMinutes,
      type: "sleep",
    },

    // Caffeine
    {
      label: "Caffeine OK",
      startMinutes: plan.caffeineWindow.startMinutes,
      endMinutes: plan.caffeineWindow.endMinutes,
      type: "caffeine",
    },

    // Nadir Dip
    {
      label: "Nadir Dip (Nap/NSDR)",
      startMinutes: plan.nadirDip.startMinutes,
      endMinutes: plan.nadirDip.endMinutes,
      type: "nadir",
    },

    // Light Anchor
    {
      label: "Light Anchor",
      startMinutes: plan.lightAnchor.startMinutes,
      endMinutes: plan.lightAnchor.endMinutes,
      type: "light-control"
    },

    // Vampire Mode
    {
      label: "Vampire Mode (Darkness)",
      startMinutes: plan.vampireMode.startMinutes,
      endMinutes: plan.vampireMode.endMinutes,
      type: "vampire-mode",
    },

    // Metabolic
    {
      label: "Green: Complex Carbs",
      startMinutes: plan.metabolic.green.startMinutes,
      endMinutes: plan.metabolic.green.endMinutes,
      type: "metabolic-green",
    },
    {
      label: "Yellow: Protein/Fats",
      startMinutes: plan.metabolic.yellow.startMinutes,
      endMinutes: plan.metabolic.yellow.endMinutes,
      type: "metabolic-yellow",
    },
    {
      label: "Red: Fasting",
      startMinutes: plan.metabolic.red.startMinutes,
      endMinutes: plan.metabolic.red.endMinutes,
      type: "metabolic-red",
    },
  ]

  const wrapped: TimelineSegment[] = []

  // Reuse robust wrapping logic
  for (const seg of baseSegments) {
    let s = seg.startMinutes - timelineStart
    let e = seg.endMinutes - timelineStart

    // Normalize to bring s within reasonable range of [0, cycle]
    while (s < 0) { s += cycle; e += cycle; }
    while (s >= cycle) { s -= cycle; e -= cycle; }

    if (e <= cycle) {
      wrapped.push({ ...seg, startMinutes: timelineStart + s, endMinutes: timelineStart + e })
    }
    else {
      wrapped.push({ ...seg, startMinutes: timelineStart + s, endMinutes: timelineStart + cycle })
      const remainder = e - cycle
      wrapped.push({ ...seg, startMinutes: timelineStart, endMinutes: timelineStart + remainder })
    }
  }

  return { segments: wrapped, timelineStart, timelineEnd }
}
