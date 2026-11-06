import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { useAuth } from '../context/AuthContext';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { role } = useAuth();
  const showTabBar = role === 'STUDENT' && pathname.startsWith('/student');

  // Close the drawer and return to the top on every navigation.
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  // Lock background scroll and allow Escape while the mobile drawer is open.
  useEffect(() => {
    if (!isSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:shadow-lg"
      >
        Skip to content
      </a>

      <Header onToggleSidebar={() => setIsSidebarOpen((o) => !o)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main id="main" className={`flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 ${showTabBar ? 'pb-24 lg:pb-8' : ''}`}>
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<PageSkeleton />}>
              <div key={pathname} className="animate-fade-in">
                <Outlet />
              </div>
            </Suspense>
          </div>
        </main>
      </div>

      {showTabBar && <MobileTabBar />}
    </div>
  );
};
