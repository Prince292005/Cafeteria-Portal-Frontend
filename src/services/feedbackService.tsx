import axios from "axios";

// --- Base URL ---
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// --- Types ---

export interface FeedbackQuestion {
  id: number;
  questionText: string;
}

// Backend Enum Strings
export type FeedbackOption =
  | "VERY_POOR"
  | "POOR"
  | "AVERAGE"
  | "GOOD"
  | "VERY_GOOD";

// Payload structure expected by Backend
export interface FeedbackSubmissionItem {
  questionId: number;
  option: FeedbackOption; // Changed from 'rating' to 'option' to match Postman
  reason: string;
}

// --- Helpers ---

/**
 * Maps the UI Star Rating (1-5) to the Backend Enum String
 */
export const mapRatingToEnum = (rating: number): FeedbackOption => {
  switch (rating) {
    case 5:
      return "VERY_GOOD";
    case 4:
      return "GOOD";
    case 3:
      return "AVERAGE";
    case 2:
      return "POOR";
    case 1:
      return "VERY_POOR";
    default:
      return "AVERAGE";
  }
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- API Functions ---

/**
 * Fetches questions for a specific canteen.
 * URL: GET /user/feedback/canteen/{canteenId}/questions
 */
export const getFeedbackQuestions = async (
  canteenId: string | number
): Promise<FeedbackQuestion[]> => {
  try {
    const headers = getAuthHeaders();
    // ✅ CORRECTION: Added /user/feedback prefix
    const response = await axios.get(
      `${API_BASE_URL}/user/feedback/canteen/${canteenId}/questions`,
      { headers: { Authorization: headers.Authorization } }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch feedback questions:", error);
    throw error;
  }
};

/**
 * Submits feedback for a specific canteen.
 * URL: POST /user/feedback/canteen/{canteenId}/submit
 */
export const submitFeedback = async (
  canteenId: string | number, // ✅ CORRECTION: Added canteenId arg
  submissions: FeedbackSubmissionItem[]
): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    // ✅ CORRECTION: Added /user/feedback prefix and canteenId to URL
    const response = await axios.post(
      `${API_BASE_URL}/user/feedback/canteen/${canteenId}/submit`,
      submissions,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    throw error;
  }
};
