/**
 * Secure Campus Service Portal - Core Domain Types and Data Contracts
 * 
 * NOTE: These types reflect the architectural entities defined in PRD.md,
 * TECHSTACK.md, and SECURITY.md. They serve as the single source of truth
 * for both frontend UI components and the mock service layer, ensuring seamless
 * integration when replacing mock services with real backend endpoints.
 */

export type Role = 'STUDENT' | 'STAFF' | 'DEPT_ADMIN' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string; // Roll / Enrollment number placeholder (Student only)
  employeeId?: string; // Staff ID placeholder
  departmentId?: string; // Department affiliation (Staff / Dept Admin)
  departmentName?: string;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  contactEmail: string;
  location: string;
  isActive: boolean;
  isMockData: true; // Explicit declaration: not verified AMU institutional entity
}

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintCategory =
  | 'INFRASTRUCTURE'
  | 'ACADEMIC'
  | 'HOSTEL'
  | 'IT_NETWORK'
  | 'SANITATION'
  | 'LIBRARY'
  | 'ADMINISTRATIVE'
  | 'OTHER';

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface StatusHistory {
  id: string;
  entityId: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  changedByName: string;
  changedByRole: Role;
  comment?: string;
  timestamp: string;
}

export interface Remark {
  id: string;
  entityId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  isInternal: boolean; // true = visible to staff/admin only; false = visible to student
  createdAt: string;
}

export interface Feedback {
  id: string;
  ticketId: string;
  rating: number; // 1 to 5
  comment?: string;
  submittedAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string; // Format: CMP-YYYY-XXXX
  studentId: string;
  studentName: string;
  studentEmail: string;
  departmentId: string;
  departmentName: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  location?: string;
  status: ComplaintStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  attachments: Attachment[];
  statusHistory: StatusHistory[];
  remarks: Remark[];
  feedback?: Feedback;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type ServiceRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'FULFILLED'
  | 'REJECTED'
  | 'CLOSED';

export type RequestCategory =
  | 'BONAFIDE_CERTIFICATE'
  | 'ID_CARD_REPLACEMENT'
  | 'HOSTEL_ALLOTMENT'
  | 'WIFI_ACCESS'
  | 'LIBRARY_CLEARANCE'
  | 'TRANSCRIPT_REQUEST'
  | 'LAB_PERMISSION'
  | 'GENERAL_SERVICE';

export interface ServiceFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ServiceDefinition {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  category: RequestCategory;
  description: string;
  estimatedTurnaroundDays: number;
  formFields: ServiceFormField[];
  isActive: boolean;
  isMockData: true;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string; // Format: REQ-YYYY-XXXX
  studentId: string;
  studentName: string;
  studentEmail: string;
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  category: RequestCategory;
  formData: Record<string, string>;
  status: ServiceRequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  attachments: Attachment[];
  statusHistory: StatusHistory[];
  remarks: Remark[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type NoticeCategory =
  | 'GENERAL'
  | 'ACADEMIC'
  | 'EXAMINATION'
  | 'HOSTEL'
  | 'MAINTENANCE'
  | 'URGENT';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  publishedById: string;
  publishedByName: string;
  publishedByRole: Role;
  departmentId?: string;
  departmentName?: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'STAFF';
  isPinned: boolean;
  publishedAt: string;
  isMockData: true;
}

export type NotificationType =
  | 'STATUS_UPDATE'
  | 'NEW_ASSIGNMENT'
  | 'NOTICE'
  | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType?: 'COMPLAINT' | 'REQUEST' | 'NOTICE';
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardStatistics {
  openComplaintsCount: number;
  resolvedComplaintsCount: number;
  activeRequestsCount: number;
  totalUsersCount?: number;
  totalDepartmentsCount?: number;
  averageResolutionDays?: number;
  criticalCasesCount?: number;
}
