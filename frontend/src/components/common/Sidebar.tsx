import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { getRoleWorkspaceTitle } from '../../utils/permissions';
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  FolderPlus,
  BellRing,
  User,
  ShieldAlert,
  ClipboardList,
  Users,
  Building,
  History,
  FileCheck,
  AlertTriangle,
  HeartHandshake,
  Home,
  GraduationCap,
  Scale,
  BarChart3,
  Settings,
  LayoutGrid,
  FolderOpen,
  X,
  Building2,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

export interface NavGroup {
  id: string;
  groupTitle?: string;
  items: NavItem[];
}

/**
 * Determines whether a navigation item is active based on current pathname and search params.
 * Avoids broad substring checks (like pathname.includes('complaint')) to guarantee that
 * only the specific matching item is active.
 */
export const isNavItemActive = (
  item: NavItem,
  currentPath: string,
  currentSearch: string,
  allRoleItems: NavItem[]
): boolean => {
  const [itemPath, itemQuery = ''] = item.to.split('?');

  // 1. Items with query parameters (e.g. /staff/cases?status=SUBMITTED)
  if (itemQuery) {
    if (currentPath !== itemPath) return false;
    const itemParams = new URLSearchParams(itemQuery);
    const currentParams = new URLSearchParams(currentSearch);
    let allParamsMatch = true;
    itemParams.forEach((val, key) => {
      if (currentParams.get(key) !== val) {
        allParamsMatch = false;
      }
    });
    return allParamsMatch;
  }

  // 2. Base items on paths where siblings have query parameters (e.g. /staff/cases)
  const siblingWithQuery = allRoleItems.some((other) => {
    if (other.id === item.id) return false;
    const [otherPath, otherQuery] = other.to.split('?');
    return otherPath === itemPath && Boolean(otherQuery);
  });

  if (siblingWithQuery) {
    // If viewing detail subpath (e.g. /staff/cases/CMP-01), the base queue item is active
    if (currentPath.startsWith(`${itemPath}/`)) {
      return true;
    }

    if (currentPath !== itemPath) {
      return false;
    }

    // Check if any query sibling currently matches
    const currentParams = new URLSearchParams(currentSearch);
    const anySiblingMatches = allRoleItems.some((other) => {
      if (other.id === item.id) return false;
      const [otherPath, otherQuery] = other.to.split('?');
      if (otherPath !== itemPath || !otherQuery) return false;
      const otherParams = new URLSearchParams(otherQuery);
      let matches = true;
      otherParams.forEach((v, k) => {
        if (currentParams.get(k) !== v) {
          matches = false;
        }
      });
      return matches;
    });

    return !anySiblingMatches;
  }

  // 3. Exact matching requirement (e.g. root dashboards: /student, /staff, /admin)
  if (item.exact) {
    return currentPath === itemPath;
  }

  // 4. Exact path match
  if (currentPath === itemPath) {
    return true;
  }

  // 5. Detail subpath matching (e.g. /student/complaints/:id activates /student/complaints,
  //    but does NOT activate /student/complaints/new because /student/complaints/new has its own NavItem)
  if (currentPath.startsWith(`${itemPath}/`)) {
    const hasMoreSpecificItem = allRoleItems.some((other) => {
      const otherBase = other.to.split('?')[0];
      return otherBase === currentPath;
    });
    return !hasMoreSpecificItem;
  }

  return false;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, switchRole, resetMockData } = useAuth();
  const location = useLocation();

  const navGroups: NavGroup[] = useMemo(() => {
    switch (role) {
      case 'DSW':
        return [
          {
            id: 'dsw-main',
            items: [
              { id: 'dsw-dashboard', to: '/staff', label: 'Welfare Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'dsw-cases',
            groupTitle: 'WELFARE CASES',
            items: [
              { id: 'dsw-assigned', to: '/staff/cases?filter=assigned', label: 'Assigned Complaints', icon: ClipboardList },
              { id: 'dsw-welfare', to: '/staff/cases?category=WELFARE_GRIEVANCE', label: 'Welfare Cases', icon: HeartHandshake },
              { id: 'dsw-queue', to: '/staff/cases', label: 'Status Updates & Queue', icon: FileText },
              { id: 'dsw-reports', to: '/admin/departments', label: 'Welfare Reports', icon: BarChart3 },
            ],
          },
          {
            id: 'dsw-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'dsw-notices', to: '/student/notices', label: 'Campus Notices', icon: FileCheck },
              { id: 'dsw-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            id: 'dsw-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'dsw-profile', to: '/student/profile', label: 'Welfare Officer Profile', icon: User },
            ],
          },
        ];

      case 'HALL_STAFF':
        return [
          {
            id: 'hall-main',
            items: [
              { id: 'hall-dashboard', to: '/staff', label: 'Hall Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'hall-cases',
            groupTitle: 'RESIDENTIAL SERVICES',
            items: [
              { id: 'hall-complaints', to: '/staff/cases?category=HOSTEL', label: 'Hall Complaints', icon: Home },
              { id: 'hall-requests', to: '/admin/requests', label: 'Room-related Requests', icon: FileCheck2 },
              { id: 'hall-queue', to: '/staff/cases', label: 'Update Status & Remarks', icon: ClipboardList },
            ],
          },
          {
            id: 'hall-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'hall-notices', to: '/student/notices', label: 'Hall Notices', icon: FileCheck },
              { id: 'hall-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            id: 'hall-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'hall-profile', to: '/student/profile', label: 'Hall Staff Profile', icon: User },
            ],
          },
        ];

      case 'DEPT_STAFF':
      case 'STAFF':
      case 'DEPT_ADMIN':
        return [
          {
            id: 'dept-main',
            items: [
              { id: 'dept-dashboard', to: '/staff', label: 'Department Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'dept-cases',
            groupTitle: 'DEPARTMENT QUEUE',
            items: [
              { id: 'dept-assigned', to: '/staff/cases?filter=assigned', label: 'Assigned Complaints', icon: ClipboardList },
              { id: 'dept-requests', to: '/admin/requests', label: 'Department Requests', icon: FileCheck2 },
              { id: 'dept-submitted', to: '/staff/cases?status=SUBMITTED', label: 'Pending Cases', icon: FileText },
              { id: 'dept-in-progress', to: '/staff/cases?status=UNDER_REVIEW', label: 'In-progress Cases', icon: ClipboardList },
              { id: 'dept-resolved', to: '/staff/cases?status=RESOLVED', label: 'Resolved Cases', icon: FileCheck },
            ],
          },
          {
            id: 'dept-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'dept-notices', to: '/student/notices', label: 'Campus Notices', icon: FileCheck },
              { id: 'dept-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            id: 'dept-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'dept-profile', to: '/student/profile', label: 'Staff Profile', icon: User },
            ],
          },
        ];

      case 'FACULTY':
        return [
          {
            id: 'fac-main',
            items: [
              { id: 'fac-dashboard', to: '/staff', label: 'Faculty Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'fac-cases',
            groupTitle: 'TEACHING & GRIEVANCES',
            items: [
              { id: 'fac-assigned', to: '/staff/cases?filter=assigned', label: 'Assigned Cases (Attendance)', icon: GraduationCap },
              { id: 'fac-submit-complaint', to: '/student/complaints/new', label: 'Submit Staff Complaint', icon: FolderPlus },
              { id: 'fac-my-complaints', to: '/student/complaints', label: 'My Complaints', icon: FileText },
              { id: 'fac-feedback-queue', to: '/staff/cases', label: 'Provide Feedback Queue', icon: FileCheck },
            ],
          },
          {
            id: 'fac-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'fac-notices', to: '/student/notices', label: 'Academic Notices', icon: FileCheck },
              { id: 'fac-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            id: 'fac-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'fac-profile', to: '/staff/profile', label: 'Faculty Profile', icon: User },
            ],
          },
        ];

      case 'SRGC':
        return [
          {
            id: 'srgc-main',
            items: [
              { id: 'srgc-dashboard', to: '/staff', label: 'Grievance Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'srgc-cases',
            groupTitle: 'STUDENT GRIEVANCES',
            items: [
              { id: 'srgc-all', to: '/staff/cases?category=WELFARE_GRIEVANCE', label: 'Student Grievances', icon: Scale },
              { id: 'srgc-review', to: '/staff/cases?status=UNDER_REVIEW', label: 'Review & Forward Cases', icon: ClipboardList },
              { id: 'srgc-escalated', to: '/staff/cases?status=ESCALATED', label: 'Escalations Review', icon: AlertTriangle },
              { id: 'srgc-resolved', to: '/staff/cases?status=RESOLVED', label: 'Resolution Monitoring', icon: FileCheck },
              { id: 'srgc-reports', to: '/admin/departments', label: 'Grievance Reports', icon: BarChart3 },
            ],
          },
          {
            id: 'srgc-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'srgc-notices', to: '/student/notices', label: 'Official Notices', icon: FileCheck },
              { id: 'srgc-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            id: 'srgc-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'srgc-profile', to: '/student/profile', label: 'Grievance Cell Profile', icon: User },
            ],
          },
        ];

      case 'MANAGEMENT':
      case 'UNIVERSITY_MGMT':
        return [
          {
            id: 'mgmt-main',
            items: [
              { id: 'mgmt-dashboard', to: '/admin', label: 'Campus-wide Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'mgmt-oversight',
            groupTitle: 'EXECUTIVE OVERSIGHT',
            items: [
              { id: 'mgmt-reports', to: '/admin/departments', label: 'Department-wise Reports', icon: BarChart3 },
              { id: 'mgmt-pending', to: '/admin/complaints?filter=pending', label: 'Pending & Overdue Cases', icon: AlertTriangle },
              { id: 'mgmt-escalations', to: '/admin/complaints?status=ESCALATED', label: 'Campus Escalations', icon: ShieldAlert },
              { id: 'mgmt-monitoring', to: '/admin/complaints', label: 'Performance Monitoring', icon: FileText },
            ],
          },
          {
            id: 'mgmt-comm',
            groupTitle: 'COMMUNICATION & AUDIT',
            items: [
              { id: 'mgmt-notices', to: '/admin/notices', label: 'Notice Publisher', icon: FileCheck },
              { id: 'mgmt-audit', to: '/admin/audit-logs', label: 'Audit Log Records', icon: History },
            ],
          },
          {
            id: 'mgmt-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'mgmt-profile', to: '/student/profile', label: 'Executive Profile', icon: User },
            ],
          },
        ];

      case 'CHAIRMAN':
        return [
          {
            id: 'chair-main',
            items: [
              { id: 'chair-dashboard', to: '/admin', label: 'Oversight Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'chair-oversight',
            groupTitle: 'DEPARTMENTAL OVERSIGHT',
            items: [
              { id: 'chair-complaints', to: '/admin/complaints', label: 'Campus-wide Complaints', icon: FileText },
              { id: 'chair-overdue', to: '/admin/complaints?filter=unresolved', label: 'Unresolved / Overdue Cases', icon: AlertTriangle },
              { id: 'chair-escalations', to: '/admin/complaints?status=ESCALATED', label: 'Escalations Review', icon: ShieldAlert },
              { id: 'chair-reports', to: '/admin/departments', label: 'Department Reports', icon: BarChart3 },
            ],
          },
          {
            id: 'chair-info',
            groupTitle: 'INFORMATION',
            items: [
              { id: 'chair-notices', to: '/admin/notices', label: 'Department Notices', icon: FileCheck },
            ],
          },
          {
            id: 'chair-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'chair-profile', to: '/student/profile', label: 'Chairman Profile', icon: User },
            ],
          },
        ];

      case 'IT_ADMIN':
      case 'ADMIN':
        return [
          {
            id: 'it-main',
            items: [
              { id: 'it-dashboard', to: '/admin', label: 'System Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            id: 'it-admin',
            groupTitle: 'SYSTEM ADMINISTRATION',
            items: [
              { id: 'it-users', to: '/admin/users', label: 'User Directory', icon: Users },
              { id: 'it-config', to: '/admin/departments', label: 'System Configuration', icon: Settings },
              { id: 'it-support', to: '/admin/complaints?category=IT_NETWORK', label: 'Technical Support Issues', icon: FileText },
              { id: 'it-audit', to: '/admin/audit-logs', label: 'Security Audit Logs', icon: History },
            ],
          },
          {
            id: 'it-comm',
            groupTitle: 'COMMUNICATION',
            items: [
              { id: 'it-notices', to: '/admin/notices', label: 'System Notices', icon: FileCheck },
            ],
          },
          {
            id: 'it-account',
            groupTitle: 'ACCOUNT',
            items: [
              { id: 'it-profile', to: '/student/profile', label: 'IT Admin Profile', icon: User },
            ],
          },
        ];

      case 'STUDENT':
      default:
        return [
          {
            id: 'student-main',
            items: [
              { id: 'student-dashboard', to: '/student', label: 'Home', icon: LayoutDashboard, exact: true },
              { id: 'student-services', to: '/student/services', label: 'Services', icon: LayoutGrid },
              { id: 'student-documents', to: '/student/documents', label: 'Documents', icon: FolderOpen },
            ],
          },
          {
            id: 'student-tracking',
            groupTitle: 'Track',
            items: [
              { id: 'student-my-requests', to: '/student/requests', label: 'My requests', icon: FileCheck2 },
              { id: 'student-new-complaint', to: '/student/complaints/new', label: 'File a grievance', icon: AlertTriangle, exact: true },
              { id: 'student-my-complaints', to: '/student/complaints', label: 'My grievances', icon: FileText },
            ],
          },
          {
            id: 'student-info',
            groupTitle: 'Campus',
            items: [
              { id: 'student-notices', to: '/student/notices', label: 'Notices', icon: FileCheck },
              { id: 'student-notifications', to: '/student/notifications', label: 'Notifications', icon: BellRing },
              { id: 'student-profile', to: '/student/profile', label: 'Profile', icon: User },
            ],
          },
        ];
    }
  }, [role]);

  // Flatten all navigation items for sibling comparison and exactness checks
  const allRoleItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );

  const STAKEHOLDER_ROLES: Array<{ role: Role; label: string }> = [
    { role: 'STUDENT', label: 'Student' },
    { role: 'DSW', label: 'DSW staff' },
    { role: 'HALL_STAFF', label: 'Hall staff' },
    { role: 'DEPT_STAFF', label: 'Department staff' },
    { role: 'FACULTY', label: 'Faculty' },
    { role: 'SRGC', label: 'Grievance cell' },
    { role: 'MANAGEMENT', label: 'Management' },
    { role: 'CHAIRMAN', label: 'Chairman' },
    { role: 'IT_ADMIN', label: 'IT admin' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sticky sidebar on desktop, slide-in drawer on mobile */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed lg:sticky top-0 lg:top-14 left-0 z-50 lg:z-10 h-[100dvh] lg:h-[calc(100dvh-3.5rem)] w-[85vw] max-w-72 lg:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Drawer header (mobile only) */}
        <div className="lg:hidden h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-campus-950 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-campus-200" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">AMU Campus Services</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto overscroll-contain">
          <div className="px-5 mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {role ? getRoleWorkspaceTitle(role) : 'Portal'}
            </span>
          </div>

          <nav className="space-y-5 px-3" aria-label="Portal navigation">
            {navGroups.map((group) => (
              <div key={group.id} className="space-y-0.5">
                {group.groupTitle && (
                  <div className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2.5 pb-1 select-none lowercase first-letter:uppercase">
                    {group.groupTitle}
                  </div>
                )}
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = isNavItemActive(item, location.pathname, location.search, allRoleItems);
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      onClick={() => onClose()}
                      aria-current={isActive ? 'page' : undefined}
                      style={isOpen ? { animationDelay: `${Math.min(idx * 40, 200)}ms` } : undefined}
                      className={`relative flex items-center gap-3 px-2.5 h-11 lg:h-9 text-sm rounded-lg transition-colors duration-200 ${
                        isOpen ? 'max-lg:animate-fade-up' : ''
                      } ${
                        isActive
                          ? 'bg-campus-50 dark:bg-slate-800 text-campus-950 dark:text-white font-medium'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-campus-700 dark:bg-campus-400" />}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-campus-700 dark:text-campus-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Demo persona switcher so reviewers can see each stakeholder's view */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <label htmlFor="persona-switch" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
            View as
          </label>
          <div className="flex gap-2">
            <select
              id="persona-switch"
              value={role || 'STUDENT'}
              onChange={(e) => switchRole(e.target.value as Role)}
              className="field h-9 py-0 text-sm"
            >
              {STAKEHOLDER_ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetMockData}
              title="Reset sample data"
              aria-label="Reset sample data"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
