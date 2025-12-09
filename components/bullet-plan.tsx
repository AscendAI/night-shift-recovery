"use client"

import type { SleepPlan } from "@/lib/sleep-plan"
import { Coffee, Moon, Sun, Glasses, AlertTriangle, Clock, Utensils, Battery, Zap } from "lucide-react"

interface BulletPlanProps {
  plan: SleepPlan
}

export function BulletPlan({ plan }: BulletPlanProps) {
  const bullets = [
    {
      time: `${plan.lightAnchor.startTime} – ${plan.lightAnchor.endTime}`,
      icon: Sun,
      iconColor: "text-amber-400",
      title: "Wake & Light Anchor",
      description: "Get bright light immediately (outdoor or artificial) to spike Cortisol.",
    },
    {
      time: plan.metabolic.green.startTime,
      icon: Utensils,
      iconColor: "text-green-400",
      title: "Green Zone: Complex Carbs",
      description: "Eat your carbs early in the day when insulin sensitivity is highest.",
    },
    {
      time: plan.caffeineWindow.startTime,
      icon: Coffee,
      iconColor: "text-amber-400",
      title: "Caffeine Unlock (90m Delay)",
      description: "Allowed to start caffeine now. (Adenosine has cleared naturally).",
    },
    {
      time: `${plan.nadirDip.startTime} – ${plan.nadirDip.endTime}`,
      icon: Battery,
      iconColor: "text-indigo-400",
      title: "Nadir Dip (NSDR / Nap)",
      description: "Natural energy drop. Do 20 min Nap or NSDR (Non-Sleep Deep Rest). No heavy work.",
    },
    {
      time: plan.metabolic.yellow.startTime,
      icon: Utensils,
      iconColor: "text-yellow-400",
      title: "Yellow Zone: Protein & Fats",
      description: "Switch to protein/fats. Stop carbs to prepare for sleep mode.",
    },
    {
      time: plan.caffeineCutoff,
      icon: AlertTriangle,
      iconColor: "text-red-400",
      title: "CAFFEINE HARD STOP",
      description: "10 hours before sleep. Zero caffeine from this point onwards.",
      highlight: true,
    },
    {
      time: plan.metabolic.red.startTime,
      icon: Utensils,
      iconColor: "text-red-400",
      title: "Red Zone: FASTING MODE",
      description: "Stop eating 3 hours before sleep to avoid digestion interfering with Deep Sleep.",
    },
    {
      time: plan.vampireMode.startTime,
      icon: Glasses,
      iconColor: "text-purple-400",
      title: "VAMPIRE MODE: Dim Lights",
      description: "2 hours before sleep. Wear blue-light blockers. Dim screens.",
      highlight: true,
    },
    {
      time: `${plan.mainSleep.startTime} – ${plan.mainSleep.endTime}`,
      icon: Moon,
      iconColor: "text-indigo-400",
      title: "Sleep Opportunity",
      description: "Cool room (65°F/18°C). Blackout curtains. 7.5+ hours.",
    },
  ]

  return (
    <div className="space-y-4">
      {bullets.map((bullet, index) => {
        const Icon = bullet.icon
        return (
          <div
            key={index}
            className={`flex gap-4 p-3 rounded-lg ${bullet.highlight ? "bg-red-900/30 border border-red-800/50" : "bg-slate-800/50"
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
