"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import {
  Loader2,
  Lock,
  Mail,
  User2,
  UtensilsCrossed,
  Hash,
  Phone,
  KeyRound,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const { login, signup, sendOtp, verifyOtp } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  // Signup requires OTP verification before the backend will register the
  // account, so signup is a two-step flow: fill details -> verify email.
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)

  const isLogin = mode === "login"

  useEffect(() => {
    if (!isLogin) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("expired") === "1") {
      toast.error("Your session expired. Please sign in again.")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [isLogin])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}!`)
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password.")
    } finally {
      setBusy(false)
    }
  }

  const handleSendOtp = async () => {
    if (!name || !email || !mobileNumber || !studentId || password.length < 6) {
      toast.error("Please fill all fields (password min 6 characters).")
      return
    }
    setBusy(true)
    try {
      await sendOtp(email)
      setOtpStep(true)
      toast.success("Verification code sent to your email.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send verification code.")
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (!otpVerified) {
        const ok = await verifyOtp(email, otp)
        if (!ok) {
          toast.error("Incorrect or expired code. Please try again.")
          setBusy(false)
          return
        }
        setOtpVerified(true)
      }
      const user = await signup(name, email, password, mobileNumber, studentId)
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`)
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/images/hero-spread.png"
          alt="Campus canteen spread"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/50 to-espresso/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-background">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/15 backdrop-blur">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-semibold">Cafeteria Portal</span>
          </Link>
          <div>
            <h2 className="max-w-md text-balance font-serif text-4xl font-semibold leading-tight">
              Good food, honestly served.
            </h2>
            <p className="mt-3 max-w-sm text-background/70">
              Rate meals, raise complaints, and help the food committee keep every campus canteen accountable.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso text-background">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">Cafeteria Portal</span>
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
            {isLogin ? "Welcome back" : otpStep ? "One last step" : "Join the portal"}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">
            {isLogin ? "Sign in" : otpStep ? "Verify your email" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-espresso/60">
            {isLogin
              ? "Access your dashboard, ratings, and complaints."
              : otpStep
              ? `Enter the code we sent to ${email}.`
              : "Use your college email to start rating campus food."}
          </p>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
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
              <Field icon={<Lock className="h-4 w-4" />} label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none"
                />
              </Field>
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs font-medium text-espresso/50 hover:text-terracotta">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </form>
          ) : !otpStep ? (
            <div className="mt-8 space-y-4">
              <Field icon={<User2 className="h-4 w-4" />} label="Full name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Aditya Menon"
                  className="w-full bg-transparent outline-none"
                />
              </Field>
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
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<Hash className="h-4 w-4" />} label="Student ID">
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    placeholder="202301126"
                    className="w-full bg-transparent outline-none"
                  />
                </Field>
                <Field icon={<Phone className="h-4 w-4" />} label="Mobile">
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    required
                    inputMode="numeric"
                    placeholder="9876543210"
                    className="w-full bg-transparent outline-none"
                  />
                </Field>
              </div>
              <Field icon={<Lock className="h-4 w-4" />} label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none"
                />
              </Field>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Send verification code
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="mt-8 space-y-4">
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
                Verify &amp; create account
              </button>
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="w-full text-center text-xs font-medium text-espresso/50 hover:text-espresso"
              >
                &larr; Back to details
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-espresso/60">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-terracotta hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </motion.div>
      </div>
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
