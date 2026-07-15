"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Role, User } from "@/lib/types"
import { authApi, getToken, setToken } from "@/lib/api"

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (
    name: string,
    email: string,
    password: string,
    mobileNumber: string,
    studentId: string,
  ) => Promise<User>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<boolean>
  forgotPasswordSendOtp: (email: string) => Promise<void>
  forgotPasswordVerifyOtp: (email: string, otp: string) => Promise<void>
  forgotPasswordReset: (email: string, newPassword: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const USER_STORAGE_KEY = "messhall.user"

// The backend JWT only carries the subject (email); role and studentId come
// back separately from /auth/login's JSON response. We store all three
// together so a page refresh doesn't lose the session.
function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function roleFromBackend(roleStr: string): Role {
  // Backend returns "ROLE_ADMIN" / "ROLE_USER" (Spring Security convention)
  return roleStr.toUpperCase().includes("ADMIN") ? "ADMIN" : "USER"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, restore session only if a token still exists — avoids
    // showing a "logged in" UI with a stale/expired token.
    const token = getToken()
    const stored = loadStoredUser()
    if (token && stored) setUser(stored)
    setLoading(false)
  }, [])

  const persist = useCallback((u: User | null) => {
    setUser(u)
    try {
      if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password)
      setToken(res.token)
      const u: User = {
        id: 0, // backend doesn't return a numeric id at login; not used for display
        name: email.split("@")[0],
        email: res.studentId, // backend's "studentId" field holds the email at login
        role: roleFromBackend(res.role),
      }
      persist(u)
      return u
    },
    [persist],
  )

  const sendOtp = useCallback(async (email: string) => {
    await authApi.sendOtp(email)
  }, [])

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const result = await authApi.verifyOtp(email, otp)
    return Boolean(result)
  }, [])

  const forgotPasswordSendOtp = useCallback(async (email: string) => {
    await authApi.forgotPasswordSendOtp(email)
  }, [])

  const forgotPasswordVerifyOtp = useCallback(async (email: string, otp: string) => {
    await authApi.forgotPasswordVerifyOtp(email, otp)
  }, [])

  const forgotPasswordReset = useCallback(async (email: string, newPassword: string) => {
    await authApi.forgotPasswordReset(email, newPassword)
  }, [])

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      mobileNumber: string,
      studentId: string,
    ) => {
      if (!name || !email || password.length < 6) {
        throw new Error("Please fill all fields (password min 6 characters).")
      }
      if (!mobileNumber || !studentId) {
        throw new Error("Mobile number and student ID are required.")
      }
      // Backend hard-requires OTP verification before /auth/register will
      // succeed — sendOtp + verifyOtp must have already run (see the OTP
      // step in the signup form) before this is called.
      //
      // Note: every public signup is a student (USER) account. The backend
      // ignores any role sent from the client and always assigns USER —
      // committee/admin accounts are granted by promoting an existing
      // user's role directly in the database, never through self-registration.
      await authApi.register({
        studentId,
        name,
        emailId: email,
        mobileNumber: Number(mobileNumber),
        password,
        userRole: "USER",
      })
      // Registration succeeded — log the new user in immediately for a
      // smooth signup -> logged-in flow.
      return login(email, password)
    },
    [login],
  )

  const logout = useCallback(() => {
    setToken(null)
    persist(null)
  }, [persist])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      sendOtp,
      verifyOtp,
      forgotPasswordSendOtp,
      forgotPasswordVerifyOtp,
      forgotPasswordReset,
      logout,
    }),
    [
      user,
      loading,
      login,
      signup,
      sendOtp,
      verifyOtp,
      forgotPasswordSendOtp,
      forgotPasswordVerifyOtp,
      forgotPasswordReset,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
