"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Download,
  Calendar,
} from "lucide-react";
import { getMonthlyReport } from "@/services/adminService";

export default function AdminReportsPage() {
  const router = useRouter();

  // Default to current month "YYYY-MM"
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [reportData, setReportData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null); // Clear previous
    try {
      const data = await getMonthlyReport(selectedMonth);
      setReportData(data);
    } catch (error) {
      console.error("Failed to generate report", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      {/* Header - Hidden when printing */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => router.back()}
            className="btn btn-circle rounded-full btn-ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-teal-500" />
              Monthly Reports
            </h1>
            <p className="text-base-content/70">
              AI-Powered insights and summaries
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-base-100 p-2 rounded-xl shadow-sm border border-base-200">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="month"
              className="input input-sm pl-10 bg-transparent border-none focus:outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="h-8 w-[1px] bg-base-300 mx-1"></div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn btn-primary rounded-lg btn-sm gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>
      </div>

      {/* --- REPORT DISPLAY --- */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-base-content/50">
            <span className="loading loading-bars loading-lg text-teal-500"></span>
            <p className="animate-pulse">Analyzing canteen data with AI...</p>
          </div>
        ) : reportData ? (
          <div className="card bg-base-100 shadow-xl border border-base-200 print:shadow-none print:border-none">
            <div className="card-body p-8 md:p-12">
              {/* Report Header */}
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    CMC Monthly Report
                  </h2>
                  <p className="text-base-content/60">
                    Period: {selectedMonth}
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="btn btn-ghost rounded-lg btn-sm gap-2 print:hidden"
                >
                  <Download className="w-4 h-4" /> Print / PDF
                </button>
              </div>

              {/* Markdown Rendering Strategy: 
                Since we don't have a markdown parser installed, we use 
                'whitespace-pre-wrap' to respect line breaks and 'font-mono' 
                for a clean report look.
              */}
              <div className="prose max-w-none whitespace-pre-wrap font-sans leading-relaxed">
                {/* Optional: If you want to highlight bold text (**) manually without a library:
                  You can use a simple regex replacement or just display raw text.
                  For now, raw text is safest and still readable.
                */}
                {reportData}
              </div>

              <div className="mt-12 pt-4 border-t border-base-200 flex justify-between text-xs text-base-content/40 print:mt-4">
                <span>Generated via LLM Service</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
            <Sparkles className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <h3 className="text-lg font-semibold text-base-content/70">
              No Report Generated
            </h3>
            <p className="text-base-content/50">
              Select a month and click Generate to view insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
