"use client"

import type React from "react"

import { useState } from "react"
import { Mail, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

        <h3 className="text-xl sm:text-2xl font-bold text-white">Tired of recalculating this every week?</h3>

        <p className="text-slate-400 max-w-md mx-auto">
          Drop your email to get early access to the app that syncs your roster-to-sleep plan directly into your Google
          Calendar.
        </p>

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
              Get Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {status === "error" && <p className="text-red-400 text-sm">{errorMessage}</p>}
      </div>
    </div>
  )
}
