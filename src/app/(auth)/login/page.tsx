"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../../contexts/authContext";
import { useRouter } from "next/navigation";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../../../services/authService";
import { X, Loader2, KeyRound, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useUser();

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      router.push(user.role === "ROLE_ADMIN" ? "/admin/dashboard" : "/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ studentId, password });
      toast.success("Welcome back!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
    }
  };

  const handleForgotFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });
    try {
      if (forgotStep === 1) {
        await sendForgotPasswordOtp(forgotEmail);
        setForgotMsg({ type: "success", text: "OTP sent to your email." });
        setForgotStep(2);
      } else if (forgotStep === 2) {
        await verifyForgotPasswordOtp(forgotEmail, forgotOtp);
        setForgotMsg({ type: "success", text: "OTP verified." });
        setForgotStep(3);
      } else {
        await resetPassword(forgotEmail, newPassword);
        setForgotMsg({ type: "success", text: "Password reset successfully!" });
        setTimeout(() => {
          setIsForgotOpen(false);
          setForgotStep(1);
          setForgotMsg({ type: "", text: "" });
        }, 2000);
      }
    } catch (err: unknown) {
      setForgotMsg({ type: "error", text: err instanceof Error ? err.message : "Action failed." });
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setForgotStep(1);
    setForgotMsg({ type: "", text: "" });
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
  };

  const inputClass =
    "w-full bg-[var(--paper-dim)] border border-[var(--kraft-border)] focus:border-[var(--turmeric)] focus:bg-white focus:outline-none rounded-xl px-4 py-3.5 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-all duration-200";

  return (
    <div className="min-h-screen flex bg-[var(--paper)]">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[42%] bg-[var(--espresso)] flex-col justify-between p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DAU Cafeteria" className="h-10 w-10 rounded-xl" />
          <span className="font-display text-xl text-[var(--paper)]">Cafeteria Portal</span>
        </Link>

        <div>
          <p className="font-display text-4xl xl:text-5xl text-[var(--paper)] leading-[1.12] mb-6">
            Your campus
            <br />
            <em className="not-italic text-[var(--turmeric)]">dining voice.</em>
          </p>
          <p className="text-[var(--paper)]/55 text-base leading-relaxed max-w-xs">
            Rate meals, report issues, and help the CMC make every canteen better
            — one tap at a time.
          </p>
        </div>

        <p className="text-[var(--paper)]/30 text-xs">
          © {new Date().getFullYear()} DAU Cafeteria Portal
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DAU" className="h-9 w-9 rounded-xl" />
            <span className="font-display text-lg text-[var(--ink)]">Cafeteria Portal</span>
          </Link>

          <h1 className="font-display text-3xl text-[var(--ink)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--ink-soft)]/70 mb-8">
            Sign in to your DAIICT account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Email address
              </label>
              <input
                type="text"
                placeholder="202xxxxxx@dau.ac.in"
                className={inputClass}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--ink)]">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-semibold text-[var(--turmeric)] hover:underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={inputClass + " pr-12"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-[var(--ink-soft)]/40 hover:text-[var(--ink-soft)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-tactile w-full bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-xl py-3.5 hover:bg-[var(--turmeric-deep)] transition-colors shadow-[0_8px_24px_-8px_rgba(194,65,12,0.5)] mt-2"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-[var(--ink-soft)]/70 mt-6">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--turmeric)] hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot password modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--espresso)]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--paper)] rounded-2xl shadow-2xl border border-[var(--kraft-border)] p-8 relative">
            <button
              onClick={closeForgotModal}
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--turmeric)]/10 rounded-full flex items-center justify-center text-[var(--turmeric)]">
                {forgotStep === 3 ? <CheckCircle size={20} /> : <KeyRound size={20} />}
              </div>
              <div>
                <h3 className="font-display text-xl text-[var(--ink)]">Reset password</h3>
                <p className="text-xs text-[var(--ink-soft)]/60">
                  {forgotStep === 1 && "Enter your registered email."}
                  {forgotStep === 2 && "Enter the OTP sent to your email."}
                  {forgotStep === 3 && "Set your new password."}
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotFlow} className="space-y-4">
              {forgotStep === 1 && (
                <input
                  type="email"
                  placeholder="example@dau.ac.in"
                  className={inputClass}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              )}
              {forgotStep === 2 && (
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={inputClass + " text-center tracking-[0.25em] font-semibold"}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  required
                  autoFocus
                />
              )}
              {forgotStep === 3 && (
                <input
                  type="password"
                  placeholder="New password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
              )}

              {forgotMsg.text && (
                <div
                  className={`text-sm text-center p-3 rounded-xl ${
                    forgotMsg.type === "success"
                      ? "bg-[var(--chalk-green)]/10 text-[var(--chalk-green)]"
                      : "bg-[var(--turmeric)]/10 text-[var(--turmeric-deep)]"
                  }`}
                >
                  {forgotMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-xl py-3.5 hover:bg-[var(--turmeric-deep)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {forgotLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    {forgotStep === 1 && "Send OTP"}
                    {forgotStep === 2 && "Verify OTP"}
                    {forgotStep === 3 && "Reset password"}
                  </>
                )}
              </button>

              {forgotStep > 1 && forgotStep < 3 && (
                <button
                  type="button"
                  onClick={() => { setForgotStep(1); setForgotMsg({ type: "", text: "" }); }}
                  className="w-full text-sm text-[var(--ink-soft)]/60 hover:text-[var(--ink-soft)] transition-colors py-1"
                >
                  Change email
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
