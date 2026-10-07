import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  LogOut,
  Building2,
  CheckCheck,
} from 'lucide-react';
import { notificationService } from '../../services';
import type { Notification } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      notificationService.getNotifications(currentUser.id).then(setNotifications);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (currentUser) {
      await notificationService.markAllAsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-campus-950 text-white border-b border-campus-900 sticky top-0 z-30 shadow-xs">
      {/* Full-width container across entire viewport */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md hover:bg-campus-900 text-slate-300 hover:text-white lg:hidden focus:outline-none focus:ring-2 focus:ring-campus-400"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center text-campus-200">
              <Building2 className="w-4 h-4 text-campus-300" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Secure Campus Service Portal
                <span className="hidden sm:inline-block text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded bg-campus-800 text-campus-200 border border-campus-700">
                  Prototype
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium tracking-wide">
                Aligarh Muslim University
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications Flyout */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-campus-900 focus:outline-none focus:ring-2 focus:ring-campus-400"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-[9px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-campus-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-900">
                    Notifications ({notifications.length})
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-campus-700 hover:text-campus-900 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 hover:bg-slate-50 transition-colors text-xs ${
                          !n.isRead ? 'bg-sky-50/50 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate(currentUser?.role === 'STUDENT' ? '/student/notifications' : '#');
                    }}
                    className="text-xs font-medium text-campus-700 hover:text-campus-900"
                  >
                    View notification center →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Overview */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-campus-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  {currentUser.role.replace('_', ' ')}
                  {currentUser.departmentName ? ` • ${currentUser.departmentName}` : ''}
                </div>
              </div>

              <div className="w-7 h-7 rounded bg-campus-800 border border-campus-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-campus-200">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>

              <button
                onClick={handleLogout}
                title="Sign out of current mock session"
                className="p-1.5 text-slate-300 hover:text-rose-300 hover:bg-campus-900 rounded transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
