import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './layouts/AppShell';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentComplaintsPage } from './pages/student/StudentComplaintsPage';
import { CreateComplaintPage } from './pages/student/CreateComplaintPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { StudentRequestsPage } from './pages/student/StudentRequestsPage';
import { CreateRequestPage } from './pages/student/CreateRequestPage';
import { RequestDetailPage } from './pages/student/RequestDetailPage';
import { NoticesPage } from './pages/student/NoticesPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffCasesPage } from './pages/staff/StaffCasesPage';
import { StaffCaseDetailPage } from './pages/staff/StaffCaseDetailPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Smart Role Redirect Component
const RoleHomeRedirect: React.FC = () => {
  const { role, currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'STAFF' || role === 'DEPT_ADMIN') return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated Portal Shell */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<RoleHomeRedirect />} />

            {/* Student Portal Routes */}
            <Route path="student" element={<StudentDashboardPage />} />
            <Route path="student/complaints" element={<StudentComplaintsPage />} />
            <Route path="student/complaints/new" element={<CreateComplaintPage />} />
            <Route path="student/complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="student/requests" element={<StudentRequestsPage />} />
            <Route path="student/requests/new" element={<CreateRequestPage />} />
            <Route path="student/requests/:id" element={<RequestDetailPage />} />
            <Route path="student/notices" element={<NoticesPage />} />
            <Route path="student/notifications" element={<NotificationsPage />} />
            <Route path="student/profile" element={<StudentProfilePage />} />

            {/* Department Staff Portal Routes */}
            <Route path="staff" element={<StaffDashboardPage />} />
            <Route path="staff/cases" element={<StaffCasesPage />} />
            <Route path="staff/cases/:id" element={<StaffCaseDetailPage />} />

            {/* Admin Portal Routes */}
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="admin/requests" element={<AdminRequestsPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="admin/services" element={<AdminDepartmentsPage />} />
            <Route path="admin/notices" element={<AdminNoticesPage />} />
            <Route path="admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
