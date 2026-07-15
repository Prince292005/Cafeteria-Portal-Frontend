"use client"

// NOTE: despite the folder name, this is no longer mock data. Every function
// here calls the real Spring Boot backend (see lib/api.ts). The file stays
// at this path so the ~19 components already importing from
// "@/lib/mock/store" don't all need their import paths changed.

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react"
import type {
  Announcement,
  Canteen,
  CommitteeMember,
  Complaint,
  ComplaintStatus,
  Engagement,
  FeedbackOption,
  FeedbackQuestion,
} from "@/lib/types"
import {
  canteenApi,
  committeeApi,
  announcementApi,
  complaintApi,
  feedbackApi,
  quickFeedbackApi,
  type CanteenDTO,
  type ComplaintDTO,
} from "@/lib/api"

/* ------------------------------------------------------------------ */
/* Adapters: real backend DTOs -> the richer frontend types            */
/* The backend genuinely doesn't track tagline/cuisine/location/hours/ */
/* priceLevel/accent/menu/rating — those were invented for the demo.   */
/* Rather than fake specific numbers, these get honest, neutral        */
/* defaults so the UI renders without pretending to have real data.    */
/* ------------------------------------------------------------------ */
const ACCENTS = ["terracotta", "turmeric", "forest", "sky", "crimson", "royal", "slate"] as const

function adaptCanteen(dto: CanteenDTO): Canteen {
  return {
    id: dto.id,
    canteenName: dto.canteenName,
    tagline: dto.tagline ?? "",
    info: dto.info ?? "",
    cuisine: dto.cuisine ?? "Multi-cuisine",
    location: dto.location ?? "On campus",
    hours: dto.hours ?? "—",
    priceLevel: (dto.priceLevel as 1 | 2 | 3) ?? 2,
    rating: dto.averageRating ?? 0,
    ratingCount: dto.ratingCount ?? 0,
    fssaiVerified: Boolean(dto.fssaiCertificateUrl),
    fssaiCertificateUrl: dto.fssaiCertificateUrl ?? "",
    imageUrl: dto.imageUrl ?? "",
    menuFilePath: dto.menuFilePath ?? "",
    accent: (ACCENTS as readonly string[]).includes(dto.accent ?? "")
      ? (dto.accent as Canteen["accent"])
      : ACCENTS[dto.id % ACCENTS.length],
    menu: [],
  }
}

function adaptComplaint(dto: ComplaintDTO): Complaint {
  return {
    complainId: dto.complainId,
    canteenId: dto.canteenId,
    canteenName: dto.canteenName ?? "Unknown",
    title: dto.title,
    description: dto.description,
    complaintStatus: dto.complaintStatus,
    createdAt: dto.createdAt,
    emailId: dto.emailId,
    studentName: dto.studentName,
    studentId: dto.studentId,
    mobileNumber: dto.mobileNumber,
    imageKey: dto.imageKey,
  }
}

/* ------------------------------------------------------------------ */
/* Generic "fetch once, cache, notify subscribers" resource helper     */
/* ------------------------------------------------------------------ */
function createResource<T>(fetcher: () => Promise<T>, initial: T) {
  let data = initial
  let loaded = false
  let loading = false
  let error: Error | null = null
  const listeners = new Set<() => void>()
  let version = 0

  function emit() {
    version++
    listeners.forEach((l) => l())
  }

  async function load(force = false) {
    if (loading || (loaded && !force)) return
    loading = true
    try {
      data = await fetcher()
      loaded = true
      error = null
    } catch (e) {
      error = e instanceof Error ? e : new Error("Failed to load")
    } finally {
      loading = false
      emit()
    }
  }

  function subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  }
  function getVersion() {
    return version
  }
  function getData() {
    return data
  }
  function setData(next: T) {
    data = next
    emit()
  }

  return { load, subscribe, getVersion, getData, setData, isLoaded: () => loaded }
}

/* ------------------------------ CANTEENS ------------------------------ */
const canteensResource = createResource<Canteen[]>(
  async () => (await canteenApi.getAll()).map(adaptCanteen),
  [],
)

export function useCanteens() {
  useSyncExternalStore(canteensResource.subscribe, canteensResource.getVersion, canteensResource.getVersion)
  useEffect(() => {
    canteensResource.load()
  }, [])
  return canteensResource.getData()
}

export function useCanteen(id: number) {
  const list = useCanteens()
  return list.find((c) => c.id === id)
}

export async function addCanteen(data: Omit<Canteen, "id">) {
  const created = await canteenApi.add({
    canteenName: data.canteenName,
    info: data.info,
    tagline: data.tagline,
    cuisine: data.cuisine,
    location: data.location,
    hours: data.hours,
    priceLevel: data.priceLevel,
    fssaiCertificateUrl: data.fssaiCertificateUrl,
    imageUrl: data.imageUrl,
    menuFilePath: "",
    accent: data.accent,
  })
  await canteensResource.load(true)
  return created.id
}
export async function updateCanteen(id: number, data: Partial<Canteen>) {
  await canteenApi.update(id, {
    canteenName: data.canteenName,
    info: data.info,
    tagline: data.tagline,
    cuisine: data.cuisine,
    location: data.location,
    hours: data.hours,
    priceLevel: data.priceLevel,
    fssaiCertificateUrl: data.fssaiCertificateUrl,
    imageUrl: data.imageUrl,
    accent: data.accent,
  })
  await canteensResource.load(true)
}
export async function deleteCanteen(id: number) {
  await canteenApi.remove(id)
  await canteensResource.load(true)
}

export async function uploadCanteenImage(id: number, file: File) {
  await canteenApi.uploadImage(id, file)
  await canteensResource.load(true)
}
export async function uploadCanteenFssai(id: number, file: File) {
  await canteenApi.uploadFssai(id, file)
  await canteensResource.load(true)
}
export async function uploadCanteenMenu(id: number, file: File) {
  await canteenApi.uploadMenu(id, file)
  await canteensResource.load(true)
}

/* ------------------------------ COMMITTEE ------------------------------ */
const committeeResource = createResource<CommitteeMember[]>(async () => {
  const res = await committeeApi.get()
  const flat: CommitteeMember[] = []
  if (res.facultyMentor) flat.push(res.facultyMentor as CommitteeMember)
  if (res.convener) flat.push(res.convener as CommitteeMember)
  if (res.deputyConvener) flat.push(res.deputyConvener as CommitteeMember)
  flat.push(...(res.coreMembers as CommitteeMember[]))
  return flat
}, [])

export function useCommittee() {
  useSyncExternalStore(committeeResource.subscribe, committeeResource.getVersion, committeeResource.getVersion)
  useEffect(() => {
    committeeResource.load()
  }, [])
  return committeeResource.getData()
}

export async function addCommitteeMember(data: Omit<CommitteeMember, "id">) {
  const created = await committeeApi.add({
    name: data.name,
    email: data.email,
    designation: data.designation,
    role: data.role,
    studentId: data.studentId ?? null,
  })
  await committeeResource.load(true)
  return created.id
}
export async function updateCommitteeMember(id: number, data: Partial<CommitteeMember>) {
  await committeeApi.update(id, {
    name: data.name ?? "",
    email: data.email ?? "",
    designation: data.designation ?? "",
    role: data.role ?? "CORE_MEMBER",
    studentId: data.studentId ?? null,
  })
  await committeeResource.load(true)
}
export async function deleteCommitteeMember(id: number) {
  await committeeApi.remove(id)
  await committeeResource.load(true)
}
export async function uploadCommitteePhoto(id: number, file: File) {
  await committeeApi.uploadPhoto(id, file)
  await committeeResource.load(true)
}

/* ------------------------------ ANNOUNCEMENTS ------------------------------ */
const announcementsResource = createResource<Announcement[]>(async () => {
  const list = await announcementApi.getActive()
  return list.map((a) => ({
    id: a.id ?? 0,
    title: a.title,
    message: a.message,
    createdAt: a.createdAt ?? new Date().toISOString(),
    isActive: a.isActive ?? true,
  }))
}, [])

export function useAnnouncements(activeOnly = false) {
  useSyncExternalStore(
    announcementsResource.subscribe,
    announcementsResource.getVersion,
    announcementsResource.getVersion,
  )
  useEffect(() => {
    announcementsResource.load()
  }, [])
  const all = announcementsResource.getData()
  return activeOnly ? all.filter((a) => a.isActive) : all
}

export async function createAnnouncement(title: string, message: string) {
  await announcementApi.create(title, message)
  await announcementsResource.load(true)
}
export async function toggleAnnouncement(id: number, isActive: boolean) {
  // Backend only exposes deactivate (no reactivate endpoint exists)
  if (!isActive) await announcementApi.deactivate(id)
  await announcementsResource.load(true)
}
export async function deleteAnnouncement(id: number) {
  // Backend has no delete endpoint for announcements — deactivating is the
  // closest real equivalent so this doesn't silently no-op.
  await announcementApi.deactivate(id)
  await announcementsResource.load(true)
}

/* ------------------------------ COMPLAINTS ------------------------------ */
const allComplaintsResource = createResource<Complaint[]>(async () => {
  const list = await complaintApi.getAll()
  return list.map(adaptComplaint).sort((a, b) => b.complainId - a.complainId)
}, [])

export function useAllComplaints() {
  useSyncExternalStore(
    allComplaintsResource.subscribe,
    allComplaintsResource.getVersion,
    allComplaintsResource.getVersion,
  )
  useEffect(() => {
    allComplaintsResource.load()
  }, [])
  return allComplaintsResource.getData()
}

// Per-user complaints use a separate resource keyed by email so switching
// users (or admin viewing) doesn't show stale data from another account.
const myComplaintsResources = new Map<string, ReturnType<typeof createResource<Complaint[]>>>()
function getMyComplaintsResource(email: string) {
  let r = myComplaintsResources.get(email)
  if (!r) {
    r = createResource<Complaint[]>(async () => {
      const list = await complaintApi.myComplaints()
      return list.map(adaptComplaint).sort((a, b) => b.complainId - a.complainId)
    }, [])
    myComplaintsResources.set(email, r)
  }
  return r
}

export function useMyComplaints(email: string) {
  const resource = getMyComplaintsResource(email)
  useSyncExternalStore(resource.subscribe, resource.getVersion, resource.getVersion)
  useEffect(() => {
    if (email) resource.load()
  }, [email])
  return resource.getData()
}

export async function createComplaint(data: {
  canteenId: number
  title: string
  description: string
  emailId: string
  hasImage?: boolean
}) {
  const created = await complaintApi.create({
    canteenId: data.canteenId,
    title: data.title,
    description: data.description,
  })
  await allComplaintsResource.load(true)
  await getMyComplaintsResource(data.emailId).load(true)
  return adaptComplaint(created)
}

export async function updateComplaintStatus(id: number, status: ComplaintStatus) {
  await complaintApi.updateStatus(id, status)
  await allComplaintsResource.load(true)
}
export async function escalateComplaint(id: number) {
  await complaintApi.escalate(id)
  await allComplaintsResource.load(true)
}

/* ------------------------------ FEEDBACK ------------------------------ */
const questionsResources = new Map<number, ReturnType<typeof createResource<FeedbackQuestion[]>>>()
function getQuestionsResource(canteenId: number) {
  let r = questionsResources.get(canteenId)
  if (!r) {
    r = createResource<FeedbackQuestion[]>(async () => {
      const list = await feedbackApi.getQuestions(canteenId)
      return list.map((q) => ({ id: q.id, questionText: q.questionText, canteenId }))
    }, [])
    questionsResources.set(canteenId, r)
  }
  return r
}

export function useFeedbackQuestions(canteenId: number) {
  const resource = getQuestionsResource(canteenId)
  useSyncExternalStore(resource.subscribe, resource.getVersion, resource.getVersion)
  useEffect(() => {
    if (canteenId) resource.load()
  }, [canteenId])
  return resource.getData()
}

// Admin "all questions" view — combined across canteens the admin has
// already loaded questions for. If nothing has been fetched yet this starts
// empty; the admin feedback page fetches per-canteen as it's used.
export function useAllQuestions() {
  const [, force] = useState(0)
  useEffect(() => {
    const unsubs = Array.from(questionsResources.values()).map((r) =>
      r.subscribe(() => force((v) => v + 1)),
    )
    return () => unsubs.forEach((u) => u())
  })
  return Array.from(questionsResources.values()).flatMap((r) => r.getData())
}

export async function addFeedbackQuestion(canteenId: number, questionText: string) {
  await feedbackApi.addQuestion(canteenId, questionText)
  await getQuestionsResource(canteenId).load(true)
}
export async function updateFeedbackQuestion(id: number, questionText: string, canteenId: number) {
  await feedbackApi.updateQuestion(id, canteenId, questionText)
  await getQuestionsResource(canteenId).load(true)
}
export async function deleteFeedbackQuestion(id: number, canteenId: number) {
  await feedbackApi.deleteQuestion(id)
  await getQuestionsResource(canteenId).load(true)
}

export async function submitDetailedFeedback(
  canteenId: number,
  items: { questionId: number; option: FeedbackOption; reason: string }[],
) {
  await feedbackApi.submit(
    canteenId,
    items.map((it) => ({ questionId: it.questionId, option: it.option, reason: it.reason })),
  )
}

export function useMonthlyResponses(canteenId: number, year: number, month: number) {
  const [data, setData] = useState<
    { questionId: number; questionText: string; responses: { id: number; option: FeedbackOption; reason: string; createdAt: string }[] }[]
  >([])
  const requestRef = useRef(0)

  useEffect(() => {
    if (!canteenId) return
    const reqId = ++requestRef.current
    feedbackApi.getMonthlyGrouped(canteenId, year, month).then((res) => {
      if (requestRef.current === reqId) setData(res)
    })
  }, [canteenId, year, month])

  return data
}

/* ------------------------------ ENGAGEMENT ------------------------------ */
const engagementResource = createResource<Engagement>(async () => {
  const res = await quickFeedbackApi.me()
  return {
    currentStreak: res.currentStreak,
    bestStreak: res.currentStreak, // backend doesn't track a separate "best" — current is the only real number
    totalPoints: res.totalPoints,
    lastRatedDate: null,
  }
}, { currentStreak: 0, bestStreak: 0, totalPoints: 0, lastRatedDate: null })

export function useEngagement() {
  useSyncExternalStore(engagementResource.subscribe, engagementResource.getVersion, engagementResource.getVersion)
  useEffect(() => {
    engagementResource.load()
  }, [])
  return engagementResource.getData()
}

export async function submitQuickFeedback(canteenId: number, rating: number, tag?: string): Promise<Engagement> {
  const res = await quickFeedbackApi.submit(canteenId, rating, tag)
  const next: Engagement = {
    currentStreak: res.currentStreak,
    bestStreak: Math.max(res.currentStreak, engagementResource.getData().bestStreak),
    totalPoints: res.totalPoints,
    lastRatedDate: new Date().toDateString(),
  }
  engagementResource.setData(next)
  // Re-fetch canteens so the canteen's live average rating reflects this submission.
  await canteensResource.load(true)
  return next
}

/* ------------------------------ STATS ------------------------------ */
// Derived entirely client-side from the resources already being fetched
// elsewhere, rather than a dedicated backend endpoint.
export function useStats() {
  const canteens = useCanteens()
  const complaints = useAllComplaints()
  const announcements = useAnnouncements()
  const committee = useCommittee()

  const pending = complaints.filter(
    (c) => c.complaintStatus === "PENDING" || c.complaintStatus === "IN_PROGRESS",
  ).length
  const escalated = complaints.filter((c) => c.complaintStatus === "ESCALATED").length
  const resolved = complaints.filter((c) => c.complaintStatus === "RESOLVED").length

  const ratedCanteens = canteens.filter((c) => c.ratingCount > 0)
  const totalResponses = canteens.reduce((sum, c) => sum + c.ratingCount, 0)
  const avgRating = ratedCanteens.length
    ? ratedCanteens.reduce((sum, c) => sum + c.rating, 0) / ratedCanteens.length
    : 0

  return {
    canteens: canteens.length,
    complaints: complaints.length,
    pending,
    escalated,
    resolved,
    responses: totalResponses,
    avgRating: Math.round(avgRating * 10) / 10,
    activeAnnouncements: announcements.filter((a) => a.isActive).length,
    committee: committee.length,
  }
}

export const optionToScore: Record<FeedbackOption, number> = {
  VERY_POOR: 1,
  POOR: 2,
  AVERAGE: 3,
  GOOD: 4,
  VERY_GOOD: 5,
}
export const scoreToOption = (n: number): FeedbackOption =>
  (["VERY_POOR", "POOR", "AVERAGE", "GOOD", "VERY_GOOD"] as const)[
    Math.min(4, Math.max(0, Math.round(n) - 1))
  ]
