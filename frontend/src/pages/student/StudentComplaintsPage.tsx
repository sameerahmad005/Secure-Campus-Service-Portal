import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Clock,
  MapPin,
  Paperclip,
} from 'lucide-react';

export const StudentComplaintsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setIsLoading(false);
      try {
        const list = await complaintService.getComplaints({
          studentId: currentUser.id,
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined,
        });
        setComplaints(list);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser, search, statusFilter]);

  const filtered = complaints.filter((c) => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Submitted Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, track status transitions, and review departmental updates on your tickets
          </p>
        </div>

        <Link
          to="/student/complaints/new"
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Lodge New Complaint
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by ticket ID (e.g. CMP-2026), keywords, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
          >
            <option value="ALL">All Categories</option>
            <option value="IT_NETWORK">IT & Network</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="HOSTEL">Hostel Facilities</option>
            <option value="LIBRARY">Library</option>
            <option value="ACADEMIC">Academic</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'No complaints matched your active filter or search keywords.'
              : 'You currently have no registered complaints on the portal.'}
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="mt-3 text-xs font-semibold text-campus-700 hover:text-campus-900"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cmp) => (
            <div
              key={cmp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-campus-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {cmp.ticketNumber}
                  </span>
                  <StatusBadge status={cmp.status} />
                  <PriorityBadge priority={cmp.priority} />
                  <span className="text-[11px] text-slate-400 font-medium">
                    Category: {cmp.category.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 hover:text-campus-900 transition-colors">
                    <Link to={`/student/complaints/${cmp.id}`}>
                      {cmp.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {cmp.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="font-medium text-slate-700">
                    Dept: {cmp.departmentName}
                  </span>
                  {cmp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {cmp.location}
                    </span>
                  )}
                  {cmp.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-campus-700 font-medium">
                      <Paperclip className="w-3 h-3" />
                      {cmp.attachments.length} attachment(s)
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Lodged: {new Date(cmp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                <Link
                  to={`/student/complaints/${cmp.id}`}
                  className="btn-secondary text-xs w-full md:w-auto"
                >
                  View Timeline & Remarks
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
