import axios from "axios";

// Base URLs
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const ADMIN_URL = `${BASE_URL}/admin`;
const USER_URL = `${BASE_URL}/user`;

// Helper to get the token
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return { headers: {} };
};

// --- TYPES ---

export interface Complaint {
  complainId: number;
  title: string;
  description: string;
  createdAt: string;
  complaintStatus: "PENDING" | "RESOLVED" | "ESCALATED" | "IN_PROGRESS";
  emailId: string;
  imageKey?: string; // Optional S3 Key
}

export interface CommitteeMember {
  id?: number;
  name: string;
  email: string;
  designation: string; // e.g. "Faculty Mentor", "Convener"
  role: "FACULTY_MENTOR" | "CONVENER" | "DEPUTY_CONVENER" | "CORE_MEMBER";
  studentId?: string | null;
  photoUrl?: string;
}

export interface CommitteeResponse {
  facultyMentor?: CommitteeMember;
  convener?: CommitteeMember;
  deputyConvener?: CommitteeMember;
  coreMembers: CommitteeMember[];
}
export interface FeedbackQuestion {
  id: number;
  questionText: string;
  canteenId?: number;
}

// Grouped Feedback Types (Matches Backend DTO)
export interface FeedbackItemDTO {
  id: number;
  option: string; // "VERY_GOOD", etc.
  reason: string;
  createdAt: string | number[]; // Handle both string and Java Date Array
}

export interface QuestionFeedbackMap {
  questionId: number;
  questionText: string;
  responses: FeedbackItemDTO[];
}

export interface Announcement {
  id?: number;
  title: string;
  message: string;
  createdAt?: string;
  isActive?: boolean;
}

// --- COMPLAINTS API ---

export const getAllComplaints = async (): Promise<Complaint[]> => {
  const response = await axios.get(
    `${ADMIN_URL}/complaints/allComplaints`,
    getAuthHeader()
  );
  return response.data;
};

export const escalateComplaint = async (id: number) => {
  const response = await axios.post(
    `${ADMIN_URL}/complaints/${id}/escalate`,
    {}, // Empty Body
    getAuthHeader()
  );
  return response.data;
};

export const updateComplaintStatus = async (
  id: number,
  status: "RESOLVED" | "PENDING" | "IN_PROGRESS" | "ESCALATED"
) => {
  const response = await axios.put(
    `${ADMIN_URL}/complaints/${id}/status`,
    { status },
    getAuthHeader()
  );
  return response.data;
};

// ✅ NEW: Get Image URL (Securely fetched from Backend S3 Controller)
// Endpoint: GET /admin/complaints/{id}/image-url
export const getComplaintImageUrl = async (id: number): Promise<string> => {
  try {
    const response = await axios.get(
      `${ADMIN_URL}/complaints/${id}/image-url`,
      getAuthHeader()
    );
    // Backend returns the URL string directly (or inside an object depending on impl)
    // Adjust .data based on whether backend returns string or JSON
    return response.data;
  } catch (error) {
    console.error("No image found or error fetching", error);
    return "";
  }
};

// --- FEEDBACK API ---

export const getFeedbackQuestions = async (
  canteenId: string | number
): Promise<FeedbackQuestion[]> => {
  try {
    const response = await axios.get(
      `${USER_URL}/feedback/canteen/${canteenId}/questions`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.warn("API Failed. Returning empty list.");
    return [];
  }
};

export const addFeedbackQuestion = async (
  canteenId: string,
  question: string
) => {
  const response = await axios.post(
    `${ADMIN_URL}/feedback/question`,
    { canteenId, question },
    getAuthHeader()
  );
  return response.data;
};

export const updateFeedbackQuestion = async (
  questionId: number,
  canteenId: string,
  question: string
) => {
  const response = await axios.put(
    `${ADMIN_URL}/feedback/question/${questionId}`,
    { canteenId, question },
    getAuthHeader()
  );
  return response.data;
};

export const deleteFeedbackQuestion = async (questionId: number) => {
  const response = await axios.delete(
    `${ADMIN_URL}/feedback/question/${questionId}`,
    getAuthHeader()
  );
  return response.data;
};

// ✅ UPDATED: Returns Grouped Data for Monthly View
export const getMonthlyFeedbackResponses = async (
  canteenId: string | number,
  year: number,
  month: number
): Promise<QuestionFeedbackMap[]> => {
  const response = await axios.get(
    `${ADMIN_URL}/feedback/canteen/${canteenId}/feedback/monthly`,
    {
      params: { year, month },
      ...getAuthHeader(),
    }
  );
  return response.data;
};

// --- ANNOUNCEMENTS API ---

export const createAnnouncement = async (title: string, message: string) => {
  const response = await axios.post(
    `${ADMIN_URL}/announcement/create`,
    { title, message },
    getAuthHeader()
  );
  return response.data;
};

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/announcement/active`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

export const deactivateAnnouncement = async (id: number) => {
  const response = await axios.put(
    `${ADMIN_URL}/announcement/${id}/deactivate`,
    {},
    getAuthHeader()
  );
  return response.data;
};

// --- REPORTS API ---

export const getMonthlyReport = async (month: string): Promise<string> => {
  const response = await axios.get(`${ADMIN_URL}/reports/llm-monthly`, {
    ...getAuthHeader(),
    params: { month },
  });
  return response.data;
};

export const uploadCanteenAsset = async (
  canteenId: number,
  assetType: "image" | "fssai" | "menu",
  file: File
) => {
  const endpoint =
    assetType === "image"
      ? "upload-image"
      : assetType === "fssai"
      ? "upload-fssai"
      : "upload-menu";

  const formData = new FormData();
  formData.append("file", file);

  // Get the auth object
  const auth = getAuthHeader();

  const response = await axios.post(
    `${ADMIN_URL}/canteens/${canteenId}/${endpoint}`,
    formData,
    {
      headers: {
        ...auth.headers, // ✅ Ensure this is spreading the Authorization header correctly
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getCommitteeMembers = async (): Promise<CommitteeResponse> => {
  const response = await axios.get(
    `${BASE_URL}/api/committee`,
    getAuthHeader()
  );
  return response.data;
};

export const addCommitteeMember = async (data: CommitteeMember) => {
  const response = await axios.post(
    `${ADMIN_URL}/committee`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const updateCommitteeMember = async (
  id: number,
  data: CommitteeMember
) => {
  const response = await axios.put(
    `${ADMIN_URL}/committee/${id}`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const deleteCommitteeMember = async (id: number) => {
  const response = await axios.delete(
    `${ADMIN_URL}/committee/${id}`,
    getAuthHeader()
  );
  return response.data;
};

export const uploadMemberPhoto = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${ADMIN_URL}/committee/${id}/upload-photo`,
    formData,
    {
      headers: {
        ...getAuthHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
