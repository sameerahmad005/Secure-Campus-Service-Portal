import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Search, Filter, FileText, Shield } from 'lucide-react';

export const AdminComplaintsPage: React.FC = () => {
  const { role } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (role === 'IT_ADMIN') return;
    complaintService
      .getComplaints({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as ComplaintStatus) : undefined,
      })
      .then(setComplaints);
  }, [search, statusFilter, role]);

  if (role === 'IT_ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Complaints Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Role-based access control boundary enforcement
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Access Restricted by Privacy Policy
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              As an IT / System Administrator, your permissions cover platform operations, identity
              governance, and technical auditability. Under university data governance standards,
              substantive student complaints, academic grievances, and welfare dossiers are
              restricted to authorized departmental handlers, SRGC, Management, and Chairman to
              protect student privacy.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/admin" className="btn-secondary text-xs">
              Back to System Dashboard
            </Link>
            <Link to="/admin/audit-logs" className="btn-primary text-xs">
              View Audit Logs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              System-Wide Complaints Oversight
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Executive monitoring across all campus divisions, faculties, and residences
          </p>
        </div>
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
          <option value="NEED_MORE_INFO">Need More Info</option>
          <option value="ESCALATED">Escalated</option>
          <option value="IN_PROGRESS">In Progress (Legacy)</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
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
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No complaints matching your criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
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
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminComplaintsPage;
