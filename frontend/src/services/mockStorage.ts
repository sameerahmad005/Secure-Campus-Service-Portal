/**
 * Stateful In-Memory & LocalStorage Mock Data Store
 * Simulates persistence and realistic async network delay (150-300ms)
 * to exercise real loading states in UI components.
 */

import type {
  User,
  Complaint,
  ServiceRequest,
  ServiceDefinition,
  Notice,
  Notification,
  AuditLog,
  Department,
} from '../types';

import {
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_SERVICES,
  MOCK_COMPLAINTS,
  MOCK_REQUESTS,
  MOCK_NOTICES,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
} from '../mocks/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'scsp_mock_current_user',
  COMPLAINTS: 'scsp_mock_complaints',
  REQUESTS: 'scsp_mock_requests',
  NOTICES: 'scsp_mock_notices',
  NOTIFICATIONS: 'scsp_mock_notifications',
  AUDIT_LOGS: 'scsp_mock_audit_logs',
  USERS: 'scsp_mock_users',
};

// Simulate async network latency
export const simulateDelay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

class MockStorage {
  private users: User[];
  private departments: Department[];
  private services: ServiceDefinition[];
  private complaints: Complaint[];
  private requests: ServiceRequest[];
  private notices: Notice[];
  private notifications: Notification[];
  private auditLogs: AuditLog[];
  private currentUser: User;

  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, MOCK_USERS);
    this.departments = MOCK_DEPARTMENTS;
    this.services = MOCK_SERVICES;
    this.complaints = this.load(STORAGE_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    this.requests = this.load(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS);
    this.notices = this.load(STORAGE_KEYS.NOTICES, MOCK_NOTICES);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    this.auditLogs = this.load(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);

    const savedUser = this.load<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.currentUser = savedUser || this.users[0]; // Default to student
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private persist(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to persist mock data for ${key}:`, e);
    }
  }

  // --- Auth / User Store ---
  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    this.persist(STORAGE_KEYS.CURRENT_USER, user);
  }

  getUsers(): User[] {
    return [...this.users];
  }

  toggleUserActive(userId: string): User {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], isActive: !this.users[idx].isActive };
      this.persist(STORAGE_KEYS.USERS, this.users);
      return this.users[idx];
    }
    throw new Error(`User not found: ${userId}`);
  }

  // --- Departments & Services ---
  getDepartments(): Department[] {
    return [...this.departments];
  }

  getServices(): ServiceDefinition[] {
    return [...this.services];
  }

  // --- Complaints Store ---
  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  addComplaint(complaint: Complaint): void {
    this.complaints.unshift(complaint);
    this.persist(STORAGE_KEYS.COMPLAINTS, this.complaints);
  }

  updateComplaint(updated: Complaint): void {
    const idx = this.complaints.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      this.complaints[idx] = updated;
      this.persist(STORAGE_KEYS.COMPLAINTS, this.complaints);
    }
  }

  // --- Requests Store ---
  getRequests(): ServiceRequest[] {
    return [...this.requests];
  }

  addRequest(request: ServiceRequest): void {
    this.requests.unshift(request);
    this.persist(STORAGE_KEYS.REQUESTS, this.requests);
  }

  updateRequest(updated: ServiceRequest): void {
    const idx = this.requests.findIndex((r) => r.id === updated.id);
    if (idx >= 0) {
      this.requests[idx] = updated;
      this.persist(STORAGE_KEYS.REQUESTS, this.requests);
    }
  }

  // --- Notices Store ---
  getNotices(): Notice[] {
    return [...this.notices];
  }

  addNotice(notice: Notice): void {
    this.notices.unshift(notice);
    this.persist(STORAGE_KEYS.NOTICES, this.notices);
  }

  // --- Notifications Store ---
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  markNotificationRead(notificationId: string): void {
    const idx = this.notifications.findIndex((n) => n.id === notificationId);
    if (idx >= 0) {
      this.notifications[idx] = { ...this.notifications[idx], isRead: true };
      this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications = this.notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  logAction(actor: User, action: string, targetEntity: string, details: string): void {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      targetEntity,
      details,
      ipAddress: '127.0.0.1 (Dev Simulation)',
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.persist(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // Reset to default factory mock dataset
  resetStore(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.NOTICES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    this.users = [...MOCK_USERS];
    this.complaints = [...MOCK_COMPLAINTS];
    this.requests = [...MOCK_REQUESTS];
    this.notices = [...MOCK_NOTICES];
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.auditLogs = [...MOCK_AUDIT_LOGS];
    this.currentUser = this.users[0];
  }
}

export const mockStorage = new MockStorage();
