"use client"

import type { SleepPlan } from "@/lib/sleep-plan"
import { Coffee, Glasses, Utensils, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardProps {
  plan: SleepPlan
}

export function Dashboard({ plan }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Metabolic Traffic Light */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Metabolic Traffic Light
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <div>
              <p className="text-sm font-medium text-white">Complex Carbs</p>
              <p className="text-xs text-slate-400">{plan.metabolic.green.startTime} - {plan.metabolic.green.endTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <div>
              <p className="text-sm font-medium text-white">Protein/Fats Only</p>
              <p className="text-xs text-slate-400">{plan.metabolic.yellow.startTime} - {plan.metabolic.yellow.endTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <div>
              <p className="text-sm font-medium text-red-400">FASTING MODE</p>
              <p className="text-xs text-slate-400">{plan.metabolic.red.startTime} - {plan.metabolic.red.endTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caffeine Hard Stop */}
      <Card className="bg-slate-800 border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Coffee className="w-24 h-24 text-red-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Caffeine Hard Stop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white block">{plan.caffeineCutoff}</span>
            <p className="text-sm text-red-400 mt-1 font-medium">6 hours before sleep</p>
            <p className="text-xs text-slate-500 mt-3">
              Prevents "tired but wired" feeling. No coffee, tea, or energy drinks after this time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vampire Mode */}
      <Card className="bg-slate-800 border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Glasses className="w-24 h-24 text-purple-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Glasses className="w-4 h-4 text-purple-400" />
            Vampire Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <span className="text-3xl font-bold text-white block">{plan.vampireMode.startTime}</span>
            <p className="text-sm text-purple-400 mt-1 font-medium">Put on sunglasses NOW</p>
            <p className="text-xs text-slate-500 mt-3">
              Critical alert 30 mins before shift ends. Protect melatonin for your commute.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
