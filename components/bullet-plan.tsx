"use client"

import type { SleepPlan } from "@/lib/sleep-plan"
import { Coffee, Moon, Sun, Glasses, AlertTriangle, Clock, Utensils } from "lucide-react"

interface BulletPlanProps {
  plan: SleepPlan
}

export function BulletPlan({ plan }: BulletPlanProps) {
  const bullets = [
    {
      time: `${plan.anchorNap.startTime} – ${plan.anchorNap.endTime}`,
      icon: Moon,
      iconColor: "text-indigo-400",
      title: "Anchor Nap",
      description: 'Take a 90-minute nap to "bank" sleep before your shift.',
    },
    {
      time: plan.metabolic.green.startTime,
      icon: Utensils,
      iconColor: "text-green-400",
      title: "Green Zone: Eat Complex Carbs",
      description: "Start your wake window with slow-release energy.",
    },
    {
      time: plan.shiftStartTime,
      icon: Clock,
      iconColor: "text-amber-400",
      title: "Shift Starts",
      description: "Begin your work shift.",
    },
    {
      time: plan.metabolic.yellow.startTime,
      icon: Utensils,
      iconColor: "text-yellow-400",
      title: "Yellow Zone: Protein & Fats",
      description: "Switch to protein and healthy fats to sustain energy without the crash.",
    },
    {
      time: plan.caffeineCutoff,
      icon: AlertTriangle,
      iconColor: "text-red-400",
      title: "CAFFEINE HARD STOP",
      description: "No more coffee. 6 hours before sleep to prevent 'tired but wired'.",
      highlight: true,
    },
    {
      time: plan.metabolic.red.startTime,
      icon: Utensils,
      iconColor: "text-red-400",
      title: "Red Zone: FASTING MODE",
      description: "Stop eating 3 hours before sleep to avoid bloating and improve rest.",
    },
    {
      time: plan.vampireMode.startTime,
      icon: Glasses,
      iconColor: "text-purple-400",
      title: "VAMPIRE MODE: Sunglasses ON",
      description: "Critical! Protect your melatonin production 30 mins before shift ends.",
      highlight: true,
    },
    {
      time: `${plan.mainSleep.startTime} – ${plan.mainSleep.endTime}`,
      icon: Sun,
      iconColor: "text-indigo-400",
      title: "Main Sleep Window",
      description: "Use blackout curtains, cool room, and phone on Do Not Disturb.",
    },
  ]

  return (
    <div className="space-y-4">
      {bullets.map((bullet, index) => {
        const Icon = bullet.icon
        return (
          <div
            key={index}
            className={`flex gap-4 p-3 rounded-lg ${
              bullet.highlight ? "bg-red-900/30 border border-red-800/50" : "bg-slate-800/50"
            }`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${bullet.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-mono text-slate-400 flex-shrink-0">{bullet.time}</span>
                <span className={`font-semibold ${bullet.highlight ? "text-red-300" : "text-white"}`}>
                  {bullet.title}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{bullet.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
