export type Role = "USER" | "ADMIN"

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface MenuItem {
  name: string
  price: number
  veg: boolean
  tag?: "Bestseller" | "New" | "Chef's pick"
}

export interface Canteen {
  id: number
  canteenName: string
  tagline: string
  info: string
  cuisine: string
  location: string
  hours: string
  priceLevel: 1 | 2 | 3
  rating: number
  ratingCount: number
  fssaiVerified: boolean
  fssaiCertificateUrl: string
  imageUrl: string
  menuFilePath: string
  accent: "terracotta" | "turmeric" | "forest" | "sky" | "crimson" | "royal" | "slate"
  menu: MenuItem[]
}

export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED"

export interface Complaint {
  complainId: number
  canteenId: number
  canteenName: string
  title: string
  description: string
  complaintStatus: ComplaintStatus
  createdAt: string
  emailId: string
  studentName?: string
  studentId?: string
  mobileNumber?: number
  imageKey?: string
}

export type CommitteeRole =
  | "FACULTY_MENTOR"
  | "CONVENER"
  | "DEPUTY_CONVENER"
  | "CORE_MEMBER"

export interface CommitteeMember {
  id: number
  name: string
  email: string
  designation: string
  role: CommitteeRole
  studentId?: string | null
  photoUrl?: string
}

export interface Announcement {
  id: number
  title: string
  message: string
  createdAt: string
  isActive: boolean
}

export type FeedbackOption = "VERY_POOR" | "POOR" | "AVERAGE" | "GOOD" | "VERY_GOOD"

export interface FeedbackQuestion {
  id: number
  questionText: string
  canteenId: number
}

export interface FeedbackResponse {
  id: number
  questionId: number
  canteenId: number
  option: FeedbackOption
  reason: string
  createdAt: string
}

export interface Engagement {
  currentStreak: number
  totalPoints: number
  bestStreak: number
  lastRatedDate: string | null
}
