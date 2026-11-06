import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './layouts/AppShell';

// Every page is split into its own chunk so the first load only ships what is on screen.
const page = <T extends Record<string, React.ComponentType>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] as React.ComponentType })));

const LoginPage = page(() => import('./pages/auth/LoginPage'), 'LoginPage');
const ForgotPasswordPage = page(() => import('./pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');

const StudentDashboardPage = page(() => import('./pages/student/StudentDashboardPage'), 'StudentDashboardPage');
const ServicesPage = page(() => import('./pages/student/services/ServicesPage'), 'ServicesPage');
const ServiceDetailPage = page(() => import('./pages/student/services/ServiceDetailPage'), 'ServiceDetailPage');
const DocumentsPage = page(() => import('./pages/student/DocumentsPage'), 'DocumentsPage');
const StudentComplaintsPage = page(() => import('./pages/student/StudentComplaintsPage'), 'StudentComplaintsPage');
const CreateComplaintPage = page(() => import('./pages/student/CreateComplaintPage'), 'CreateComplaintPage');
const ComplaintDetailPage = page(() => import('./pages/student/ComplaintDetailPage'), 'ComplaintDetailPage');
const StudentRequestsPage = page(() => import('./pages/student/StudentRequestsPage'), 'StudentRequestsPage');
const CreateRequestPage = page(() => import('./pages/student/CreateRequestPage'), 'CreateRequestPage');
const RequestDetailPage = page(() => import('./pages/student/RequestDetailPage'), 'RequestDetailPage');
const NoticesPage = page(() => import('./pages/student/NoticesPage'), 'NoticesPage');
const NotificationsPage = page(() => import('./pages/student/NotificationsPage'), 'NotificationsPage');
const StudentProfilePage = page(() => import('./pages/student/StudentProfilePage'), 'StudentProfilePage');

const StaffDashboardPage = page(() => import('./pages/staff/StaffDashboardPage'), 'StaffDashboardPage');
const StaffCasesPage = page(() => import('./pages/staff/StaffCasesPage'), 'StaffCasesPage');
const StaffCaseDetailPage = page(() => import('./pages/staff/StaffCaseDetailPage'), 'StaffCaseDetailPage');
const FacultyProfilePage = page(() => import('./pages/staff/FacultyProfilePage'), 'FacultyProfilePage');

const AdminDashboardPage = page(() => import('./pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminComplaintsPage = page(() => import('./pages/admin/AdminComplaintsPage'), 'AdminComplaintsPage');
const AdminRequestsPage = page(() => import('./pages/admin/AdminRequestsPage'), 'AdminRequestsPage');
const AdminUsersPage = page(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminDepartmentsPage = page(() => import('./pages/admin/AdminDepartmentsPage'), 'AdminDepartmentsPage');
const AdminNoticesPage = page(() => import('./pages/admin/AdminNoticesPage'), 'AdminNoticesPage');
const AdminAuditLogsPage = page(() => import('./pages/admin/AdminAuditLogsPage'), 'AdminAuditLogsPage');

const ADMIN_ROLES = ['ADMIN', 'IT_ADMIN', 'UNIVERSITY_MGMT', 'MANAGEMENT', 'CHAIRMAN'];
const STAFF_ROLES = ['STAFF', 'DEPT_ADMIN', 'DSW', 'HALL_STAFF', 'DEPT_STAFF', 'FACULTY', 'SRGC'];

const RoleHomeRedirect: React.FC = () => {
  const { role, currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && ADMIN_ROLES.includes(role)) return <Navigate to="/admin" replace />;
  if (role && STAFF_ROLES.includes(role)) return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
};

const FullPageLoader = () => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-campus-700 animate-spin" aria-label="Loading" />
  </div>
);

export const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/" element={<AppShell />}>
                <Route index element={<RoleHomeRedirect />} />

                <Route path="student" element={<StudentDashboardPage />} />
                <Route path="student/services" element={<ServicesPage />} />
                <Route path="student/services/:slug" element={<ServiceDetailPage />} />
                <Route path="student/documents" element={<DocumentsPage />} />
                <Route path="student/complaints" element={<StudentComplaintsPage />} />
                <Route path="student/complaints/new" element={<CreateComplaintPage />} />
                <Route path="student/complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="student/requests" element={<StudentRequestsPage />} />
                <Route path="student/requests/new" element={<CreateRequestPage />} />
                <Route path="student/requests/:id" element={<RequestDetailPage />} />
                <Route path="student/notices" element={<NoticesPage />} />
                <Route path="student/notifications" element={<NotificationsPage />} />
                <Route path="student/profile" element={<StudentProfilePage />} />

                <Route path="staff" element={<StaffDashboardPage />} />
                <Route path="staff/cases" element={<StaffCasesPage />} />
                <Route path="staff/cases/:id" element={<StaffCaseDetailPage />} />
                <Route path="staff/profile" element={<FacultyProfilePage />} />

                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/complaints" element={<AdminComplaintsPage />} />
                <Route path="admin/requests" element={<AdminRequestsPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/departments" element={<AdminDepartmentsPage />} />
                <Route path="admin/services" element={<AdminDepartmentsPage />} />
                <Route path="admin/notices" element={<AdminNoticesPage />} />
                <Route path="admin/audit-logs" element={<AdminAuditLogsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
