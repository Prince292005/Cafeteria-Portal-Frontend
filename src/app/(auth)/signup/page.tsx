"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/authContext"; // Corrected path
import { Loader2, CheckCircle } from "lucide-react"; // Icons for status
import toast from "react-hot-toast";
// import logo from "../../../../public/logo.png";

const Signup: React.FC = () => {
  const router = useRouter();
  // Destructure new OTP functions
  const { register, sendOtp, verifyOtp } = useUser();

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    studentId: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });

  // --- OTP State ---
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // --- UI Feedback State ---
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // --- Step 1: Send OTP ---
  const handleSendOtp = async () => {
    if (!formData.emailId) {
      setOtpMessage("Please enter an email first.");
      return;
    }

    setError("");
    setOtpMessage("");
    setOtpLoading(true);

    try {
      // Service expects 'email', form has 'emailId'
      await sendOtp(formData.emailId);
      setIsOtpSent(true);
      setOtpMessage("OTP sent to your email.");
    } catch (err: any) {
      setOtpMessage(err.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpMessage("Please enter the OTP.");
      return;
    }

    setError("");
    setOtpMessage("");
    setOtpLoading(true);

    try {
      await verifyOtp(formData.emailId, otp);
      setIsEmailVerified(true);
      setOtpMessage("Verified successfully!");
      setIsOtpSent(false); // Hide OTP field
    } catch (err: any) {
      setOtpMessage(err.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Step 3: Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isEmailVerified) {
      toast.error("Please verify your email address first.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await register({
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        studentId: formData.studentId,
        emailId: formData.emailId,
        password: formData.password,
      });

      toast.success("Registration successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during registration.");
    }
  };

  return (
    <div
      data-theme="light"
      className="flex min-h-screen items-center justify-center bg-gray-100"
    >
      <div className="card w-full m-10 max-w-lg rounded-2xl shadow-[var(--my-shadow)] bg-base-100">
        <div className="card-body">
          <div className="self-center">
            <Link href="/">
              <img src="/logo.png" className="h-30 w-30" alt="logo" />
            </Link>
          </div>
          <h1 className="text-center text-2xl font-bold text-base-content mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label htmlFor="name" className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="form-control">
              <label htmlFor="mobileNumber" className="label">
                <span className="label-text font-medium">Mobile Number</span>
              </label>
              <input
                type="tel"
                id="mobileNumber"
                placeholder="9998887770"
                pattern="[0-9]*"
                maxLength={10}
                className="input input-bordered w-full"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Student ID */}
            <div className="form-control">
              <label htmlFor="studentId" className="label">
                <span className="label-text font-medium">Student ID</span>
              </label>
              <input
                type="tel"
                id="studentId"
                placeholder="202xxx001"
                pattern="[0-9]*"
                maxLength={9}
                className="input input-bordered w-full"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            {/* --- Email & OTP Section --- */}
            <div className="form-control">
              <label htmlFor="emailId" className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>

              {/* Input Group for Email + Button */}
              <div className="join w-full">
                <input
                  type="email"
                  id="emailId"
                  placeholder="example@dau.ac.in"
                  className={`input input-bordered join-item w-full ${
                    isEmailVerified ? "border-green-500 text-green-600" : ""
                  }`}
                  value={formData.emailId}
                  onChange={handleChange}
                  readOnly={isEmailVerified || isOtpSent}
                  required
                />
                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={
                    otpLoading ||
                    isOtpSent ||
                    isEmailVerified ||
                    !formData.emailId
                  }
                  className={`btn join-item ${
                    isEmailVerified ? "btn-success text-white" : "btn-primary"
                  }`}
                >
                  {otpLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : isEmailVerified ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>

              {/* OTP Input - Visible only when sent */}
              {isOtpSent && !isEmailVerified && (
                <div className="mt-3 animate-fade-in">
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="input input-bordered input-sm join-item w-full"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="btn btn-sm btn-neutral join-item"
                    >
                      {otpLoading ? "..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Status Message */}
              {otpMessage && (
                <label className="label pb-0 pt-1">
                  <span
                    className={`label-text-alt ${
                      isEmailVerified
                        ? "text-green-600 font-bold"
                        : "text-orange-500"
                    }`}
                  >
                    {otpMessage}
                  </span>
                </label>
              )}
            </div>
            {/* --------------------------- */}

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
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label htmlFor="confirmPassword" className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Display Error/Success Messages */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-500 text-center">{success}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full rounded-md"
              disabled={!isEmailVerified} // Disable until verified
            >
              Sign Up
            </button>
          </form>

          <div className="divider">OR</div>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
