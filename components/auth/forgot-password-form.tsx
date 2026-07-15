"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { KeyRound, Loader2, Lock, Mail, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

type Step = "email" | "otp" | "reset"

export function ForgotPasswordForm() {
  const router = useRouter()
  const { forgotPasswordSendOtp, forgotPasswordVerifyOtp, forgotPasswordReset } = useAuth()

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await forgotPasswordSendOtp(email)
      toast.success("Verification code sent to your email.")
      setStep("otp")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send a verification code.")
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await forgotPasswordVerifyOtp(email, otp)
      toast.success("Code verified.")
      setStep("reset")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect or expired code.")
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.")
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match.")
    setBusy(true)
    try {
      await forgotPasswordReset(email, newPassword)
      toast.success("Password reset. Please sign in.")
      router.push("/login")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reset your password.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso text-background">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-semibold">Cafeteria Portal</span>
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
          {step === "email" ? "Reset password" : step === "otp" ? "One last step" : "Almost done"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">
          {step === "email" ? "Forgot password?" : step === "otp" ? "Verify your email" : "Set a new password"}
        </h1>
        <p className="mt-2 text-sm text-espresso/60">
          {step === "email"
            ? "Enter your account email and we'll send you a verification code."
            : step === "otp"
              ? `Enter the code we sent to ${email}.`
              : "Choose a new password for your account."}
        </p>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@campus.edu"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send verification code
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
            <Field icon={<KeyRound className="h-4 w-4" />} label="Verification code">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="6-digit code"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify code
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-center text-xs font-medium text-espresso/50 hover:text-espresso"
            >
              &larr; Use a different email
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="mt-8 space-y-4">
            <Field icon={<Lock className="h-4 w-4" />} label="New password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Confirm new password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset password
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-espresso/60">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-terracotta hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso/50">
        {label}
      </span>
      <span className="flex items-center gap-3 rounded-2xl border border-espresso/12 bg-card px-4 py-3 text-sm transition-colors focus-within:border-terracotta">
        <span className="text-espresso/40">{icon}</span>
        {children}
      </span>
    </label>
  )
}
