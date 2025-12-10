"use client"

import type React from "react"

import { useState } from "react"
import { Mail, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import posthog from "posthog-js"

export function LeadCapture() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            setStatus("error")
            setErrorMessage("Please enter your email address.")
            return
        }

        if (!validateEmail(email)) {
            setStatus("error")
            setErrorMessage("Please enter a valid email address.")
            return
        }
        posthog.identify(email)
        // Track waitlist submission
        posthog.capture('waitlist_submitted', {
            email: email,
            timestamp: new Date().toISOString()
        })

        // For now, just log the email - can be replaced with API call later
        console.log("Lead capture email:", email)

        setStatus("success")
        setEmail("")
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 sm:p-8">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-full">
                    <Mail className="w-6 h-6 text-indigo-400" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">Coming Soon: Build the habit, effortlessly.</h3>

                <div className="space-y-4 max-w-lg mx-auto">
                    <p className="text-slate-400">
                        It&apos;s hard to remember these protocols every day. I&apos;m working on a simple app that helps you stay consistent and build the habit by sending periodic reminders and syncing with your calendar.
                    </p>
                    <p className="text-slate-400">
                        You can apply to get early access. I&apos;ll email you when the TestFlight link is ready.
                    </p>
                </div>

                {status === "success" ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 py-4">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch soon.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6">
                        <div className="flex-1">
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setStatus("idle")
                                    setErrorMessage("")
                                }}
                                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 h-11"
                            />
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6">
                            Join the early access list
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                )}

                {status === "error" && <p className="text-red-400 text-sm">{errorMessage}</p>}

            </div>
        </div>
    )
}
