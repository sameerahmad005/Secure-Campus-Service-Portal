export type RoleName = 
  | 'STUDENT' 
  | 'STAFF' 
  | 'FACULTY' 
  | 'DSW' 
  | 'HALL_STAFF' 
  | 'DEPT_STAFF' 
  | 'SRGC' 
  | 'MANAGEMENT' 
  | 'CHAIRMAN' 
  | 'IT_ADMIN';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  accountStatus: AccountStatus;
  roles: RoleName[];
  departmentId?: string | null;
  hallId?: string | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  enrollmentNumber: string;
  rollNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string | null;
  address?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  admissionYear: number;
  course: {
    id: string;
    code: string;
    name: string;
    totalSemesters: number;
    degreeLevel: string;
  };
  academicSession: {
    id: string;
    sessionName: string;
  };
  currentSemester: number;
  allottedHall?: {
    id: string;
    code: string;
    name: string;
  } | null;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  facultyNumber: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  fullName: string;
  email: string;
  mobileNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  appointmentType: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}
