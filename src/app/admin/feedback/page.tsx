"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  MessageCircle,
  Filter,
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getMonthlyFeedbackResponses,
  addFeedbackQuestion,
  updateFeedbackQuestion,
  deleteFeedbackQuestion,
  getFeedbackQuestions,
  FeedbackQuestion,
  QuestionFeedbackMap, // We use the Grouped Interface now
  FeedbackItemDTO,
} from "@/services/adminService";
import { getPublicCanteens, Canteen } from "@/services/publicService";

export default function AdminFeedbackPage() {
  const router = useRouter();

  // --- State ---
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteenId, setSelectedCanteenId] = useState<any>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const [activeTab, setActiveTab] = useState<"responses" | "questions">(
    "responses"
  );

  // ✅ Changed state to hold Grouped Data instead of Flat List
  const [groupedResponses, setGroupedResponses] = useState<
    QuestionFeedbackMap[]
  >([]);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<FeedbackQuestion | null>(null);
  const [questionText, setQuestionText] = useState("");

  // --- State for Expanded Accordions ---
  // Stores the IDs of expanded questions
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  // --- 1. DATE PARSER ---
  const formatDate = (dateInput: any) => {
    if (!dateInput) return { date: "N/A", time: "" };
    try {
      let date: Date;
      if (Array.isArray(dateInput)) {
        date = new Date(
          dateInput[0],
          dateInput[1] - 1,
          dateInput[2],
          dateInput[3] || 0,
          dateInput[4] || 0
        );
      } else {
        date = new Date(String(dateInput).replace(" ", "T"));
      }
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (e) {
      return { date: "Error", time: "" };
    }
  };

  // --- 2. STAR CALCULATION ---
  const getStarCount = (val: string): number => {
    val = String(val || "").toUpperCase();
    if (val === "VERY_GOOD") return 5;
    if (val === "GOOD") return 4;
    if (val === "AVERAGE") return 3;
    if (val === "POOR") return 2;
    if (val === "VERY_POOR") return 1;
    return 0;
  };

  // --- 3. AVERAGE CALCULATOR ---
  const calculateAverage = (items: FeedbackItemDTO[]) => {
    if (!items || items.length === 0) return 0;

    let totalStars = 0;
    let count = 0;

    items.forEach((item) => {
      const stars = getStarCount(item.option);
      if (stars > 0) {
        totalStars += stars;
        count++;
      }
    });

    return count === 0 ? 0 : totalStars / count;
  };

  // --- EFFECTS ---
  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const data = await getPublicCanteens();
        setCanteens(data);
        if (data.length > 0) setSelectedCanteenId(data[0].id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCanteens();
  }, []);

  useEffect(() => {
    if (!selectedCanteenId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "responses") {
          const [year, month] = selectedMonth.split("-");

          // Call Monthly API - Get Grouped Data directly
          const groupedData = await getMonthlyFeedbackResponses(
            selectedCanteenId,
            parseInt(year),
            parseInt(month)
          );

          setGroupedResponses(groupedData || []);
        } else {
          const data = await getFeedbackQuestions(selectedCanteenId);
          setQuestions(data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        setGroupedResponses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCanteenId, activeTab, selectedMonth]);

  // --- HANDLERS ---
  const handleSaveQuestion = async () => {
    /* Same as before */
    if (!questionText.trim()) return;
    try {
      if (editingQuestion) {
        await updateFeedbackQuestion(
          editingQuestion.id,
          selectedCanteenId,
          questionText
        );
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion.id ? { ...q, questionText } : q
          )
        );
      } else {
        const newQ = await addFeedbackQuestion(selectedCanteenId, questionText);
        setQuestions((prev) => [...prev, newQ]);
      }
      setIsModalOpen(false);
      setQuestionText("");
      setEditingQuestion(null);
    } catch (error) {
      alert("Failed");
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    /* Same as before */
    if (!confirm("Delete?")) return;
    try {
      await deleteFeedbackQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      alert("Failed");
    }
  };

  const openModal = (q?: any) => {
    /* Same as before */
    if (q) {
      setEditingQuestion(q);
      setQuestionText(q.questionText);
    } else {
      setEditingQuestion(null);
      setQuestionText("");
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-purple-500" /> User
              Feedback
            </h1>
            <p className="text-base-content/70">
              Analyze ratings and suggestions.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-base-100 p-2 rounded-xl shadow-sm border border-base-200 flex-1">
            <CalendarDays className="w-5 h-5 text-base-content/50 ml-2" />
            <input
              type="month"
              className="input input-sm input-ghost w-full"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-base-100 p-2 rounded-xl shadow-sm border border-base-200 flex-1">
            <Filter className="w-5 h-5 text-base-content/50 ml-2" />
            <select
              className="select select-sm select-ghost w-full"
              value={selectedCanteenId}
              onChange={(e) => setSelectedCanteenId(e.target.value)}
            >
              {canteens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.canteenName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-base-200/60 p-1 rounded-xl inline-flex gap-1 mb-6">
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            activeTab === "responses" ? "bg-white shadow" : ""
          }`}
          onClick={() => setActiveTab("responses")}
        >
          User Responses
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            activeTab === "questions" ? "bg-white shadow" : ""
          }`}
          onClick={() => setActiveTab("questions")}
        >
          Manage Questions
        </button>
      </div>

      {/* --- RESPONSES TAB (ACCORDION VIEW) --- */}
      {activeTab === "responses" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-purple-500"></span>
            </div>
          ) : groupedResponses.length === 0 ? (
            <div className="text-center py-16 bg-base-100 rounded-2xl border-2 border-dashed border-base-200">
              <MessageSquare className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
              <p className="opacity-50">
                No feedback found for {selectedMonth}.
              </p>
            </div>
          ) : (
            groupedResponses.map((group) => {
              const avgRating = calculateAverage(group.responses || []);
              const responseCount = (group.responses || []).length;
              const isExpanded = expandedIds.has(group.questionId);

              // Determine color based on average
              let colorClass = "text-gray-500";
              if (responseCount > 0) {
                if (avgRating >= 4) colorClass = "text-green-600 bg-green-50";
                else if (avgRating >= 3)
                  colorClass = "text-orange-600 bg-orange-50";
                else colorClass = "text-red-600 bg-red-50";
              }

              return (
                <div
                  key={group.questionId}
                  className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden transition-all duration-300"
                >
                  {/* --- Question Header (Click to Expand) --- */}
                  <div
                    onClick={() => toggleExpand(group.questionId)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-base-200/50 transition-colors select-none"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-lg text-base-content">
                        {group.questionText}
                      </h3>
                      <p className="text-xs text-base-content/50 mt-1">
                        {responseCount} Responses received
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Rating Badge */}
                      {responseCount > 0 ? (
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${colorClass}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                          {avgRating.toFixed(1)} / 5.0
                        </div>
                      ) : (
                        <span className="badge badge-ghost text-xs">
                          No Ratings
                        </span>
                      )}

                      {/* Arrow Icon */}
                      <div
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <ChevronDown className="w-5 h-5 text-base-content/40" />
                      </div>
                    </div>
                  </div>

                  {/* --- Expanded Content (Table) --- */}
                  {isExpanded && (
                    <div className="border-t border-base-200 bg-base-200/20 animate-in fade-in slide-in-from-top-2 duration-200">
                      {responseCount === 0 ? (
                        <div className="p-8 text-center text-sm opacity-50">
                          No responses yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <thead className="bg-base-200/50 text-xs uppercase text-base-content/50">
                              <tr>
                                <th className="pl-6 w-40">Date</th>
                                <th className="w-40">Rating</th>
                                <th>Comment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(group.responses || []).map((item) => {
                                const stars = getStarCount(item.option);
                                const { date, time } = formatDate(
                                  item.createdAt
                                );

                                return (
                                  <tr
                                    key={item.id}
                                    className="hover:bg-base-100 border-b border-base-200/50 last:border-none"
                                  >
                                    <td className="pl-6">
                                      <div className="flex flex-col">
                                        <span className="font-medium text-sm">
                                          {date}
                                        </span>
                                        <span className="text-xs opacity-50 font-mono">
                                          {time}
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      {stars > 0 ? (
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                              key={s}
                                              className={`w-3.5 h-3.5 ${
                                                s <= stars
                                                  ? "fill-orange-400 text-orange-400"
                                                  : "fill-base-200 text-base-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="badge badge-ghost badge-sm text-xs">
                                          Text Only
                                        </span>
                                      )}
                                    </td>
                                    <td className="text-sm">
                                      {item.reason &&
                                      item.reason !== "No comment" ? (
                                        <span className="text-base-content/80">
                                          "{item.reason}"
                                        </span>
                                      ) : (
                                        <span className="text-base-content/30 italic">
                                          No comment provided
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Questions Tab Content... */}
      {activeTab === "questions" && (
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Survey Questions</h2>
              {/* ✅ CONDITIONAL RENDER: Only show 'Add Question' if a canteen is active */}
              {selectedCanteenId && (
                <button
                  className="btn btn-primary rounded-lg btn-sm gap-2"
                  onClick={() => openModal()}
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner text-purple-500"></span>
              </div>
            ) : (
              <div className="grid gap-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex justify-between items-center p-4 bg-base-200/50 rounded-xl"
                  >
                    <span className="font-medium text-lg">
                      {q.questionText}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-circle btn-ghost btn-sm text-blue-500"
                        onClick={() => openModal(q)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-circle btn-ghost btn-sm text-red-500"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal... */}
      {isModalOpen && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-6">
              {editingQuestion ? "Edit Question" : "New Question"}
            </h3>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              autoFocus
            />
            <div className="modal-action">
              <button
                className="btn rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn rounded-lg btn-primary"
                onClick={handleSaveQuestion}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
