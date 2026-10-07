import type {
  User,
  Role,
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPriority,
  ServiceRequest,
  ServiceRequestStatus,
  ServiceDefinition,
  Notice,
  Notification,
  AuditLog,
  Department,
  Feedback,
  DashboardStatistics,
} from '../types';

export interface LoginCredentials {
  email: string;
  password?: string;
  roleHint?: Role;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  switchMockRole(role: Role): Promise<User>;
  getMockAccounts(): Promise<User[]>;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  departmentId: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location?: string;
  attachmentFiles?: File[];
}

export interface UpdateComplaintStatusInput {
  complaintId: string;
  newStatus: ComplaintStatus;
  comment?: string;
  internalRemark?: string;
  publicRemark?: string;
}

export interface AssignStaffInput {
  ticketId: string;
  staffId: string;
  staffName: string;
}

export interface IComplaintService {
  getComplaints(filter?: {
    studentId?: string;
    departmentId?: string;
    status?: ComplaintStatus;
    search?: string;
  }): Promise<Complaint[]>;
  getComplaintById(id: string): Promise<Complaint | null>;
  createComplaint(student: User, data: CreateComplaintInput): Promise<Complaint>;
  updateStatus(actor: User, input: UpdateComplaintStatusInput): Promise<Complaint>;
  assignStaff(actor: User, input: AssignStaffInput): Promise<Complaint>;
  addRemark(actor: User, complaintId: string, content: string, isInternal: boolean): Promise<Complaint>;
  submitFeedback(student: User, complaintId: string, feedback: { rating: number; comment?: string }): Promise<Feedback>;
}

export interface CreateServiceRequestInput {
  serviceId: string;
  formData: Record<string, string>;
  attachmentFiles?: File[];
}

export interface IServiceRequestService {
  getAvailableServices(): Promise<ServiceDefinition[]>;
  getServiceById(id: string): Promise<ServiceDefinition | null>;
  getRequests(filter?: {
    studentId?: string;
    departmentId?: string;
    status?: ServiceRequestStatus;
  }): Promise<ServiceRequest[]>;
  getRequestById(id: string): Promise<ServiceRequest | null>;
  createRequest(student: User, data: CreateServiceRequestInput): Promise<ServiceRequest>;
  updateStatus(actor: User, requestId: string, newStatus: ServiceRequestStatus, comment?: string): Promise<ServiceRequest>;
}

export interface INoticeService {
  getNotices(audience?: 'ALL' | 'STUDENTS' | 'STAFF'): Promise<Notice[]>;
  getNoticeById(id: string): Promise<Notice | null>;
  createNotice(actor: User, notice: Omit<Notice, 'id' | 'publishedAt' | 'publishedById' | 'publishedByName' | 'publishedByRole' | 'isMockData'>): Promise<Notice>;
}

export interface INotificationService {
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IAdminService {
  getDepartments(): Promise<Department[]>;
  getSystemStatistics(): Promise<DashboardStatistics>;
  getAuditLogs(): Promise<AuditLog[]>;
  getUsers(): Promise<User[]>;
  toggleUserActiveStatus(actor: User, targetUserId: string): Promise<User>;
}
