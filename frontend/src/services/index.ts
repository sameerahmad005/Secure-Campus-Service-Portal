/**
 * Mock Service Layer Implementations
 * 
 * Implements the service contracts defined in `types.ts`.
 * UI components consume these services directly, meaning that later backend
 * integration requires updating ONLY these service implementations (replacing
 * mockStorage calls with fetch/axios to /api/v1/*) without touching UI components.
 */

import type {
  IAuthService,
  IComplaintService,
  IServiceRequestService,
  INoticeService,
  INotificationService,
  IAdminService,
  LoginCredentials,
  AuthSession,
  CreateComplaintInput,
  UpdateComplaintStatusInput,
  AssignStaffInput,
  CreateServiceRequestInput,
} from './types';

import type {
  User,
  Role,
  Complaint,
  ServiceRequest,
  ServiceDefinition,
  Notice,
  Notification,
  AuditLog,
  Department,
  Feedback,
  DashboardStatistics,
} from '../types';

import { mockStorage, simulateDelay } from './mockStorage';

// ==========================================
// Authentication Service (Mock)
// ==========================================
export const authService: IAuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await simulateDelay(250);
    const users = mockStorage.getUsers();
    
    // Find user by role hint or email match
    let user = credentials.roleHint
      ? users.find((u) => u.role === credentials.roleHint)
      : users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
      // Default to first student if not matched
      user = users[0];
    }

    mockStorage.setCurrentUser(user);
    mockStorage.logAction(user, 'LOGIN_SUCCESS', `User:${user.id}`, 'User session established via mock auth');

    return {
      user,
      token: `mock_jwt_token_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  },

  async logout(): Promise<void> {
    await simulateDelay(150);
    const user = mockStorage.getCurrentUser();
    mockStorage.logAction(user, 'LOGOUT', `User:${user.id}`, 'User signed out of mock session');
  },

  async getCurrentUser(): Promise<User | null> {
    await simulateDelay(100);
    return mockStorage.getCurrentUser();
  },

  async switchMockRole(role: Role): Promise<User> {
    await simulateDelay(150);
    const users = mockStorage.getUsers();
    const target = users.find((u) => u.role === role) || users[0];
    mockStorage.setCurrentUser(target);
    mockStorage.logAction(target, 'DEV_ROLE_SWITCH', `User:${target.id}`, `Switched active mock role to ${role}`);
    return target;
  },

  async getMockAccounts(): Promise<User[]> {
    await simulateDelay(100);
    return mockStorage.getUsers();
  },
};

// ==========================================
// Complaints Service (Mock)
// ==========================================
export const complaintService: IComplaintService = {
  async getComplaints(filter): Promise<Complaint[]> {
    await simulateDelay(200);
    let list = mockStorage.getComplaints();

    if (filter?.studentId) {
      list = list.filter((c) => c.studentId === filter.studentId);
    }
    if (filter?.departmentId) {
      list = list.filter((c) => c.departmentId === filter.departmentId);
    }
    if (filter?.status) {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ticketNumber.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getComplaintById(id: string): Promise<Complaint | null> {
    await simulateDelay(150);
    const list = mockStorage.getComplaints();
    return list.find((c) => c.id === id || c.ticketNumber === id) || null;
  },

  async createComplaint(student: User, data: CreateComplaintInput): Promise<Complaint> {
    await simulateDelay(350);
    const count = mockStorage.getComplaints().length + 1;
    const ticketNumber = `CMP-2026-${String(count).padStart(4, '0')}`;
    const departments = mockStorage.getDepartments();
    const dept = departments.find((d) => d.id === data.departmentId);

    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}`,
      ticketNumber,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      departmentId: data.departmentId,
      departmentName: dept ? dept.name : 'General Maintenance & Services',
      category: data.category,
      priority: data.priority,
      title: data.title,
      description: data.description,
      location: data.location || 'Campus Facility',
      status: 'SUBMITTED',
      attachments: data.attachmentFiles?.map((file, i) => ({
        id: `att_${Date.now()}_${i}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      })) || [],
      statusHistory: [
        {
          id: `sh_${Date.now()}`,
          entityId: `cmp_${Date.now()}`,
          fromStatus: 'NONE',
          toStatus: 'SUBMITTED',
          changedById: student.id,
          changedByName: student.name,
          changedByRole: student.role,
          comment: 'Ticket initially lodged by student.',
          timestamp: new Date().toISOString(),
        },
      ],
      remarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.addComplaint(newComplaint);
    mockStorage.logAction(student, 'CREATE_COMPLAINT', `Complaint:${ticketNumber}`, `Created complaint: ${data.title}`);

    // Create confirmation notification for student
    mockStorage.addNotification({
      id: `ntf_${Date.now()}`,
      userId: student.id,
      title: 'Complaint Lodged Successfully',
      message: `Your ticket ${ticketNumber} has been received and routed to ${dept?.name}.`,
      type: 'STATUS_UPDATE',
      entityType: 'COMPLAINT',
      entityId: newComplaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newComplaint;
  },

  async updateStatus(actor: User, input: UpdateComplaintStatusInput): Promise<Complaint> {
    await simulateDelay(300);
    const complaint = await this.getComplaintById(input.complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const prevStatus = complaint.status;
    complaint.status = input.newStatus;
    complaint.updatedAt = new Date().toISOString();

    if (input.newStatus === 'RESOLVED' || input.newStatus === 'CLOSED') {
      complaint.resolvedAt = new Date().toISOString();
    }

    // Append history
    complaint.statusHistory.unshift({
      id: `sh_${Date.now()}`,
      entityId: complaint.id,
      fromStatus: prevStatus,
      toStatus: input.newStatus,
      changedById: actor.id,
      changedByName: actor.name,
      changedByRole: actor.role,
      comment: input.comment || `Status updated to ${input.newStatus}`,
      timestamp: new Date().toISOString(),
    });

    // Append public remark if supplied
    if (input.publicRemark?.trim()) {
      complaint.remarks.unshift({
        id: `rem_${Date.now()}`,
        entityId: complaint.id,
        authorId: actor.id,
        authorName: actor.name,
        authorRole: actor.role,
        content: input.publicRemark,
        isInternal: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Append internal remark if supplied
    if (input.internalRemark?.trim()) {
      complaint.remarks.unshift({
        id: `rem_int_${Date.now()}`,
        entityId: complaint.id,
        authorId: actor.id,
        authorName: actor.name,
        authorRole: actor.role,
        content: input.internalRemark,
        isInternal: true,
        createdAt: new Date().toISOString(),
      });
    }

    mockStorage.updateComplaint(complaint);
    mockStorage.logAction(
      actor,
      'STATUS_TRANSITION',
      `Complaint:${complaint.ticketNumber}`,
      `Transitioned status from ${prevStatus} to ${input.newStatus}`
    );

    // Notify student of progress
    mockStorage.addNotification({
      id: `ntf_${Date.now()}`,
      userId: complaint.studentId,
      title: `Complaint ${complaint.ticketNumber} Update`,
      message: `Status changed to ${input.newStatus.replace('_', ' ')}.`,
      type: 'STATUS_UPDATE',
      entityType: 'COMPLAINT',
      entityId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return complaint;
  },

  async assignStaff(actor: User, input: AssignStaffInput): Promise<Complaint> {
    await simulateDelay(250);
    const complaint = await this.getComplaintById(input.ticketId);
    if (!complaint) throw new Error('Complaint not found');

    complaint.assignedStaffId = input.staffId;
    complaint.assignedStaffName = input.staffName;
    if (complaint.status === 'SUBMITTED') {
      complaint.status = 'UNDER_REVIEW';
    }
    complaint.updatedAt = new Date().toISOString();

    mockStorage.updateComplaint(complaint);
    mockStorage.logAction(
      actor,
      'CASE_ASSIGNMENT',
      `Complaint:${complaint.ticketNumber}`,
      `Assigned to staff officer ${input.staffName}`
    );

    return complaint;
  },

  async addRemark(actor: User, complaintId: string, content: string, isInternal: boolean): Promise<Complaint> {
    await simulateDelay(200);
    const complaint = await this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    complaint.remarks.unshift({
      id: `rem_${Date.now()}`,
      entityId: complaint.id,
      authorId: actor.id,
      authorName: actor.name,
      authorRole: actor.role,
      content,
      isInternal,
      createdAt: new Date().toISOString(),
    });

    mockStorage.updateComplaint(complaint);
    return complaint;
  },

  async submitFeedback(student: User, complaintId: string, feedback: { rating: number; comment?: string }): Promise<Feedback> {
    await simulateDelay(250);
    const complaint = await this.getComplaintById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const feedbackObj: Feedback = {
      id: `fb_${Date.now()}`,
      ticketId: complaint.id,
      rating: feedback.rating,
      comment: feedback.comment,
      submittedAt: new Date().toISOString(),
    };

    complaint.feedback = feedbackObj;
    mockStorage.updateComplaint(complaint);
    mockStorage.logAction(
      student,
      'SUBMIT_FEEDBACK',
      `Complaint:${complaint.ticketNumber}`,
      `Submitted feedback with rating ${feedback.rating}/5`
    );

    return feedbackObj;
  },
};

// ==========================================
// Service Requests Service (Mock)
// ==========================================
export const serviceRequestService: IServiceRequestService = {
  async getAvailableServices(): Promise<ServiceDefinition[]> {
    await simulateDelay(150);
    return mockStorage.getServices();
  },

  async getServiceById(id: string): Promise<ServiceDefinition | null> {
    await simulateDelay(100);
    return mockStorage.getServices().find((s) => s.id === id) || null;
  },

  async getRequests(filter): Promise<ServiceRequest[]> {
    await simulateDelay(200);
    let list = mockStorage.getRequests();
    if (filter?.studentId) {
      list = list.filter((r) => r.studentId === filter.studentId);
    }
    if (filter?.departmentId) {
      list = list.filter((r) => r.departmentId === filter.departmentId);
    }
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    return list;
  },

  async getRequestById(id: string): Promise<ServiceRequest | null> {
    await simulateDelay(150);
    const list = mockStorage.getRequests();
    return list.find((r) => r.id === id || r.requestNumber === id) || null;
  },

  async createRequest(student: User, data: CreateServiceRequestInput): Promise<ServiceRequest> {
    await simulateDelay(350);
    const service = await this.getServiceById(data.serviceId);
    if (!service) throw new Error('Service definition not found');

    const count = mockStorage.getRequests().length + 1;
    const requestNumber = `REQ-2026-${String(count).padStart(4, '0')}`;

    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      requestNumber,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      serviceId: service.id,
      serviceName: service.title,
      departmentId: service.departmentId,
      departmentName: service.departmentName,
      category: service.category,
      formData: data.formData,
      status: 'SUBMITTED',
      attachments: data.attachmentFiles?.map((file, i) => ({
        id: `att_req_${Date.now()}_${i}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      })) || [],
      statusHistory: [
        {
          id: `sh_req_${Date.now()}`,
          entityId: `req_${Date.now()}`,
          fromStatus: 'NONE',
          toStatus: 'SUBMITTED',
          changedById: student.id,
          changedByName: student.name,
          changedByRole: student.role,
          comment: 'Request filed online by student.',
          timestamp: new Date().toISOString(),
        },
      ],
      remarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.addRequest(newRequest);
    mockStorage.logAction(
      student,
      'CREATE_REQUEST',
      `ServiceRequest:${requestNumber}`,
      `Filed request for ${service.title}`
    );

    mockStorage.addNotification({
      id: `ntf_${Date.now()}`,
      userId: student.id,
      title: 'Service Request Submitted',
      message: `Your request ${requestNumber} for ${service.title} was submitted.`,
      type: 'STATUS_UPDATE',
      entityType: 'REQUEST',
      entityId: newRequest.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return newRequest;
  },

  async updateStatus(actor: User, requestId: string, newStatus, comment): Promise<ServiceRequest> {
    await simulateDelay(250);
    const req = await this.getRequestById(requestId);
    if (!req) throw new Error('Request not found');

    const prevStatus = req.status;
    req.status = newStatus;
    req.updatedAt = new Date().toISOString();

    if (newStatus === 'FULFILLED' || newStatus === 'CLOSED') {
      req.completedAt = new Date().toISOString();
    }

    req.statusHistory.unshift({
      id: `sh_req_${Date.now()}`,
      entityId: req.id,
      fromStatus: prevStatus,
      toStatus: newStatus,
      changedById: actor.id,
      changedByName: actor.name,
      changedByRole: actor.role,
      comment: comment || `Status updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    mockStorage.updateRequest(req);
    mockStorage.logAction(
      actor,
      'STATUS_TRANSITION',
      `ServiceRequest:${req.requestNumber}`,
      `Updated request status from ${prevStatus} to ${newStatus}`
    );

    mockStorage.addNotification({
      id: `ntf_${Date.now()}`,
      userId: req.studentId,
      title: `Service Request ${req.requestNumber} Updated`,
      message: `Your request status has been updated to ${newStatus.replace('_', ' ')}.`,
      type: 'STATUS_UPDATE',
      entityType: 'REQUEST',
      entityId: req.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return req;
  },
};

// ==========================================
// Notices Service (Mock)
// ==========================================
export const noticeService: INoticeService = {
  async getNotices(audience): Promise<Notice[]> {
    await simulateDelay(150);
    let list = mockStorage.getNotices();
    if (audience && audience !== 'ALL') {
      list = list.filter((n) => n.targetAudience === 'ALL' || n.targetAudience === audience);
    }
    return list;
  },

  async getNoticeById(id: string): Promise<Notice | null> {
    await simulateDelay(100);
    return mockStorage.getNotices().find((n) => n.id === id) || null;
  },

  async createNotice(actor: User, notice): Promise<Notice> {
    await simulateDelay(300);
    const newNotice: Notice = {
      ...notice,
      id: `not_${Date.now()}`,
      publishedById: actor.id,
      publishedByName: actor.name,
      publishedByRole: actor.role,
      publishedAt: new Date().toISOString(),
      isMockData: true,
    };

    mockStorage.addNotice(newNotice);
    mockStorage.logAction(
      actor,
      'NOTICE_PUBLISHED',
      `Notice:${newNotice.id}`,
      `Published notice: "${newNotice.title}"`
    );

    return newNotice;
  },
};

// ==========================================
// Notifications Service (Mock)
// ==========================================
export const notificationService: INotificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    await simulateDelay(100);
    return mockStorage.getNotifications(userId);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await simulateDelay(50);
    mockStorage.markNotificationRead(notificationId);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await simulateDelay(80);
    mockStorage.markAllNotificationsRead(userId);
  },
};

// ==========================================
// Admin Service (Mock)
// ==========================================
export const adminService: IAdminService = {
  async getDepartments(): Promise<Department[]> {
    await simulateDelay(120);
    return mockStorage.getDepartments();
  },

  async getSystemStatistics(): Promise<DashboardStatistics> {
    await simulateDelay(200);
    const complaints = mockStorage.getComplaints();
    const requests = mockStorage.getRequests();

    const openComplaintsCount = complaints.filter(
      (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'REJECTED'
    ).length;

    const resolvedComplaintsCount = complaints.filter(
      (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
    ).length;

    const activeRequestsCount = requests.filter(
      (r) => r.status !== 'FULFILLED' && r.status !== 'CLOSED' && r.status !== 'REJECTED'
    ).length;

    const criticalCasesCount = complaints.filter(
      (c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED'
    ).length;

    return {
      openComplaintsCount,
      resolvedComplaintsCount,
      activeRequestsCount,
      totalUsersCount: mockStorage.getUsers().length,
      totalDepartmentsCount: mockStorage.getDepartments().length,
      averageResolutionDays: 2.4, // Mock indicator
      criticalCasesCount,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    await simulateDelay(180);
    return mockStorage.getAuditLogs();
  },

  async getUsers(): Promise<User[]> {
    await simulateDelay(150);
    return mockStorage.getUsers();
  },

  async toggleUserActiveStatus(actor: User, targetUserId: string): Promise<User> {
    await simulateDelay(200);
    const user = mockStorage.toggleUserActive(targetUserId);
    mockStorage.logAction(
      actor,
      'USER_STATUS_CHANGE',
      `User:${user.id}`,
      `Changed user active status to: ${user.isActive}`
    );
    return user;
  },
};
