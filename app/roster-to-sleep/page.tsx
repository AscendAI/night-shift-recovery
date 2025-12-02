"use client"

import { useState, useMemo } from "react"
import { Moon, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/timeline"
import { BulletPlan } from "@/components/bullet-plan"
import { Dashboard } from "@/components/dashboard"
import { LeadCapture } from "@/components/lead-capture"
import { Spinner } from "@/components/ui/spinner"
import { generatePlan, generateTimelineSegments, parseTimeToMinutes, type SleepPlan } from "@/lib/sleep-plan"
import posthog from "posthog-js"

export default function RosterToSleepPage() {
    const [shiftDate, setShiftDate] = useState("")
    const [shiftStart, setShiftStart] = useState("")
    const [shiftEnd, setShiftEnd] = useState("")
    const [shiftLabel, setShiftLabel] = useState("")
    const [plan, setPlan] = useState<SleepPlan | null>(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const isFormValid = useMemo(() => {
        return shiftStart.trim() !== "" && shiftEnd.trim() !== ""
    }, [shiftStart, shiftEnd])

    const handleGeneratePlan = () => {
        setError("")
        setPlan(null)

        if (!shiftStart || !shiftEnd) {
            setError("Please enter both shift start and end times.")
            return
        }

        const startMinutes = parseTimeToMinutes(shiftStart)
        const endMinutes = parseTimeToMinutes(shiftEnd)

        // Check for same start and end time
        if (startMinutes === endMinutes) {
            setError("Shift start and end times cannot be the same.")
            return
        }

        const delayMs = 3000 + Math.floor(Math.random() * 2000)
        setIsLoading(true)

        // Track shift details submission
        posthog.capture('shift_details_submitted', {
            shiftStart,
            shiftEnd,
            shiftDate: shiftDate || null,
            shiftLabel: shiftLabel || null,
            timestamp: new Date().toISOString()
        })

        setTimeout(() => {
            try {
                const generatedPlan = generatePlan(shiftStart, shiftEnd)
                setPlan(generatedPlan)

                // Track successful plan generation
                posthog.capture('sleep_plan_generated', {
                    shiftStart,
                    shiftEnd,
                    shiftDurationHours: generatedPlan.shiftDurationHours,
                    timestamp: new Date().toISOString()
                })
            } catch {
                setError("Something went wrong. Please check your inputs and try again.")

                // Track plan generation error
                posthog.capture('sleep_plan_error', {
                    shiftStart,
                    shiftEnd,
                    timestamp: new Date().toISOString()
                })
            } finally {
                setIsLoading(false)
            }
        }, delayMs)
    }

    const handleReset = () => {
        setShiftDate("")
        setShiftStart("")
        setShiftEnd("")
        setShiftLabel("")
        setPlan(null)
        setError("")
    }

    const timelineData = useMemo(() => {
        if (!plan) return null
        return generateTimelineSegments(plan)
    }, [plan])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-2xl mb-4">
                        <Moon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">The Shift Work Recovery Calculator</h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto text-pretty">
                        Translate your shift schedule into a science-backed protocol for sleep and energy management.
                    </p>
                    <p className="text-sm text-slate-500">
                        Designed for Nocturnals and NightShift
                    </p>
                </div>

                {/* Input Form */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Enter Your Shift Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Shift Date */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-date" className="text-slate-300">
                                    Shift Date <span className="text-slate-500">(optional)</span>
                                </Label>
                                <Input
                                    id="shift-date"
                                    type="date"
                                    value={shiftDate}
                                    onChange={(e) => setShiftDate(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            {/* Shift Label */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-label" className="text-slate-300">
                                    Shift Label <span className="text-slate-500">(optional)</span>
                                </Label>
                                <Input
                                    id="shift-label"
                                    type="text"
                                    placeholder="e.g., Night shift"
                                    value={shiftLabel}
                                    onChange={(e) => setShiftLabel(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                />
                            </div>

                            {/* Shift Start Time */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-start" className="text-slate-300">
                                    Shift Start Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="shift-start"
                                    type="time"
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <p className="text-xs text-slate-500">Use 24-hour format</p>
                            </div>

                            {/* Shift End Time */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-end" className="text-slate-300">
                                    Shift End Time <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="shift-end"
                                    type="time"
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <p className="text-xs text-slate-500">Shifts crossing midnight are handled automatically</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                onClick={handleGeneratePlan}
                                disabled={!isFormValid || isLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Generating…" : "Generate Plan"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReset}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>

                        {/* Error Message */}
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Your Sleep & Caffeine Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-16 text-slate-400">
                                <Spinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
                                <p>Generating your sleep & caffeine plan…</p>
                                <p className="text-xs text-slate-500 mt-2">This takes a few seconds.</p>
                            </div>
                        ) : !plan ? (
                            <div className="text-center py-12 text-slate-500">
                                <Moon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>Enter your shift above and click &quot;Generate Plan&quot; to see your sleep + caffeine timeline.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Summary Header */}
                                <div className="text-center space-y-2">
                                    <p className="text-slate-300">Here&apos;s your suggested sleep & caffeine plan around this shift.</p>
                                    <div className="inline-flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
                                        <span className="text-slate-400">Shift:</span>
                                        <span className="font-mono text-white">
                                            {plan.shiftStartTime} → {plan.shiftEndTime}
                                        </span>
                                        <span className="text-slate-500">({plan.shiftDurationHours} hours)</span>
                                    </div>
                                    {(shiftDate || shiftLabel) && (
                                        <div className="text-sm text-slate-500">
                                            {shiftLabel && <span>{shiftLabel}</span>}
                                            {shiftLabel && shiftDate && <span> · </span>}
                                            {shiftDate && <span>{shiftDate}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Dashboard Widgets */}
                                <Dashboard plan={plan} />

                                {/* Visual Timeline */}
                                {timelineData && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Visual Timeline</h4>
                                        <Timeline
                                            segments={timelineData.segments}
                                            timelineStart={timelineData.timelineStart}
                                            timelineEnd={timelineData.timelineEnd}
                                        />
                                    </div>
                                )}

                                {/* Bullet Plan */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Step-by-Step Plan</h4>
                                    <BulletPlan plan={plan} />
                                </div>

                                {/* Disclaimer */}
                                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-slate-500">
                                        This is a heuristic tool based on general sleep science principles and is not medical advice.
                                        Consult a healthcare provider for personalized guidance.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Lead Capture CTA */}
                <LeadCapture />

                {/* Footer */}
                <footer className="text-center text-sm text-slate-600 pb-8">
                    Built with ❤️ for shift workers everywhere by
                    {" "}
                    <a
                        href="https://www.ascendai.site"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white underline underline-offset-4"
                    >
                        Ascend AI
                    </a>
                </footer>
            </div>
        </div>
    )
}
