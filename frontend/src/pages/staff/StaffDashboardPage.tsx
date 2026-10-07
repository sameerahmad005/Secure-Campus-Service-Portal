import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(false);
      try {
        const list = await complaintService.getComplaints();
        // Department scope or all department cases
        const deptCases = currentUser?.departmentId
          ? list.filter((c) => c.departmentId === currentUser.departmentId)
          : list;
        setCases(deptCases);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const pendingCount = cases.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;

  const inProgressCount = cases.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED').length;
  const criticalCount = cases.filter(
    (c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Department Staff Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-campus-700 uppercase tracking-wider bg-campus-50 border border-campus-200 px-2.5 py-0.5 rounded-full">
              {currentUser?.departmentName || 'Department Operations'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Staff Workload & Case Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Officer: <span className="font-semibold text-slate-700">{currentUser?.name}</span> ({currentUser?.employeeId || 'EMP-CC-109'})
          </p>
        </div>

        <Link to="/staff/cases" className="btn-primary text-xs sm:text-sm self-start md:self-auto">
          <ClipboardList className="w-4 h-4" />
          Open Triage Queue
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/staff/cases')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Triage
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
            <span className="text-xs text-slate-500">unassigned/review</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{inProgressCount}</span>
            <span className="text-xs text-slate-500">active repairs</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{resolvedCount}</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Critical Cases
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{criticalCount}</span>
            <span className="text-xs text-slate-500">escalated</span>
          </div>
        </div>
      </div>

      {/* Department Triage Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Active Triage Queue</h2>
            <p className="text-xs text-slate-500">Cases requiring status evaluation or assignment</p>
          </div>
          <Link
            to="/staff/cases"
            className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center gap-1"
          >
            Manage all cases ({cases.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Student & Summary</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Lodged</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    {c.ticketNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 truncate max-w-xs">{c.title}</div>
                    <div className="text-[11px] text-slate-500">{c.studentName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.assignedStaffName || (
                      <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/staff/cases/${c.id}`}
                      className="btn-secondary text-[11px] py-1 px-2.5 inline-flex"
                    >
                      Process Case →
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
