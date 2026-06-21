import axios from "axios";

// Base URL
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Helper for Auth Header
const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return { headers: {} };
};

// --- INTERFACES ---

export interface ComplaintRequest {
  canteenId: string | number;
  title: string;
  description: string;
}

// ✅ NEW: Response from Create API (includes S3 details)
export interface ComplaintCreationResponse {
  complainId: number;
  title: string;
  description: string;
  complaintStatus: string;
  // AWS Fields returned by backend
  uploadUrl?: string; // The presigned URL for PUT
  imageKey?: string; // The key to send back to attach
  canteenId: number;
}

export interface Complaint {
  complainId: number;
  canteenId: number;
  canteenName?: string;
  title: string;
  description: string;
  complaintStatus: "PENDING" | "RESOLVED" | "IN_PROGRESS" | "ESCALATED";
  createdAt: string;
}

// --- API FUNCTIONS ---

/**
 * 1. Create Complaint
 * Matches: POST /user/complaints
 * Returns: Object containing complainId AND the S3 uploadUrl
 */
export const createComplaint = async (
  data: ComplaintRequest
): Promise<ComplaintCreationResponse> => {
  const response = await axios.post(
    `${BASE_URL}/user/complaints`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * 2. Upload to S3 (Directly from Browser)
 * Uses the 'uploadUrl' returned by createComplaint.
 * Note: No Authorization header is sent here (AWS handles auth via the URL signature).
 */
export const uploadImageToS3 = async (uploadUrl: string, file: File) => {
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });
};

/**
 * 3. Attach Key to Complaint
 * Links the uploaded file to the complaint in the DB.
 * Matches: POST /user/complaints/{id}/attach?fileKey=...
 */
export const attachImageToComplaint = async (
  complaintId: number,
  fileKey: string
) => {
  await axios.post(
    `${BASE_URL}/user/complaints/${complaintId}/attach`,
    fileKey, // Sending key in Body as Raw Text
    {
      params: { fileKey }, // Also sending as Query Param (based on your Postman)
      headers: {
        ...getAuthHeaders().headers,
        "Content-Type": "text/plain",
      },
    }
  );
};

/**
 * 4. Get User History
 * Matches: GET /user/complaints/mycomplaints
 */
export const getMyComplaints = async (): Promise<Complaint[]> => {
  const response = await axios.get(
    `${BASE_URL}/user/complaints/mycomplaints`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * 5. Get Single Complaint Details
 * Matches: GET /user/complaints/{id}
 */
export const getComplaintById = async (
  id: number | string
): Promise<Complaint> => {
  const response = await axios.get(
    `${BASE_URL}/user/complaints/${id}`, // Corrected to plural based on recent context
    getAuthHeaders()
  );
  return response.data;
};
