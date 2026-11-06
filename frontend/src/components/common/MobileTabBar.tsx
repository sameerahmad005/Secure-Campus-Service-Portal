import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, FolderOpen, FileCheck2, User } from 'lucide-react';

const TABS = [
  { to: '/student', label: 'Home', icon: Home, end: true },
  { to: '/student/services', label: 'Services', icon: LayoutGrid, end: false },
  { to: '/student/documents', label: 'Documents', icon: FolderOpen, end: false },
  { to: '/student/requests', label: 'Requests', icon: FileCheck2, end: false },
  { to: '/student/profile', label: 'Profile', icon: User, end: false },
];

/** Bottom navigation for students on phones and small tablets. */
export const MobileTabBar: React.FC = () => (
  <nav
    aria-label="Quick navigation"
    className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
  >
    <ul className="grid grid-cols-5">
      {TABS.map((t) => (
        <li key={t.to}>
          <NavLink
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 h-16 text-xs transition-colors duration-200 active:scale-95 ${
                isActive ? 'text-campus-700 dark:text-campus-400 font-medium' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-300 ${isActive ? 'bg-campus-50 dark:bg-slate-800' : ''}`}>
                  <t.icon className="w-5 h-5" />
                </span>
                {t.label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
