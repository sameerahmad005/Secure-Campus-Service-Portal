import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { DevNoticeBanner } from '../components/common/DevNoticeBanner';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Development Disclaimer Banner */}
      <DevNoticeBanner />

      {/* Main Institutional Header (full-width) */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Edge-to-Edge Portal Workspace: Persistent Sidebar + Flexible Main Content */}
      <div className="flex-1 flex w-full">
        {/* Persistent Desktop Sidebar / Collapsible Mobile Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content: Uses 100% of remaining viewport width without artificial max-width constraints */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
