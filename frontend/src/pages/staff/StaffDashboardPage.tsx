import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { canAccessComplaint, getRoleDisplayName } from '../../utils/permissions';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Building,
  HelpCircle,
  ShieldAlert,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await complaintService.getComplaints();
        // Organizational scoping
        const scoped = currentUser
          ? list.filter((c) => canAccessComplaint(currentUser, c))
          : list;
        setCases(scoped);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // Role-specific metrics derived directly from scoped mock data
  const assignedToMeCount = cases.filter(
    (c) => c.assignedStaffId === currentUser?.id
  ).length;

  const pendingReviewCount = cases.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;

  const awaitingStudentInfoCount = cases.filter(
    (c) => c.status === 'NEED_MORE_INFO'
  ).length;

  const escalatedCount = cases.filter(
    (c) => c.status === 'ESCALATED'
  ).length;

  const resolvedCount = cases.filter(
    (c) => c.status === 'RESOLVED'
  ).length;

  const attendanceDisputesCount = cases.filter(
    (c) => !!c.attendanceData || c.subcategoryId === 'sub_attendance'
  ).length;

  return (
    <div className="space-y-6">
      {/* Role-Specific Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-campus-700 uppercase tracking-wider bg-campus-50 border border-campus-200 px-2.5 py-0.5 rounded-full">
              {currentUser ? getRoleDisplayName(currentUser.role) : 'Officer Workspace'}
            </span>
            {currentUser?.departmentName && (
              <span className="text-xs text-slate-500 font-medium">
                • {currentUser.departmentName}
              </span>
            )}
            {currentUser?.hallName && (
              <span className="text-xs text-slate-500 font-medium">
                • {currentUser.hallName}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Case Management & Triage Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Officer: <span className="font-semibold text-slate-700">{currentUser?.name}</span>{' '}
            ({currentUser?.employeeId || 'ID Verified'})
          </p>
        </div>

        <Link to="/staff/cases" className="btn-primary text-xs sm:text-sm self-start md:self-auto">
          <ClipboardList className="w-4 h-4" />
          Open Case Queue
        </Link>
      </div>

      {/* Role-Specific Metrics Grid (Section 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => navigate('/staff/cases?filter=assigned')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Cases
            </span>
            <div className="w-7 h-7 rounded-lg bg-campus-50 text-campus-700 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{assignedToMeCount}</span>
            <span className="text-[10px] text-slate-400">to my desk</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases?status=UNDER_REVIEW')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingReviewCount}</span>
            <span className="text-[10px] text-slate-400">in triage</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases?status=NEED_MORE_INFO')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting Proof
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{awaitingStudentInfoCount}</span>
            <span className="text-[10px] text-slate-400">student action</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases?status=ESCALATED')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Escalated Cases
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{escalatedCount}</span>
            <span className="text-[10px] text-slate-400">high priority</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/cases?status=RESOLVED')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-campus-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{resolvedCount}</span>
            <span className="text-[10px] text-slate-400">completed</span>
          </div>
        </div>
      </div>

      {/* Attendance Grievance Callout Banner if attendance disputes exist */}
      {attendanceDisputesCount > 0 && (
        <div className="p-4 bg-campus-50/60 border border-campus-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-campus-100 text-campus-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Attendance Grievance Intake ({attendanceDisputesCount} active)
              </h3>
              <p className="text-[11px] text-slate-600">
                Discrepancy reports for absent markings and attendance record mismatch requiring teacher register sign checks.
              </p>
            </div>
          </div>
          <Link
            to="/staff/cases?category=ACADEMIC"
            className="btn-secondary text-xs bg-white text-campus-900"
          >
            Review Attendance Cases →
          </Link>
        </div>
      )}

      {/* Priority Triage Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Scoped Priority Queue
            </h2>
            <p className="text-[11px] text-slate-500">
              Immediate cases requiring review, status advancement, or forwarding
            </p>
          </div>
          <Link
            to="/staff/cases"
            className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center gap-1"
          >
            View all ({cases.length}) →
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No active cases in your queue</p>
            <p className="text-xs text-slate-400 mt-1">All complaints within your scope have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Subject & Requester</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assigned Handler</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                      {c.ticketNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                        {c.attendanceData && (
                          <span className="text-[10px] font-bold text-campus-700 bg-campus-50 border border-campus-200 px-1 py-0.2 rounded shrink-0">
                            Attendance
                          </span>
                        )}
                        <span>{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.studentName} ({c.studentId}) • {c.departmentName}
                      </div>
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
                        Process
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
        Development Mock Metrics: Scoped dynamically to {currentUser?.name} ({currentUser?.role})
      </div>
    </div>
  );
};
