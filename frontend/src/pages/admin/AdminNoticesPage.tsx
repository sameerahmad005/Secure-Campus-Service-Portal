import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services';
import type { NoticeCategory } from '../../types';
import { FileCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminNoticesPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('GENERAL');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'STAFF'>('ALL');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setSuccess(null);
    try {
      await noticeService.createNotice(currentUser, {
        title,
        content,
        category,
        targetAudience,
        isPinned,
        departmentName: 'Central Administration',
      });
      setTitle('');
      setContent('');
      setIsPinned(false);
      setSuccess('Notice successfully published to the institutional portal and student dashboards.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Publish Official Campus Notice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Broadcast circulars to students, faculty, and departmental staff (FR-NOTICE-001)
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notice Headline / Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Schedule for End-Semester Examinations or Power Maintenance"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoticeCategory)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
            >
              <option value="GENERAL">General Bulletin</option>
              <option value="ACADEMIC">Academic Alert</option>
              <option value="EXAMINATION">Examinations</option>
              <option value="MAINTENANCE">Facilities / Works Maintenance</option>
              <option value="HOSTEL">Hostels</option>
              <option value="URGENT">Urgent Advisory</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as 'ALL' | 'STUDENTS' | 'STAFF')}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
            >
              <option value="ALL">Entire Campus (All Users)</option>
              <option value="STUDENTS">Students Only</option>
              <option value="STAFF">Department Staff & Faculty Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notice Body / Official Statement <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={6}
            required
            placeholder="Official details, instructions, applicable dates, and contacts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
          />
        </div>

        <div className="flex items-center">
          <input
            id="pinned"
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-campus-900 focus:ring-campus-700"
          />
          <label htmlFor="pinned" className="ml-2 block text-xs text-slate-700 font-medium">
            Pin as Priority Announcement (highlights on student dashboards)
          </label>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs sm:text-sm"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Notice'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
