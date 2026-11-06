/**
 * Secure Campus Service Portal - Role Permissions & Access Scoping Matrix
 * 
 * Based on Stakeholder.pdf Analysis (Pages 1-3)
 * 
 * SECURITY RULES:
 * 1. Frontend checks are for UI guidance & mock prototype behavior only.
 *    Real authorization MUST be enforced independently on the backend API.
 * 2. IT Administrators manage technical operations (users, config, audit logs)
 *    and MUST NOT have unconstrained access to academic or student welfare cases.
 * 3. Internal staff notes must NEVER be disclosed to students.
 */

import type { Role, User, Complaint, ComplaintStatus } from '../types';

/**
 * Valid Status Transitions per Stakeholder.pdf (Page 6)
 */
export const COMPLAINT_TRANSITION_MAP: Record<ComplaintStatus, ComplaintStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['NEED_MORE_INFO', 'ESCALATED', 'RESOLVED', 'REJECTED'],
  NEED_MORE_INFO: ['UNDER_REVIEW'],
  ESCALATED: ['UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
  RESOLVED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  IN_PROGRESS: ['UNDER_REVIEW', 'RESOLVED', 'REJECTED'], // legacy compatibility
  CLOSED: [],
};

/**
 * Check whether a user is authorized to view a specific complaint record
 */
export function canAccessComplaint(user: User, complaint: Complaint): boolean {
  switch (user.role) {
    case 'STUDENT':
      // Students can ONLY view their own complaints
      return complaint.studentId === user.id || complaint.studentEmail === user.email;

    case 'FACULTY':
      // Faculty can view their own submitted cases OR cases specifically assigned to them
      return (
        complaint.studentId === user.id ||
        complaint.assignedStaffId === user.id ||
        complaint.attendanceData?.facultyName === user.name
      );

    case 'DEPT_STAFF':
    case 'STAFF':
    case 'DEPT_ADMIN':
      // Department staff can access cases belonging to their permitted department
      return (
        !user.departmentId ||
        complaint.departmentId === user.departmentId ||
        complaint.assignedStaffId === user.id
      );

    case 'HALL_STAFF':
      // Hall staff can access hostel/hall complaints or cases in their assigned hall
      return (
        complaint.category === 'HOSTEL' ||
        (!!user.hallId && complaint.hallId === user.hallId) ||
        complaint.assignedStaffId === user.id
      );

    case 'DSW':
      // DSW staff can view student welfare cases, grievances, or assigned cases
      return (
        complaint.category === 'WELFARE_GRIEVANCE' ||
        complaint.departmentId === 'dept_dsw' ||
        complaint.assignedStaffId === user.id
      );

    case 'SRGC':
      // Student Grievance Cell can review formal grievances, academic disputes, and escalations
      return (
        complaint.category === 'WELFARE_GRIEVANCE' ||
        complaint.category === 'ACADEMIC' ||
        complaint.status === 'ESCALATED' ||
        complaint.departmentId === 'dept_srgc'
      );

    case 'CHAIRMAN':
      // Chairman has oversight of department complaints and campus-level escalations
      return (
        !user.departmentId ||
        complaint.departmentId === user.departmentId ||
        complaint.status === 'ESCALATED' ||
        complaint.category === 'ACADEMIC'
      );

    case 'MANAGEMENT':
      // University Management has high-level oversight of campus complaints
      return true;

    case 'IT_ADMIN':
    case 'ADMIN':
      // IT Admin may only view IT & digital services technical tickets;
      // IT Admin MUST NOT access academic, welfare, or personal student grievances
      return complaint.category === 'IT_NETWORK' || complaint.departmentId === 'dept_cc';

    default:
      return false;
  }
}

/**
 * Check whether a user role is permitted to see internal staff notes
 */
export function canViewInternalRemarks(role: Role): boolean {
  // Students must NEVER see internal remarks
  return role !== 'STUDENT';
}

/**
 * Check whether an actor is permitted to transition a complaint to a target status
 */
export function canTransitionStatus(
  actor: User,
  complaint: Complaint,
  targetStatus: ComplaintStatus
): { allowed: boolean; reason?: string } {
  // Check if valid transition according to lifecycle state machine
  const allowedNext = COMPLAINT_TRANSITION_MAP[complaint.status] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition directly from ${complaint.status} to ${targetStatus}. Allowed: ${allowedNext.join(', ')}`,
    };
  }

  // Role checks
  if (actor.role === 'STUDENT') {
    // Student can only transition NEED_MORE_INFO -> UNDER_REVIEW (when supplying info)
    if (complaint.status === 'NEED_MORE_INFO' && targetStatus === 'UNDER_REVIEW') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Students cannot alter complaint workflow states.',
    };
  }

  if (actor.role === 'IT_ADMIN' || actor.role === 'ADMIN') {
    if (complaint.category !== 'IT_NETWORK') {
      return {
        allowed: false,
        reason: 'IT Administrators cannot modify academic or welfare complaint statuses.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Check whether an actor is permitted to forward or escalate a complaint
 */
export function canForwardOrEscalate(role: Role): boolean {
  return [
    'DSW',
    'HALL_STAFF',
    'DEPT_STAFF',
    'STAFF',
    'DEPT_ADMIN',
    'SRGC',
    'CHAIRMAN',
    'MANAGEMENT',
  ].includes(role);
}

/**
 * Human-readable stakeholder role title
 */
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case 'STUDENT':
      return 'Student';
    case 'DSW':
      return 'DSW / Welfare Staff';
    case 'HALL_STAFF':
      return 'Hall Provost / Warden';
    case 'DEPT_STAFF':
      return 'Department Administrative Staff';
    case 'FACULTY':
      return 'Professor / Teacher';
    case 'SRGC':
      return 'SRGC / Student Grievance Cell';
    case 'MANAGEMENT':
      return 'University Management';
    case 'CHAIRMAN':
      return 'Department Chairman';
    case 'IT_ADMIN':
      return 'IT / System Administrator';
    case 'STAFF':
      return 'Staff Member';
    case 'DEPT_ADMIN':
      return 'Department Administrator';
    case 'ADMIN':
      return 'Central Administrator';
    default:
      return role;
  }
}

/**
 * Human-readable workspace badge for the sidebar
 */
export function getRoleWorkspaceTitle(role: Role): string {
  switch (role) {
    case 'STUDENT':
      return 'Student Self-Service Portal';
    case 'DSW':
      return 'Student Welfare Management';
    case 'HALL_STAFF':
      return 'Hostel & Hall Administration';
    case 'DEPT_STAFF':
    case 'STAFF':
    case 'DEPT_ADMIN':
      return 'Department Administrative Desk';
    case 'FACULTY':
      return 'Faculty & Teacher Desk';
    case 'SRGC':
      return 'Grievance Redressal Cell';
    case 'MANAGEMENT':
      return 'Central University Management';
    case 'CHAIRMAN':
      return 'Departmental Oversight Desk';
    case 'IT_ADMIN':
    case 'ADMIN':
      return 'Technical System Administration';
    default:
      return 'Campus Portal';
  }
}
