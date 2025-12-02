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
}

export interface TimelineSegment {
  label: string
  startMinutes: number
  endMinutes: number
  type: "sleep" | "caffeine" | "work" | "light-control"
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

  // Caffeine Window: from shift start to 70% through the shift
  const caffeineStart = shiftStartMinutes
  const caffeineEnd = shiftStartMinutes + Math.floor(shiftDurationMinutes * 0.7)

  // Sunglasses: from shift end for 1 hour
  const sunglassesStart = shiftEndMinutes
  const sunglassesEnd = shiftEndMinutes + 60

  // Main Sleep: starts 1 hour after shift ends, 7 hours duration
  const mainSleepStart = shiftEndMinutes + 60
  const mainSleepEnd = mainSleepStart + 420 // 7 hours

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
  }
}

// Generate timeline segments for visualization
export function generateTimelineSegments(plan: SleepPlan): {
  segments: TimelineSegment[]
  timelineStart: number
  timelineEnd: number
} {
  // Timeline window: 8 hours before shift start to 16 hours after shift start
  const timelineStart = plan.shiftStart - 480 // 8 hours before
  const timelineEnd = plan.shiftStart + 960 // 16 hours after

  const segments: TimelineSegment[] = [
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
    {
      label: "Light Control",
      startMinutes: plan.sunglasses.startMinutes,
      endMinutes: plan.sunglasses.endMinutes,
      type: "light-control",
    },
    {
      label: "Main Sleep",
      startMinutes: plan.mainSleep.startMinutes,
      endMinutes: plan.mainSleep.endMinutes,
      type: "sleep",
    },
  ]

  return { segments, timelineStart, timelineEnd }
}
