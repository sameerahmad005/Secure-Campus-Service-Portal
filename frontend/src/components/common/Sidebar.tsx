import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  groupTitle?: string;
  items: Array<{
    to: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'STAFF':
      case 'DEPT_ADMIN':
        return [
          {
            items: [
              { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            groupTitle: 'CASE MANAGEMENT',
            items: [
              { to: '/staff/cases', label: 'Assigned Cases Queue', icon: ClipboardList },
            ],
          },
          {
            groupTitle: 'INFORMATION',
            items: [
              { to: '/student/notices', label: 'Campus Notices', icon: FileCheck },
              { to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            groupTitle: 'ACCOUNT',
            items: [
              { to: '/student/profile', label: 'Staff Profile', icon: User },
            ],
          },
        ];
      case 'ADMIN':
        return [
          {
            items: [
              { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            groupTitle: 'WORKFLOW OVERSIGHT',
            items: [
              { to: '/admin/complaints', label: 'Complaints', icon: FileText },
              { to: '/admin/requests', label: 'Service Requests', icon: FileCheck2 },
            ],
          },
          {
            groupTitle: 'ORGANIZATION & USERS',
            items: [
              { to: '/admin/users', label: 'User Directory', icon: Users },
              { to: '/admin/departments', label: 'Departments & Services', icon: Building },
            ],
          },
          {
            groupTitle: 'COMMUNICATION & AUDIT',
            items: [
              { to: '/admin/notices', label: 'Notice Publisher', icon: FileCheck },
              { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: History },
            ],
          },
          {
            groupTitle: 'ACCOUNT',
            items: [
              { to: '/student/profile', label: 'Admin Profile', icon: User },
            ],
          },
        ];
      case 'STUDENT':
      default:
        return [
          {
            items: [
              { to: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
            ],
          },
          {
            groupTitle: 'SERVICES',
            items: [
              { to: '/student/complaints', label: 'Complaints', icon: FileText },
              { to: '/student/requests', label: 'Service Requests', icon: FileCheck2 },
              { to: '/student/requests/new', label: 'Available Services', icon: FolderPlus },
            ],
          },
          {
            groupTitle: 'INFORMATION',
            items: [
              { to: '/student/notices', label: 'Notices', icon: FileCheck },
              { to: '/student/notifications', label: 'Notifications', icon: BellRing },
            ],
          },
          {
            groupTitle: 'ACCOUNT',
            items: [
              { to: '/student/profile', label: 'Profile', icon: User },
            ],
          },
        ];
    }
  };

  const navGroups = getNavGroups();

  return (
    <>
      {/* Off-canvas mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Persistent Desktop Sidebar (250px) / Slide-over Mobile Drawer */}
      <aside
        className={`w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
          isOpen
            ? 'fixed inset-y-0 left-0 translate-x-0 shadow-lg'
            : 'hidden lg:flex static translate-x-0'
        }`}
      >
        <div className="py-4 overflow-y-auto">
          {/* Active Workspace Tag */}
          <div className="px-5 mb-4">
            <span className="text-[10px] font-bold text-campus-950 bg-slate-100 border border-slate-200 uppercase tracking-wider px-2 py-0.5 rounded block text-center font-mono">
              {role === 'ADMIN'
                ? 'Central Administrator'
                : role === 'STAFF' || role === 'DEPT_ADMIN'
                ? 'Department Staff Portal'
                : 'Student Self-Service'}
            </span>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="space-y-4 px-3">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-0.5">
                {group.groupTitle && (
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2 py-1 select-none">
                    {group.groupTitle}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded transition-colors ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-campus-900 pl-2'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Prototype Quick Role Switcher Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 text-[11px]">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">Prototype Views</span>
            <ShieldAlert className="w-3 h-3 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <NavLink
              to="/student"
              className="text-center py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
            >
              Student
            </NavLink>
            <NavLink
              to="/staff"
              className="text-center py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
            >
              Staff
            </NavLink>
            <NavLink
              to="/admin"
              className="text-center py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
            >
              Admin
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
