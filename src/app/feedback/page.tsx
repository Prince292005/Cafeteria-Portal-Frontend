import React from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import Link from "next/link";
import { ArrowLeft, MessageSquareHeart } from "lucide-react";

export const metadata = {
  title: "Feedback | Cafeteria Portal",
  description: "Share your dining experience with us.",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      {/* Navigation */}
      <div className="w-full max-w-lg mb-4">
        <Link
          href="/"
          className="btn btn-ghost rounded-lg btn-sm gap-2 text-base-content/70 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Main Card */}
      <div className="card w-full max-w-xl bg-base-100 shadow-xl overflow-hidden border border-base-200">
        {/* Header */}
        <div className="bg-primary/5 p-8 text-center border-b border-base-200">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-base-content mb-2">
            We Value Your Opinion
          </h1>
          <p className="text-base-content/70 text-sm max-w-xs mx-auto">
            Please select a canteen below and help us improve.
          </p>
        </div>

        {/* Form Body */}
        <div className="card-body p-6 md:p-8 bg-gray-50/30">
          {/* We removed the prop canteenId={...} because the dropdown handles it now */}
          <FeedbackForm />
        </div>
      </div>

      <p className="text-center text-xs text-base-content/40 mt-8">
        © 2025 Cafeteria Portal. All rights reserved.
      </p>
    </div>
  );
}
