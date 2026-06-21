// /src/services/publicService.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// This type can be shared or re-defined
export interface Canteen {
  id: number;
  canteenName: string;
  info: string;
  fssaiCertificateUrl: string;
  imageUrl: string;
  menuFilePath: string;
}

type ID = number | string;

/**
 * Fetches all public canteens.
 * This endpoint is assumed to be public (no auth).
 * @returns A promise that resolves to an array of Canteen objects
 */
export const getPublicCanteens = async (): Promise<Canteen[]> => {
  // ❗️ Note: The endpoint is /api/canteens, NOT /admin/canteens
  const response = await fetch(`${API_BASE_URL}/api/canteens`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public canteen list.");
  }
  return response.json();
};

// You can add other public functions here, e.g., getCanteenById
export const getPublicCanteenById = async (id: ID): Promise<Canteen> => {
  const response = await fetch(`${API_BASE_URL}/api/canteens/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public canteen details.");
  }
  return response.json();
};
