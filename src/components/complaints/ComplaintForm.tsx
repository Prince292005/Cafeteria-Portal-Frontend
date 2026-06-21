// /src/components/complaints/ComplaintForm.tsx
"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/authContext"; // To check if logged in
import { createComplaint } from "@/services/complaintService"; // New service

interface ComplaintFormProps {
  canteenId: string; // Passed from the page
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ canteenId }) => {
  const { user, loading: authLoading } = useUser();

  // Form state
  const [complaintType, setComplaintType] = useState("Food Quality");
  const [description, setDescription] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to submit a complaint.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = {
        canteenId: parseInt(canteenId),
        title: complaintType,
        description,
      };

      const responseMessage = await createComplaint(data);
      setSuccess(responseMessage || "Complaint submitted successfully!");

      // Reset form
      setComplaintType("Food Quality");
      setDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <span className="loading loading-sm loading-spinner"></span>;
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <p>You must be logged in to submit a complaint.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alert Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Complaint Type */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Complaint Type</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={complaintType}
          onChange={(e) => setComplaintType(e.target.value)}
        >
          <option>Food Quality</option>
          <option>Hygiene</option>
          <option>Staff Behavior</option>
          <option>Timings</option>
          <option>Other</option>
        </select>
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Please provide details about your complaint..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Submit Complaint"
          )}
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;
