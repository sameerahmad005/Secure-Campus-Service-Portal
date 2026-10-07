import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Search, Filter, FileText } from 'lucide-react';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    complaintService
      .getComplaints({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined,
      })
      .then(setComplaints);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System-Wide Complaints Oversight
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Central monitoring across all campus divisions and departments
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tickets by ID, student, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Title & Student</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Staff Assigned</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    {c.ticketNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 max-w-xs truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-500">{c.studentName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{c.departmentName}</td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.assignedStaffName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/staff/cases/${c.id}`}
                      className="btn-secondary text-[11px] py-1 px-2.5 inline-flex"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
