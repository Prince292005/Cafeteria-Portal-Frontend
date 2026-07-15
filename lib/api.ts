// lib/api.ts
// Thin client for the real Spring Boot backend. Every function here maps to
// an actual controller endpoint verified against the backend source —
// nothing here is invented or guessed.

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
const TOKEN_KEY = "messhall.token"

/**
 * Uploaded files (canteen images, FSSAI certs, menus, committee photos) are
 * stored on the backend and their DTOs return backend-relative paths like
 * "/certificates/fssai_4_x.pdf". Rendering that path directly resolves it
 * against the *frontend's* own origin (e.g. localhost:3000), which 404s —
 * it needs the backend's origin prepended. Already-absolute URLs (S3 links,
 * external URLs) are passed through unchanged.
 */
export function resolveFileUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) return path
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    if (res.status === 401 && token && typeof window !== "undefined") {
      setToken(null)
      localStorage.removeItem("messhall.user")
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1"
      }
    }
    throw new ApiError(res.status, text || `Request failed (${res.status})`)
  }

  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>
  }
  // Some endpoints (e.g. status update, delete) return plain text
  return (await res.text()) as unknown as T
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined })
const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined })
const del = <T>(path: string) => request<T>(path, { method: "DELETE" })

// --- AUTH ---
// Real login field is named studentId in the DTO, but the backend actually
// authenticates by email (CustomUserDetailsService.loadUserByUsername queries
// findByEmailId). Role comes back as "ROLE_USER" / "ROLE_ADMIN".
export interface LoginResponse {
  token: string
  studentId: string
  role: string
}

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponse>("/auth/login", { studentId: email, password }),

  sendOtp: (email: string) =>
    post<string>("/auth/send-otp", { email }),

  verifyOtp: (email: string, otp: string) =>
    post<boolean>("/auth/verify-otp", { email, otp }),

  register: (data: {
    studentId: string
    name: string
    emailId: string
    mobileNumber: number
    password: string
    userRole: "USER" | "ADMIN"
  }) => post<string>("/auth/register", data),

  forgotPasswordSendOtp: (email: string) =>
    post<string>("/auth/forgot-password/send-otp", { email }),

  forgotPasswordVerifyOtp: (email: string, otp: string) =>
    post<string>("/auth/forgot-password/verify-otp", { email, otp }),

  forgotPasswordReset: (email: string, newPassword: string) =>
    post<string>("/auth/forgot-password/reset", { email, newPassword }),
}

// --- CANTEENS ---
export interface CanteenDTO {
  id: number
  canteenName: string
  info: string
  tagline?: string
  cuisine?: string
  location?: string
  hours?: string
  priceLevel?: number
  fssaiCertificateUrl: string
  imageUrl: string
  menuFilePath: string
  averageRating?: number
  ratingCount?: number
  accent?: string
}

export const canteenApi = {
  getAll: () => get<CanteenDTO[]>("/api/canteens"),
  getById: (id: number) => get<CanteenDTO>(`/api/canteens/${id}`),
  add: (data: Omit<CanteenDTO, "id">) => post<CanteenDTO>("/admin/canteens", data),
  update: (id: number, data: Partial<CanteenDTO>) =>
    put<string>(`/admin/canteens/${id}`, data),
  remove: (id: number) => del<string>(`/admin/canteens/${id}`),
  uploadImage: (id: number, file: File) => uploadFile(`/admin/canteens/${id}/upload-image`, file),
  uploadFssai: (id: number, file: File) => uploadFile(`/admin/canteens/${id}/upload-fssai`, file),
  uploadMenu: (id: number, file: File) => uploadFile(`/admin/canteens/${id}/upload-menu`, file),
}

async function uploadFile(path: string, file: File) {
  const form = new FormData()
  form.append("file", file)
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: form, headers })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.text()
}

// --- COMMITTEE ---
export interface MemberDTO {
  id?: number
  name: string
  email: string
  designation: string
  role: "FACULTY_MENTOR" | "CONVENER" | "DEPUTY_CONVENER" | "CORE_MEMBER"
  studentId?: string | null
  photoUrl?: string
}
export interface CommitteeResponseDTO {
  facultyMentor?: MemberDTO
  convener?: MemberDTO
  deputyConvener?: MemberDTO
  coreMembers: MemberDTO[]
}

export const committeeApi = {
  get: () => get<CommitteeResponseDTO>("/api/committee"),
  add: (dto: MemberDTO) => post<MemberDTO>("/admin/committee", dto),
  update: (id: number, dto: MemberDTO) => put<MemberDTO>(`/admin/committee/${id}`, dto),
  remove: (id: number) => del<void>(`/admin/committee/${id}`),
  uploadPhoto: (id: number, file: File) => uploadFile(`/admin/committee/${id}/upload-photo`, file),
}

// --- ANNOUNCEMENTS ---
export interface AnnouncementDTO {
  id?: number
  title: string
  message: string
  createdAt?: string
  isActive?: boolean
}

export const announcementApi = {
  getActive: () => get<AnnouncementDTO[]>("/api/announcement/active"),
  create: (title: string, message: string) =>
    post<AnnouncementDTO>("/admin/announcement/create", { title, message }),
  deactivate: (id: number) => put<AnnouncementDTO>(`/admin/announcement/${id}/deactivate`),
}

// --- COMPLAINTS ---
export interface ComplaintDTO {
  complainId: number
  title: string
  description: string
  createdAt: string
  complaintStatus: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED"
  emailId: string
  canteenId: number
  canteenName?: string
  studentName?: string
  studentId?: string
  mobileNumber?: number
  uploadUrl?: string
  downloadUrl?: string
  imageKey?: string
}

export const complaintApi = {
  create: (data: { canteenId: number; title: string; description: string }) =>
    post<ComplaintDTO>("/user/complaints", data),
  myComplaints: () => get<ComplaintDTO[]>("/user/complaints/mycomplaints"),
  getById: (id: number) => get<ComplaintDTO>(`/user/complaints/${id}`),
  attachFile: (id: number, fileKey: string) =>
    post<string>(`/user/complaints/${id}/attach?fileKey=${encodeURIComponent(fileKey)}`),

  // admin
  getAll: () => get<ComplaintDTO[]>("/admin/complaints/allComplaints"),
  updateStatus: (id: number, status: string) =>
    put<string>(`/admin/complaints/${id}/status`, { status }),
  escalate: (id: number) => post<string>(`/admin/complaints/${id}/escalate`),
  getImageUrl: (id: number) => get<string>(`/admin/complaints/${id}/image-url`),
}

// --- FEEDBACK (full question/answer flow) ---
export interface FeedbackQuestionDTO {
  id: number
  questionText: string
  canteenId?: number
}
export type FeedbackOption = "VERY_POOR" | "POOR" | "AVERAGE" | "GOOD" | "VERY_GOOD"

export interface FeedbackSubmissionDTO {
  questionId: number
  option: FeedbackOption
  reason: string
}

export const feedbackApi = {
  getQuestions: (canteenId: number) =>
    get<FeedbackQuestionDTO[]>(`/user/feedback/canteen/${canteenId}/questions`),
  submit: (canteenId: number, submissions: FeedbackSubmissionDTO[]) =>
    post<string>(`/user/feedback/canteen/${canteenId}/submit`, submissions),

  // admin
  addQuestion: (canteenId: number, question: string) =>
    post<FeedbackQuestionDTO>("/admin/feedback/question", { canteenId, question }),
  updateQuestion: (id: number, canteenId: number, question: string) =>
    put<FeedbackQuestionDTO>(`/admin/feedback/question/${id}`, { canteenId, question }),
  deleteQuestion: (id: number) => del<string>(`/admin/feedback/question/${id}`),
  getMonthlyGrouped: (canteenId: number, year: number, month: number) =>
    get<
      { questionId: number; questionText: string; responses: { id: number; option: FeedbackOption; reason: string; createdAt: string }[] }[]
    >(`/admin/feedback/canteen/${canteenId}/feedback/monthly?month=${month}&year=${year}`),
}

// --- QUICK FEEDBACK (one-tap streak/points) ---
export interface EngagementResultDTO {
  currentStreak: number
  totalPoints: number
  streakExtended: boolean
}

export const quickFeedbackApi = {
  submit: (canteenId: number, rating: number, tag?: string) =>
    post<EngagementResultDTO>(`/user/quick-feedback/canteen/${canteenId}`, { rating, tag: tag ?? null }),
  me: () => get<EngagementResultDTO>("/user/quick-feedback/me"),
}

// --- REPORTS ---
export interface CanteenReportData {
  canteenId: number
  canteenName: string
  complaints: { title: string; description: string }[]
  feedbackSummary: { question: string; averageRating: number; reasons: string[] }[]
}
export interface MonthlyReportDTO {
  month: string
  canteenReports: CanteenReportData[]
}

export const reportApi = {
  getMonthly: (month: string, canteenId?: number) =>
    get<MonthlyReportDTO>(`/admin/reports/monthly?month=${month}${canteenId ? `&canteenId=${canteenId}` : ""}`),
  getLLMReport: (month: string, canteenId?: number) =>
    get<string>(`/admin/reports/llm-monthly?month=${month}${canteenId ? `&canteenId=${canteenId}` : ""}`),
}

export { ApiError }
