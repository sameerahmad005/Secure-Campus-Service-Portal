import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, Building2, CheckCheck, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';
import type { Notification, User } from '../../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const roleLabel = (u: User): string => {
  switch (u.role) {
    case 'STUDENT':
      return u.studentId ? `Student · ${u.studentId}` : 'Student';
    case 'HALL_STAFF':
      return `Hall staff · ${u.hallName || 'Hall office'}`;
    case 'DSW':
      return 'Students’ welfare';
    case 'SRGC':
      return 'Grievance cell';
    case 'FACULTY':
      return `Faculty · ${u.departmentName || 'Department'}`;
    case 'CHAIRMAN':
      return `Chairman · ${u.departmentName || 'Department'}`;
    case 'MANAGEMENT':
    case 'UNIVERSITY_MGMT':
      return 'University management';
    case 'IT_ADMIN':
      return 'IT administrator';
    default:
      return u.departmentName || u.role.replace(/_/g, ' ').toLowerCase();
  }
};

const profilePath = (u: User) => (u.role === 'FACULTY' ? '/staff/profile' : '/student/profile');

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

const iconBtn =
  'relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200';

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useDismiss(notifOpen, () => setNotifOpen(false));
  const userRef = useDismiss(userOpen, () => setUserOpen(false));

  useEffect(() => {
    if (currentUser) notificationService.getNotifications(currentUser.id).then(setNotifications);
  }, [currentUser]);

  const unread = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-campus-950 text-white border-b border-white/5">
      <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`${iconBtn} lg:hidden`}
            aria-label="Open menu"
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 min-w-0 rounded-lg px-1 py-1">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-campus-200" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold truncate">Campus Services</div>
              <div className="text-xs text-slate-300 truncate hidden sm:block">Aligarh Muslim University</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((o) => !o);
                setUserOpen(false);
              }}
              className={iconBtn}
              aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
              aria-expanded={notifOpen}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 text-[10px] leading-4 font-semibold bg-rose-500 text-white rounded-full text-center ring-2 ring-campus-950">
                  {unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-14 sm:top-full sm:right-0 sm:mt-2 sm:w-96 origin-top-right animate-scale-in bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unread > 0 && (
                    <button type="button" onClick={markAllRead} className="text-sm text-campus-700 dark:text-campus-400 hover:underline inline-flex items-center gap-1">
                      <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">You are all caught up.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 text-sm ${!n.isRead ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-medium flex items-center gap-2">
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-campus-600 shrink-0" />}
                            {n.title}
                          </span>
                          <span className="text-xs text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/student/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block p-3 text-center text-sm font-medium text-campus-700 dark:text-campus-400 border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                >
                  See all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Account */}
          {currentUser && (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => {
                  setUserOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 h-10 pl-1 pr-1 sm:pr-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                aria-label="Account menu"
                aria-expanded={userOpen}
              >
                <span className="w-8 h-8 rounded-lg bg-campus-800 overflow-hidden flex items-center justify-center text-sm font-semibold text-campus-100">
                  {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </span>
                <span className="hidden md:block text-left leading-tight max-w-[180px]">
                  <span className="block text-sm font-medium truncate">{currentUser.name}</span>
                  <span className="block text-xs text-slate-300 truncate">{roleLabel(currentUser)}</span>
                </span>
                <ChevronDown className={`hidden md:block w-4 h-4 text-slate-300 transition-transform duration-300 ${userOpen ? 'rotate-180' : ''}`} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 origin-top-right animate-scale-in bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="text-sm font-medium truncate">{currentUser.name}</div>
                    <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  </div>
                  <div className="p-1">
                    <Link
                      to={profilePath(currentUser)}
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" /> Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
