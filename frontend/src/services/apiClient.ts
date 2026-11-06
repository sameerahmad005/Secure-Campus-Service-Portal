/**
 * Secure Campus Service Portal - Centralized Typed Backend API Client
 * Connects the React frontend to the Node.js / Express backend API (v1).
 * Never exposes Supabase credentials or database connections to the browser bundle.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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

export interface ApiCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface ApiSubcategory {
  id: string;
  category_id: string;
  name: string;
  target_department_id?: string;
  sla_days: number;
  default_priority: string;
  form_schema?: Record<string, any>;
  is_active: boolean;
}

class ApiClient {
  private getHeaders(userEmail?: string, userRole?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }
    if (userRole) {
      headers['x-demo-role'] = userRole;
    }

    return headers;
  }

  // Check backend health
  async checkHealth(): Promise<{ status: string; database: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Student Profile
  async getStudentProfile(email: string = 'student.tariq@amu.ac.in'): Promise<StudentAcademicRecord> {
    const res = await fetch(`${API_BASE_URL}/students/profile`, {
      headers: this.getHeaders(email, 'STUDENT'),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch student profile');
    }

    const json = await res.json();
    return json.data;
  }

  async updateStudentProfile(
    data: { mobileNumber?: string; address?: string },
    email: string = 'student.tariq@amu.ac.in'
  ): Promise<{ mobileNumber?: string; address?: string }> {
    const res = await fetch(`${API_BASE_URL}/students/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(email, 'STUDENT'),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to update student profile');
    }

    const json = await res.json();
    return json.data;
  }

  // Faculty Profile
  async getFacultyProfile(email: string = 'staff.cc@amu.ac.in'): Promise<FacultyAcademicRecord> {
    const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
      headers: this.getHeaders(email, 'FACULTY'),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch faculty profile');
    }

    const json = await res.json();
    return json.data;
  }

  async updateFacultyProfile(
    data: { mobileNumber?: string },
    email: string = 'staff.cc@amu.ac.in'
  ): Promise<{ mobileNumber?: string }> {
    const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(email, 'FACULTY'),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to update faculty profile');
    }

    const json = await res.json();
    return json.data;
  }

  // Service Catalog
  async getCategories(): Promise<ApiCategory[]> {
    const res = await fetch(`${API_BASE_URL}/catalog/categories`);
    if (!res.ok) throw new Error('Failed to fetch service categories');
    const json = await res.json();
    return json.data;
  }

  async getSubcategories(categoryId?: string): Promise<ApiSubcategory[]> {
    const url = categoryId
      ? `${API_BASE_URL}/catalog/subcategories?categoryId=${categoryId}`
      : `${API_BASE_URL}/catalog/subcategories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch service subcategories');
    const json = await res.json();
    return json.data;
  }

  // Complaints
  async getComplaints(email: string, role: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      headers: this.getHeaders(email, role),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch complaints');
    }
    const json = await res.json();
    return json.data;
  }

  async getComplaintById(id: string, email: string, role: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: this.getHeaders(email, role),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch complaint details');
    }
    const json = await res.json();
    return json.data;
  }

  async createComplaint(payload: any, email: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: this.getHeaders(email, 'STUDENT'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to submit complaint');
    }
    const json = await res.json();
    return json.data;
  }

  // Service Requests
  async getRequests(email: string, role: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      headers: this.getHeaders(email, role),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch service requests');
    }
    const json = await res.json();
    return json.data;
  }

  async createRequest(payload: any, email: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: this.getHeaders(email, 'STUDENT'),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to submit service request');
    }
    const json = await res.json();
    return json.data;
  }
}

export const apiClient = new ApiClient();
