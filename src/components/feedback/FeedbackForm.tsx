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
import { Loader2, Star, Store, Send, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { getPublicCanteens } from "@/services/publicService";
import Link from "next/link";

const FeedbackForm: React.FC = () => {
  const { user } = useUser();
  const [canteens, setCanteens] = useState<{ id: string; name: string }[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("");
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<number, { rating: number; reason: string }>
  >({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getPublicCanteens()
      .then((data) => setCanteens(data.map((c) => ({ id: c.id.toString(), name: c.canteenName }))))
      .catch(() => toast.error("Failed to load canteen list"));
  }, []);

  useEffect(() => {
    if (!selectedCanteen) { setQuestions([]); return; }
    setLoadingQuestions(true);
    getFeedbackQuestions(selectedCanteen)
      .then((data) => { setQuestions(data); setAnswers({}); })
      .catch(() => toast.error("Failed to load questions."))
      .finally(() => setLoadingQuestions(false));
  }, [selectedCanteen]);

  const handleRatingChange = (qId: number, rating: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], rating } }));
  };
  const handleReasonChange = (qId: number, reason: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], rating: prev[qId]?.rating || 0, reason } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanteen) { toast.error("Please select a canteen."); return; }
    const unanswered = questions.some((q) => !answers[q.id] || answers[q.id].rating === 0);
    if (unanswered) { toast.error("Please rate all questions before submitting."); return; }
    setSubmitting(true);
    try {
      const payload: FeedbackSubmissionItem[] = questions.map((q) => ({
        questionId: q.id,
        option: mapRatingToEnum(answers[q.id].rating),
        reason: answers[q.id].reason || "No comment",
      }));
      await submitFeedback(selectedCanteen, payload);
      toast.success("Feedback submitted — thank you!");
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-[var(--paper-dim)] rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-6 h-6 text-[var(--ink-soft)]/50" />
        </div>
        <h3 className="font-display text-xl text-[var(--ink)] mb-2">Login required</h3>
        <p className="text-sm text-[var(--ink-soft)] mb-5">You need to be signed in to give feedback.</p>
        <Link href="/login"
          className="inline-flex items-center gap-2 bg-[var(--turmeric)] text-[var(--paper)] font-semibold px-6 py-3 rounded-xl hover:bg-[var(--turmeric-deep)] transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-[var(--chalk-green)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-6 h-6 text-[var(--chalk-green)] fill-[var(--chalk-green)]" />
        </div>
        <h3 className="font-display text-2xl text-[var(--ink)] mb-2">Feedback submitted</h3>
        <p className="text-sm text-[var(--ink-soft)] mb-6">
          Your response has been recorded and will feed into the CMC&apos;s monthly canteen report.
        </p>
        <button onClick={() => { setSubmitted(false); setSelectedCanteen(""); setQuestions([]); setAnswers({}); }}
          className="text-sm font-semibold text-[var(--turmeric)] hover:underline underline-offset-4">
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Canteen selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
          <Store className="w-4 h-4 text-[var(--turmeric)]" /> Select canteen
        </label>
        <select
          className="w-full bg-[var(--paper-dim)] border border-[var(--kraft-border)] focus:border-[var(--turmeric)] focus:outline-none rounded-xl px-4 py-3.5 text-[var(--ink)] transition-colors"
          value={selectedCanteen}
          onChange={(e) => setSelectedCanteen(e.target.value)}
        >
          <option value="" disabled>Choose a canteen</option>
          {canteens.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loadingQuestions && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--turmeric)]" />
        </div>
      )}

      {!loadingQuestions && selectedCanteen && questions.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id}
              className="border border-[var(--kraft-border)] rounded-2xl overflow-hidden bg-[var(--paper-dim)]">
              <div className="px-5 py-4 border-b border-[var(--kraft-border)] bg-[var(--paper)]">
                <span className="text-xs font-semibold text-[var(--turmeric)] mb-0.5 block">
                  Question {idx + 1}
                </span>
                <h3 className="font-display text-base text-[var(--ink)]">{q.questionText}</h3>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (answers[q.id]?.rating || 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(q.id, star)}
                        className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            filled
                              ? "fill-amber-400 text-amber-400"
                              : "fill-none text-[var(--ink-soft)]/25 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  {answers[q.id]?.rating > 0 && (
                    <span className="ml-2 text-xs font-semibold text-[var(--ink-soft)]/60">
                      {["", "Poor", "Fair", "Good", "Very good", "Excellent"][answers[q.id].rating]}
                    </span>
                  )}
                </div>

                {/* Optional comment */}
                <input
                  type="text"
                  placeholder="Add a comment (optional)"
                  className="w-full bg-[var(--paper)] border border-[var(--kraft-border)] focus:border-[var(--turmeric)] focus:outline-none rounded-xl px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 transition-colors"
                  value={answers[q.id]?.reason || ""}
                  onChange={(e) => handleReasonChange(q.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="btn-tactile w-full bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-xl py-4 hover:bg-[var(--turmeric-deep)] transition-colors shadow-[0_8px_24px_-8px_rgba(194,65,12,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Submit feedback
          </button>
        </form>
      )}

      {!loadingQuestions && selectedCanteen && questions.length === 0 && (
        <div className="text-center py-10 text-[var(--ink-soft)]/60 border-2 border-dashed border-[var(--kraft-border)] rounded-2xl">
          No questions found for this canteen.
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;
