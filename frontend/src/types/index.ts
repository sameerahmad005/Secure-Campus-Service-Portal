/**
 * Secure Campus Service Portal - Core Domain Types and Data Contracts
 * 
 * NOTE: These types reflect the architectural entities defined in PRD.md,
 * TECHSTACK.md, and SECURITY.md. They serve as the single source of truth
 * for both frontend UI components and the mock service layer, ensuring seamless
 * integration when replacing mock services with real backend endpoints.
 */

import type {
  VerificationStatus,
  RequesterType,
  AttendanceComplaintData,
} from './serviceCatalog';

export * from './serviceCatalog';

/**
 * 9 Stakeholder Roles identified in Stakeholder.pdf analysis:
 * 1. STUDENT: Basic student user
 * 2. DSW: Welfare manager
 * 3. HALL_STAFF: Hall Provosts / Wardens / Hall Office Staff (Hall-level access)
 * 4. DEPT_STAFF: Department / Section Administrative Staff (Department-level access)
 * 5. FACULTY: Professors / Teachers (Faculty access)
 * 6. SRGC: Student Grievance Cell (Grievance manager)
 * 7. MANAGEMENT: University Administration / Management (Management access)
 * 8. CHAIRMAN: Department / Unit Chairman (Senior oversight)
 * 9. IT_ADMIN: IT / System Administrators (Technical admin)
 *
 * (Legacy aliases STAFF, DEPT_ADMIN, ADMIN are retained for backward compatibility)
 */
export type Role =
  | 'STUDENT'
  | 'DSW'
  | 'HALL_STAFF'
  | 'DEPT_STAFF'
  | 'FACULTY'
  | 'SRGC'
  | 'MANAGEMENT'
  | 'UNIVERSITY_MGMT'
  | 'CHAIRMAN'
  | 'IT_ADMIN'
  | 'STAFF'
  | 'DEPT_ADMIN'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string; // Roll / Enrollment number placeholder (Student only)
  employeeId?: string; // Staff / Faculty ID placeholder
  departmentId?: string; // Department affiliation
  departmentName?: string;
  hallId?: string; // Hall affiliation (Hall Staff / Provost)
  hallName?: string;
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

/**
 * Complaint Status lifecycle sourced from Stakeholder.pdf (Page 6):
 * - SUBMITTED: Student ne complaint submit kar di.
 * - UNDER_REVIEW: Attendance in-charge ya teacher records verify kar raha hai.
 * - NEED_MORE_INFO: Student se additional proof ya clarification chahiye.
 * - ESCALATED: Department Head ko case forward kiya gaya hai.
 * - RESOLVED: Verified correction kar di gayi hai, ya reasoned decision de diya gaya hai.
 * - REJECTED: Verification ke baad complaint valid nahi mili; reason student ko bataya jayega.
 * 
 * (IN_PROGRESS and CLOSED retained for legacy/request compatibility)
 */
export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEED_MORE_INFO'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'CLOSED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintCategory =
  | 'ACADEMIC'
  | 'INFRASTRUCTURE'
  | 'IT_NETWORK'
  | 'HOSTEL'
  | 'ACADEMIC_DOCUMENTS'
  | 'WELFARE_GRIEVANCE'
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

export interface AssignmentHistory {
  id: string;
  complaintId: string;
  fromAssignment: string;
  toAssignment: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: Role;
  reason: string;
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
  ticketNumber: string; // Format: CMP-YYYY-XXXX (Complaint_ID in PDF)
  studentId: string; // Student_ID in PDF
  studentName: string;
  studentEmail: string;
  departmentId: string;
  departmentName: string;
  hallId?: string;
  hallName?: string;
  category: ComplaintCategory;
  subcategoryId?: string;
  subcategoryName?: string;
  priority: ComplaintPriority;
  title: string;
  description: string;
  location?: string;
  status: ComplaintStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedUnit?: string; // Assigned_To in PDF
  attachments: Attachment[];
  statusHistory: StatusHistory[];
  assignmentHistory?: AssignmentHistory[];
  remarks: Remark[];
  feedback?: Feedback;
  resolutionReason?: string;
  rejectionReason?: string;
  dynamicFormData?: Record<string, any>; // Stores attendance details or custom form data
  attendanceData?: AttendanceComplaintData;
  createdAt: string; // Submission_Date in PDF
  updatedAt: string; // Last_Updated in PDF
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
  | 'GENERAL_SERVICE'
  | 'PROFILE_CORRECTION'
  | 'EXAM_HALL_TICKET'
  | 'RESULT_DEGREE'
  | 'INSTITUTE_EMAIL'
  | 'SCHOLARSHIP'
  | 'CAMPUS_WIFI'
  | 'MEDICAL_APPOINTMENT'
  | 'FEE_PAYMENTS';

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

export interface StudentAcademicRecord {
  id: string;
  userId: string;
  enrollmentNumber: string;
  rollNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  admissionYear: number;
  course: {
    id: string;
    code: string;
    name: string;
    total_semesters: number;
    degree_level: string;
  };
  academicSession: {
    id: string;
    session_name: string;
  };
  currentSemester: number;
  allottedHall?: {
    id: string;
    code: string;
    name: string;
  } | null;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt: string;
}

export interface FacultyAcademicRecord {
  id: string;
  userId: string;
  facultyNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  dateOfBirth?: string;
  gender?: string;
  appointmentType: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt: string;
}
