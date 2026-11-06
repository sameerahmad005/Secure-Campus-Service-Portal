import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus, ComplaintCategory } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { canAccessComplaint, getRoleDisplayName } from '../../utils/permissions';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Building,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';

export const StaffCasesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';
  const filterAssigned = searchParams.get('filter') === 'assigned';

  const [cases, setCases] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await complaintService.getComplaints({
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined,
          category: categoryFilter !== 'ALL' ? (categoryFilter as ComplaintCategory) : undefined,
        });

        // Apply organizational scope & assignment filter
        let filtered = currentUser
          ? list.filter((c) => canAccessComplaint(currentUser, c))
          : list;

        if (filterAssigned && currentUser) {
          filtered = filtered.filter((c) => c.assignedStaffId === currentUser.id);
        }

        setCases(filtered);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [search, statusFilter, categoryFilter, filterAssigned, currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-campus-700 uppercase tracking-wider bg-campus-50 border border-campus-200 px-2.5 py-0.5 rounded-full">
              {currentUser ? getRoleDisplayName(currentUser.role) : 'Staff'}
            </span>
            {filterAssigned && (
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Assigned to Me
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Case Triage & Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Process, reassign, review attendance disputes, and execute auditable status transitions
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by ticket ID, student name, subject, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic Services</option>
            <option value="HOSTEL">Hostel / Hall</option>
            <option value="WELFARE_GRIEVANCE">Welfare & Grievances</option>
            <option value="IT_NETWORK">IT & Digital Services</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted (New)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NEED_MORE_INFO">Need More Info</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No matching cases in this queue</p>
            <p className="text-xs text-slate-400 mt-1">
              Either no cases match your filter criteria, or active cases belong to other scoped departments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Subject & Requester</th>
                  <th className="px-6 py-3">Department / Scope</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status Stage</th>
                  <th className="px-6 py-3">Assigned Handler</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                      {c.ticketNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 flex items-center gap-1.5">
                        {c.attendanceData && (
                          <span className="text-[10px] font-bold text-campus-700 bg-campus-50 border border-campus-200 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3" /> Attendance
                          </span>
                        )}
                        <span>{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.studentName} ({c.studentId})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{c.departmentName}</div>
                      {c.hallName && (
                        <div className="text-[10px] text-slate-400">{c.hallName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.assignedStaffName || c.assignedUnit || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/staff/cases/${c.id}`}
                        className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        Triage Case
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-lg text-[11px] text-slate-500 text-center font-mono">
        Development Mock Queue: Scoped by active stakeholder role ({currentUser?.role})
      </div>
    </div>
  );
};
