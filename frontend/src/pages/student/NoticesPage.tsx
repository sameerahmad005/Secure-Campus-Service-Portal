import React, { useState, useEffect } from 'react';
import { noticeService } from '../../services';
import type { Notice } from '../../types';
import {
  FileText,
  Search,
  Pin,
  Calendar,
  Building,
  Tag,
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    noticeService.getNotices('ALL').then((list) => {
      setNotices(list);
      setIsLoading(false);
    });
  }, []);

  const filtered = notices.filter((n) => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.departmentName && n.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Campus Noticeboard & Official Circulars
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Announcements, maintenance schedules, academic alerts, and administrative guidelines
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search notices by keyword or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
        >
          <option value="ALL">All Categories</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="ACADEMIC">Academic</option>
          <option value="GENERAL">General</option>
          <option value="HOSTEL">Hostel</option>
          <option value="URGENT">Urgent Advisory</option>
        </select>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No notices match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for university circulars.</p>
          </div>
        ) : (
          filtered.map((notice) => (
            <article
              key={notice.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs transition-all space-y-3 ${
                notice.isPinned
                  ? 'border-campus-300 bg-campus-50/20 ring-1 ring-campus-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-campus-900 bg-campus-100 px-2 py-0.5 rounded border border-campus-300 uppercase tracking-wide">
                      <Pin className="w-3 h-3 text-campus-700 rotate-45" />
                      Pinned Bulletin
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Audience: <strong className="text-slate-700">{notice.targetAudience}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {notice.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {notice.content}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issued by: {notice.publishedByName} ({notice.publishedByRole.replace('_', ' ')})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Verified Institutional Bulletin
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
