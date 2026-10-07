import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';

export const StaffCasesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [cases, setCases] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(false);
      try {
        const list = await complaintService.getComplaints({
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined,
        });
        setCases(list);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Department Case Triage & Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Process, reassign, update status, and post official remarks on campus tickets
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by ticket ID, student name, or problem title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted (New)</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No matching cases</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Subject & Student</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned Staff</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {c.ticketNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.studentName} ({c.studentEmail})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {c.departmentName}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.assignedStaffName || (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/staff/cases/${c.id}`}
                        className="btn-primary text-[11px] py-1 px-3 inline-flex"
                      >
                        Triage & Update →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
