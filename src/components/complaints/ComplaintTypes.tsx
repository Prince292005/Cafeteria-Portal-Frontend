// Defines all possible statuses from your backend
export type ComplaintStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "ESCALATED";

// NEW: Defines the structure for an admin's reply
export interface AdminReply {
  id: string;
  adminName: string;
  message: string;
  repliedAt: string;
}

// NEW: Updated Complaint interface with full details
export interface Complaint {
  id: string | number;
  title: string;
  status: ComplaintStatus;
  createdAt: string;
  description: string; // <-- Added for modal
  adminReplies: AdminReply[]; // <-- Added for modal
}
