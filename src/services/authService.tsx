// This is your Spring Boot backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

/**
 * The data structure returned from your backend's /auth/login endpoint.
 */
interface AuthResponse {
  token: string;
  studentId: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
}

/**
 * Calls your backend /auth/login endpoint.
 * @param credentials - { studentId, password }
 * @returns The { token, studentId, role } object
 */
export const loginUser = async (credentials: object): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Login failed. Please check your credentials."
    );
  }

  return response.json();
};

/**
 * Calls your backend /auth/register endpoint.
 * @param userData - The user object for registration { studentId, name, emailId, mobileNumber, password }
 */
export const registerUser = async (userData: object) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Registration Failed");
  }

  return response.text(); // Your backend returns a string success message
};

// --- ✅ NEW OTP FUNCTIONS ---

/**
 * Sends an OTP to the provided email.
 * Endpoint: POST /auth/send-otp
 * Payload: { "email": "..." }
 */
export const sendOtp = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Note: Backend expects key "email", NOT "emailId" here based on logs
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send OTP");
  }

  return response.text();
};

/**
 * Verifies the OTP entered by the user.
 * Endpoint: POST /auth/verify-otp
 * Payload: { "email": "...", "otp": "..." }
 */
export const verifyOtp = async (email: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Invalid OTP");
  }

  return response.text(); // Returns success message or boolean based on backend
};

export const resetPassword = async (email: string, newPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to reset password.");
  }

  return response.text();
};

export const verifyForgotPasswordOtp = async (email: string, otp: string) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/forgot-password/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Invalid OTP.");
  }

  return response.text();
};

export const sendForgotPasswordOtp = async (email: string) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/forgot-password/send-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send OTP.");
  }

  return response.text();
};
