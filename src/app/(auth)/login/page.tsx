"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../../contexts/authContext";
import { useRouter } from "next/navigation";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../../../services/authService"; // Ensure this path is correct
import { X, Loader2, KeyRound, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  // 1. Manage state for inputs and errors
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // 2. Get context
  const { login, user } = useUser();

  // --- FORGOT PASSWORD STATE ---
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: "", text: "" });

  // 3. Handle Redirection based on Role
  useEffect(() => {
    if (user) {
      if (user.role === "ROLE_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  // 4. Handle Login Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ studentId: studentId, password });
      toast.success("Logged in successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during login.");
    }
  };

  // --- FORGOT PASSWORD HANDLERS ---

  const handleForgotFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      if (forgotStep === 1) {
        // Step 1: Send OTP
        await sendForgotPasswordOtp(forgotEmail);
        setForgotMsg({ type: "success", text: "OTP sent to your email." });
        setForgotStep(2);
      } else if (forgotStep === 2) {
        // Step 2: Verify OTP
        await verifyForgotPasswordOtp(forgotEmail, forgotOtp);
        setForgotMsg({ type: "success", text: "OTP Verified." });
        setForgotStep(3);
      } else if (forgotStep === 3) {
        // Step 3: Reset Password
        await resetPassword(forgotEmail, newPassword);
        setForgotMsg({ type: "success", text: "Password reset successfully!" });

        // Close modal after success
        setTimeout(() => {
          setIsForgotOpen(false);
          setForgotStep(1);
          setForgotMsg({ type: "", text: "" });
          // Optional: Pre-fill student ID if it matches email structure (rare for ID, but okay)
        }, 2000);
      }
    } catch (err: any) {
      setForgotMsg({ type: "error", text: err.message || "Action failed." });
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

  return (
    <div
      data-theme="light"
      className="flex min-h-screen min-w-fit items-center justify-center bg-gray-100"
    >
      <div className="card w-full m-10 max-w-lg rounded-2xl shadow-[var(--my-shadow)] bg-base-100">
        <div className="card-body">
          <div className="self-center">
            <Link href="/">
              <img src="/logo.png" className="h-30 w-30" alt="logo" />
            </Link>
          </div>
          <h1 className="text-center text-2xl font-bold text-base-content">
            Welcome Back
          </h1>
          <p className="text-center text-sm text-gray-500 mb-4">
            Please sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student ID (Modified label from Email to match context) */}
            <div className="form-control">
              <label htmlFor="studentId" className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="text"
                id="studentId"
                placeholder="202xxxxxx@dau.ac.in"
                className="input input-bordered w-full"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* Forgot Password Link */}
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Display Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button type="submit" className="btn btn-primary w-full rounded-md">
              Sign In
            </button>
          </form>

          <div className="divider">OR</div>

          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="link link-primary font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="card-body relative">
              {/* Close Button */}
              <button
                onClick={closeForgotModal}
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
                  {forgotStep === 3 ? (
                    <CheckCircle size={24} />
                  ) : (
                    <KeyRound size={24} />
                  )}
                </div>
                <h3 className="text-lg font-bold">Reset Password</h3>
                <p className="text-sm text-gray-500">
                  {forgotStep === 1 && "Enter your email to receive an OTP."}
                  {forgotStep === 2 && "Enter the OTP sent to your email."}
                  {forgotStep === 3 && "Create a new password."}
                </p>
              </div>

              <form onSubmit={handleForgotFlow} className="space-y-4">
                {/* STEP 1: EMAIL */}
                {forgotStep === 1 && (
                  <div className="form-control">
                    <label className="label pt-0">
                      <span className="label-text">Registered Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@dau.ac.in"
                      className="input input-bordered w-full"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}

                {/* STEP 2: OTP */}
                {forgotStep === 2 && (
                  <div className="form-control">
                    <label className="label pt-0">
                      <span className="label-text">Enter OTP</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="input input-bordered w-full tracking-widest text-center"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {forgotStep === 3 && (
                  <div className="form-control">
                    <label className="label pt-0">
                      <span className="label-text">New Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}

                {/* Feedback Message */}
                {forgotMsg.text && (
                  <div
                    className={`text-sm text-center p-2 rounded ${
                      forgotMsg.type === "success"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {forgotMsg.text}
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      {forgotStep === 1 && "Send OTP"}
                      {forgotStep === 2 && "Verify OTP"}
                      {forgotStep === 3 && "Reset Password"}
                    </>
                  )}
                </button>

                {forgotStep > 1 && forgotStep < 3 && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setForgotMsg({ type: "", text: "" });
                      }}
                      className="btn btn-link btn-xs no-underline text-gray-500"
                    >
                      Change Email
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
