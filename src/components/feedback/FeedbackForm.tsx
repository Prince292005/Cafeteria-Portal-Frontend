"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/authContext";
import {
  getFeedbackQuestions,
  submitFeedback,
  mapRatingToEnum,
  FeedbackQuestion,
  FeedbackSubmissionItem,
} from "@/services/feedbackService";
import { Loader2, Star, Store, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import { getPublicCanteens } from "@/services/publicService";

const FeedbackForm: React.FC = () => {
  const { user } = useUser();

  // --- State ---
  // 1. Store Canteens in State
  const [canteens, setCanteens] = useState<{ id: string; name: string }[]>([]);

  const [selectedCanteen, setSelectedCanteen] = useState<string>("");
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);

  // Stores answers: Key = questionId, Value = { rating, reason }
  const [answers, setAnswers] = useState<
    Record<number, { rating: number; reason: string }>
  >({});

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- 1. Fetch Canteens on Mount ---
  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const data = await getPublicCanteens();
        // Map backend data to simple dropdown format
        setCanteens(
          data.map((c) => ({ id: c.id.toString(), name: c.canteenName }))
        );
      } catch (err) {
        console.error("Failed to load canteens:", err);
        toast.error("Failed to load canteen list");
      }
    };
    fetchCanteens();
  }, []);

  // --- 2. Fetch Questions when Canteen Changes ---
  useEffect(() => {
    if (!selectedCanteen) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const data = await getFeedbackQuestions(selectedCanteen);
        setQuestions(data);
        // Reset answers when canteen changes
        setAnswers({});
      } catch (error) {
        console.error(error);
        toast.error("Failed to load questions for this canteen.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedCanteen]);

  // --- Handlers ---

  const handleRatingChange = (qId: number, rating: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], rating },
    }));
  };

  const handleReasonChange = (qId: number, reason: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], rating: prev[qId]?.rating || 0, reason },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCanteen) {
      toast.error("Please select a canteen.");
      return;
    }

    // Validation: Ensure all questions are answered
    const unanswered = questions.some(
      (q) => !answers[q.id] || answers[q.id].rating === 0
    );
    if (unanswered) {
      toast.error("Please rate all questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      // Transform state to Backend API Payload
      const payload: FeedbackSubmissionItem[] = questions.map((q) => ({
        questionId: q.id,
        option: mapRatingToEnum(answers[q.id].rating), // Maps 5 -> VERY_GOOD
        reason: answers[q.id].reason || "No comment",
      }));

      await submitFeedback(selectedCanteen, payload);

      toast.success("Feedback submitted successfully!");
      // Reset Form
      setSelectedCanteen("");
      setQuestions([]);
      setAnswers({});
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning shadow-sm">
        <Store className="w-4 h-4" />
        <span>Please log in to submit feedback.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Canteen Selection Dropdown */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-bold text-gray-700 flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Select Canteen
          </span>
        </label>
        <select
          className="select select-bordered w-full focus:select-primary bg-gray-50"
          value={selectedCanteen}
          onChange={(e) => setSelectedCanteen(e.target.value)}
        >
          <option value="" disabled>
            -- Choose a Canteen --
          </option>
          {canteens.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Loading State */}
      {loadingQuestions && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* 3. Questions List */}
      {!loadingQuestions && selectedCanteen && questions.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {questions.map((q) => (
            <div
              key={q.id}
              className="card bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {q.questionText}
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="label pt-0 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Rating
                  </label>
                  <div className="rating rating-lg gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name={`rating-${q.id}`}
                        className="mask mask-star-2 bg-orange-400"
                        checked={(answers[q.id]?.rating || 0) === star}
                        onChange={() => handleRatingChange(q.id, star)}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <MessageSquare size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Reason / Comment (Optional)"
                    className="input input-bordered w-full pl-10 text-sm focus:input-primary bg-gray-50 focus:bg-white transition-colors"
                    value={answers[q.id]?.reason || ""}
                    onChange={(e) => handleReasonChange(q.id, e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary rounded-lg w-full shadow-lg shadow-primary/20 text-white"
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Submit Feedback
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {!loadingQuestions && selectedCanteen && questions.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p>No questions found for this canteen.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;
