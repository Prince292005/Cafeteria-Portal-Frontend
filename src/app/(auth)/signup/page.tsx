"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/authContext";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Signup: React.FC = () => {
  const router = useRouter();
  const { register, sendOtp, verifyOtp } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    studentId: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.emailId) { setOtpMessage("Please enter an email first."); return; }
    setOtpMessage(""); setOtpLoading(true);
    try {
      await sendOtp(formData.emailId);
      setIsOtpSent(true);
      setOtpMessage("OTP sent — check your inbox.");
      setOtpSuccess(false);
    } catch (err: unknown) {
      setOtpMessage(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setOtpMessage("Please enter the OTP."); return; }
    setOtpMessage(""); setOtpLoading(true);
    try {
      await verifyOtp(formData.emailId, otp);
      setIsEmailVerified(true);
      setIsOtpSent(false);
      setOtpMessage("Email verified.");
      setOtpSuccess(true);
    } catch (err: unknown) {
      setOtpMessage(err instanceof Error ? err.message : "Invalid OTP.");
    } finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) { toast.error("Please verify your email first."); return; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match."); return; }
    try {
      await register({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        studentId: formData.studentId,
        emailId: formData.emailId,
        password: formData.password,
      });
      toast.success("Account created! Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  const inputClass =
    "w-full bg-[var(--paper-dim)] border border-[var(--kraft-border)] focus:border-[var(--turmeric)] focus:bg-white focus:outline-none rounded-xl px-4 py-3.5 text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-all duration-200";

  return (
    <div className="min-h-screen flex bg-[var(--paper)]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-[var(--espresso)] flex-col justify-between p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DAU Cafeteria" className="h-10 w-10 rounded-xl" />
          <span className="font-display text-xl text-[var(--paper)]">Cafeteria Portal</span>
        </Link>
        <div>
          <p className="font-display text-4xl xl:text-5xl text-[var(--paper)] leading-[1.12] mb-6">
            Join 2,000+
            <br />
            <em className="not-italic text-[var(--turmeric)]">DAIICT students.</em>
          </p>
          <p className="text-[var(--paper)]/55 text-base leading-relaxed max-w-xs">
            Your feedback shapes what happens in the cafeteria. One account,
            every canteen, full visibility on every complaint you file.
          </p>
        </div>
        <p className="text-[var(--paper)]/30 text-xs">
          © {new Date().getFullYear()} DAU Cafeteria Portal
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DAU" className="h-9 w-9 rounded-xl" />
            <span className="font-display text-lg text-[var(--ink)]">Cafeteria Portal</span>
          </Link>

          <h1 className="font-display text-3xl text-[var(--ink)] mb-1">Create account</h1>
          <p className="text-sm text-[var(--ink-soft)]/70 mb-8">
            Use your DAIICT email to register.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">Full name</label>
              <input type="text" id="name" placeholder="John Doe" className={inputClass}
                value={formData.name} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">Student ID</label>
                <input type="tel" id="studentId" placeholder="202xxx001" className={inputClass}
                  pattern="[0-9]*" maxLength={9} value={formData.studentId} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">Mobile</label>
                <input type="tel" id="mobileNumber" placeholder="9998887770" className={inputClass}
                  pattern="[0-9]*" maxLength={10} value={formData.mobileNumber} onChange={handleChange} required />
              </div>
            </div>

            {/* Email + OTP */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">Email address</label>
              <div className="flex gap-2">
                <input type="email" id="emailId" placeholder="example@dau.ac.in"
                  className={inputClass + (isEmailVerified ? " border-[var(--chalk-green)] bg-[var(--chalk-green)]/5" : "")}
                  value={formData.emailId} onChange={handleChange}
                  readOnly={isEmailVerified || isOtpSent} required />
                <button type="button" onClick={handleSendOtp}
                  disabled={otpLoading || isOtpSent || isEmailVerified || !formData.emailId}
                  className={`shrink-0 px-4 rounded-xl font-semibold text-sm transition-all ${
                    isEmailVerified
                      ? "bg-[var(--chalk-green)]/15 text-[var(--chalk-green)] cursor-default"
                      : "bg-[var(--turmeric)] text-[var(--paper)] hover:bg-[var(--turmeric-deep)] disabled:opacity-40"
                  }`}>
                  {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEmailVerified ? <CheckCircle className="w-4 h-4" /> : "Verify"}
                </button>
              </div>

              {isOtpSent && !isEmailVerified && (
                <div className="flex gap-2 mt-2">
                  <input type="text" placeholder="Enter OTP"
                    className={inputClass + " text-center tracking-[0.2em] font-semibold"}
                    value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus />
                  <button type="button" onClick={handleVerifyOtp} disabled={otpLoading}
                    className="shrink-0 px-4 rounded-xl font-semibold text-sm bg-[var(--espresso)] text-[var(--paper)] hover:opacity-90 transition-opacity disabled:opacity-40">
                    {otpLoading ? "..." : "Submit"}
                  </button>
                </div>
              )}

              {otpMessage && (
                <p className={`text-xs mt-1 ${otpSuccess ? "text-[var(--chalk-green)]" : "text-[var(--turmeric-deep)]"}`}>
                  {otpMessage}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} id="password" placeholder="••••••••"
                  className={inputClass + " pr-12"} value={formData.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-[var(--ink-soft)]/40 hover:text-[var(--ink-soft)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">Confirm password</label>
              <input type="password" id="confirmPassword" placeholder="••••••••"
                className={inputClass} value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <button type="submit" disabled={!isEmailVerified}
              className="btn-tactile w-full bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-xl py-3.5 hover:bg-[var(--turmeric-deep)] transition-colors shadow-[0_8px_24px_-8px_rgba(194,65,12,0.5)] disabled:opacity-40 disabled:pointer-events-none mt-2">
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-[var(--ink-soft)]/70 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--turmeric)] hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
