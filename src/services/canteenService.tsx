// /src/services/canteenService.ts

// 1. Define the Root URL (e.g., http://localhost:8080)
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 2. Define the specific Endpoint (e.g., http://localhost:8080/admin/canteens)
const CANTEEN_ENDPOINT = `${SERVER_URL}/admin/canteens`;

// --- Types ---
export interface Canteen {
  id: number;
  canteenName: string;
  info: string;
  fssaiCertificateUrl: string;
  imageUrl: string;
  menuFilePath: string;
}

export type CanteenFormData = Omit<Canteen, "id">;

// --- Helper: Get Auth Header ---
const getAuthHeader = (includeContentType = true) => {
  const token = localStorage.getItem("token");
  // Note: We strictly require a token here.
  // If 403 persists after fixing the URL, check if the user has 'ADMIN' role in the token.
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// --- Helper: Handle API Responses ---
const handleResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Unauthorized or Forbidden. Ensure you are logged in as an Admin."
    );
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "An unknown API error occurred.");
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    return responseText;
  }
};

// --- API Functions ---

// export const getAllCanteens = async (): Promise<Canteen[]> => {
//   // Uses CANTEEN_ENDPOINT correctly
//   const response = await fetch(CANTEEN_ENDPOINT, {
//     method: "GET",
//     headers: getAuthHeader(false),
//   });
//   return handleResponse(response);
// };

export const addCanteen = async (data: CanteenFormData): Promise<string> => {
  // Uses CANTEEN_ENDPOINT correctly
  const response = await fetch(CANTEEN_ENDPOINT, {
    method: "POST",
    headers: getAuthHeader(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCanteen = async (
  id: number,
  data: CanteenFormData
): Promise<string> => {
  const response = await fetch(`${CANTEEN_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCanteen = async (id: number): Promise<string> => {
  const response = await fetch(`${CANTEEN_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(false),
  });
  return handleResponse(response);
};
