/**
 * Secure Campus Service Portal - Service, Category, Subcategory & Form Schema Architecture
 * 
 * SOURCING RULE (STAKEHOLDER ANALYSIS):
 * - Fields, statuses, and options marked VERIFIED_ANALYSIS are sourced directly from `Stakeholder.pdf`.
 * - Categories, subcategories, and routing rules marked PROPOSED are configurable design proposals
 *   for AMU workflows and must NOT be claimed as approved institutional policy without verification.
 */

export type VerificationStatus = 'VERIFIED_ANALYSIS' | 'PROPOSED' | 'UNVERIFIED';

export type RequesterType = 'STUDENT' | 'FACULTY' | 'STAFF';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'file';

export interface FormFieldSchema {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  readOnly?: boolean;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldSchema[];
  status: VerificationStatus;
}

export interface RoutingRule {
  targetDepartmentId?: string;
  targetDepartmentName?: string;
  targetUnitType:
    | 'DEPARTMENT'
    | 'HALL'
    | 'WELFARE'
    | 'GRIEVANCE_CELL'
    | 'FACULTY'
    | 'MANAGEMENT'
    | 'IT_ADMIN';
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  slaDaysProposed: number;
}

export interface SubcategoryConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  status: VerificationStatus;
  formSchema?: FormSchema;
  routingRule: RoutingRule;
  allowedOptions?: string[];
}

export interface CategoryConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  status: VerificationStatus;
  subcategories: SubcategoryConfig[];
}

export interface CampusServiceConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  isEnabled: boolean;
  supportedRequesterTypes: RequesterType[];
  type: 'COMPLAINT' | 'SERVICE_REQUEST';
  status: VerificationStatus;
  categories: CategoryConfig[];
}

/**
 * Attendance-specific complaint types documented in Stakeholder.pdf (Page 4)
 */
export const ATTENDANCE_COMPLAINT_TYPES = [
  'Incorrect Absent Marking',
  'Attendance Not Updated',
  'Attendance Shortage Dispute',
  'Attendance Record Mismatch',
  'Other',
] as const;

export type AttendanceComplaintType = (typeof ATTENDANCE_COMPLAINT_TYPES)[number];

/**
 * Recorded attendance status options documented in Stakeholder.pdf (Page 4)
 */
export const RECORDED_ATTENDANCE_STATUSES = [
  'Marked Absent',
  'Present but Not Updated',
  'Incorrect Percentage',
] as const;

export type RecordedAttendanceStatus = (typeof RECORDED_ATTENDANCE_STATUSES)[number];

/**
 * Specific typed payload for Attendance Complaint form per Stakeholder.pdf
 */
export interface AttendanceComplaintData {
  studentId: string;
  studentName: string;
  course: string;
  semester: string;
  department: string;
  subject: string;
  facultyName: string;
  complaintType: AttendanceComplaintType;
  dateOfAttendance: string;
  recordedAttendanceStatus: RecordedAttendanceStatus;
  description: string;
  supportingProofFileName?: string;
}
