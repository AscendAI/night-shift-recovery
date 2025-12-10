"use client"

import { useState, useMemo } from "react"
import { Moon, RotateCcw, Zap, Sun } from "lucide-react"
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
    const [wakeTime, setWakeTime] = useState("")
    const [shiftStart, setShiftStart] = useState("")
    const [shiftEnd, setShiftEnd] = useState("")
    const [plan, setPlan] = useState<SleepPlan | null>(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const isFormValid = useMemo(() => {
        return wakeTime.trim() !== ""
    }, [wakeTime])

    const handleGeneratePlan = () => {
        setError("")
        setPlan(null)

        if (!wakeTime) {
            setError("Please enter your target wake time.")
            return
        }

        // Validate shift details if provided
        if ((shiftStart && !shiftEnd) || (!shiftStart && shiftEnd)) {
            setError("Please provide both Shift Start and Shift End, or leave both blank.")
            return
        }

        const delayMs = 2000 + Math.floor(Math.random() * 1000)
        setIsLoading(true)

        // Track shift details submission
        posthog.capture('wake_plan_submitted', {
            wakeTime,
            shiftStart,
            shiftEnd,
            timestamp: new Date().toISOString()
        })

        setTimeout(() => {
            try {
                // Shift times are optional now
                const generatedPlan = generatePlan(wakeTime, shiftStart || undefined, shiftEnd || undefined)
                setPlan(generatedPlan)

                // Track successful plan generation
                posthog.capture('sleep_plan_generated', {
                    wakeTime,
                    timestamp: new Date().toISOString()
                })
            } catch {
                setError("Something went wrong. Please check your inputs and try again.")

                // Track plan generation error
                posthog.capture('sleep_plan_error', {
                    wakeTime,
                    timestamp: new Date().toISOString()
                })
            } finally {
                setIsLoading(false)
            }
        }, delayMs)
    }

    const handleReset = () => {
        setWakeTime("")
        setShiftStart("")
        setShiftEnd("")
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Get Your Rhythm Back</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto text-pretty">
                        This tool uses the Huberman Lab protocols to calculate the precise windows for peak focus and deep rest, based entirely on when you actually wake up. Whether you&apos;re fixing a messy sleep schedule, recovering from burnout, or just want steady energy throughout the day—following this protocol will help you get your rhythm back.
                    </p>
                    <div className="mt-8 aspect-video w-full max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg border border-slate-800">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/NAATB55oxeQ"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>

                {/* Input Form */}
                <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Sun className="w-5 h-5 text-amber-400" />
                            What is your goal Wake Time? Start here. We will help you structure the rest of your day.
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Wake Time (Primary) */}
                        <div className="space-y-2">
                            <Label htmlFor="wake-time" className="text-slate-300 text-lg">
                                When do you need to wake up? <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="wake-time"
                                type="time"
                                value={wakeTime}
                                onChange={(e) => setWakeTime(e.target.value)}
                                className="bg-slate-800 border-indigo-500/50 text-white h-12 text-lg"
                            />
                            <p className="text-xs text-slate-500">
                                This is your "Cortisol Anchor." Everything is calculated from here.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-2 text-slate-500">Show my work hours (Optional)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                            {/* Shift Start Time */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-start" className="text-slate-400">
                                    Shift Start (Optional)
                                </Label>
                                <Input
                                    id="shift-start"
                                    type="time"
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            {/* Shift End Time */}
                            <div className="space-y-2">
                                <Label htmlFor="shift-end" className="text-slate-400">
                                    Shift End (Optional)
                                </Label>
                                <Input
                                    id="shift-end"
                                    type="time"
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                onClick={handleGeneratePlan}
                                disabled={!isFormValid || isLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base"
                            >
                                {isLoading ? "Optimizing..." : "Generate Bio-Protocol"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReset}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 h-12"
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
                        <CardTitle className="text-white">Your Personal Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-16 text-slate-400">
                                <Spinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
                                <p>Calculating Adenosine & Cortisol timing...</p>
                            </div>
                        ) : !plan ? (
                            <div className="text-center py-12 text-slate-500">
                                <Moon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>Enter your wake time to see exactly when to fuel up, when to rest, and when to dim the lights.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Summary Header */}
                                <div className="text-center space-y-2">
                                    <p className="text-slate-300">
                                        Your biologically optimized schedule, anchored to your <strong>{plan.targetWakeTime}</strong> wake time.
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
                                        <span className="text-slate-400">Target Sleep:</span>
                                        <span className="font-mono text-white text-lg">
                                            {plan.targetSleepTime}
                                        </span>
                                    </div>
                                </div>

                                {/* Dashboard Widgets */}
                                <Dashboard plan={plan} />

                                {/* Bullet Plan */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Step-by-Step Protocol</h4>
                                    <BulletPlan plan={plan} />
                                </div>

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
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Lead Capture CTA */}
                <LeadCapture />


            </div>
        </div>
    )
}
