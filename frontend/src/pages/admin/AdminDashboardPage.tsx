import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, complaintService } from '../../services';
import type { DashboardStatistics, Complaint, AuditLog, Department } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  Building,
  Users,
  FileText,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  History,
  Shield,
  Lock,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const load = async () => {
      const [s, cList, logs, depts] = await Promise.all([
        adminService.getSystemStatistics(),
        complaintService.getComplaints(),
        adminService.getAuditLogs(),
        adminService.getDepartments(),
      ]);
      setStats(s);
      setRecentComplaints(cList.slice(0, 5));
      setAuditLogs(logs.slice(0, 5));
      setDepartments(depts);
    };
    load();
  }, []);

  const isItAdmin = role === 'IT_ADMIN';
  const isChairman = role === 'CHAIRMAN';
  const isMgmt = role === 'UNIVERSITY_MGMT';

  const escalatedComplaintsCount = recentComplaints.filter((c) => c.status === 'ESCALATED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {isItAdmin
                ? 'IT & System Administration'
                : isChairman
                ? 'Chairman • Department Oversight'
                : isMgmt
                ? 'University Management & Governance'
                : 'Central Administrative Governance'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            {isItAdmin
              ? 'Platform Infrastructure & Security Governance'
              : isChairman
              ? 'Campus-Wide Oversight & Escalation Dashboard'
              : isMgmt
              ? 'University Governance & Performance Analytics'
              : 'System Overview & Campus Analytics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isItAdmin
              ? 'User identity management, system configuration, audit logs, and security boundary controls'
              : isChairman
              ? 'High-level institutional monitoring, overdue cases, department escalations, and executive reports'
              : isMgmt
              ? 'Campus-wide issue resolution times, departmental benchmarks, and service efficiency'
              : 'Cross-department monitoring, service turnaround benchmarks, and administrative controls'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isItAdmin ? (
            <>
              <Link to="/admin/users" className="btn-primary text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                User Directory
              </Link>
              <Link to="/admin/audit-logs" className="btn-secondary text-xs sm:text-sm">
                <History className="w-4 h-4 text-slate-500" />
                Audit Logs
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin/notices" className="btn-primary text-xs sm:text-sm">
                Publish Campus Notice
              </Link>
              <Link to="/admin/audit-logs" className="btn-secondary text-xs sm:text-sm">
                <History className="w-4 h-4 text-slate-500" />
                Audit Trail
              </Link>
            </>
          )}
        </div>
      </div>

      {/* IT Admin Privacy Segregation Notice */}
      {isItAdmin && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-900 leading-relaxed">
            <span className="font-bold text-sky-950">Institutional Privacy Separation: </span>
            As a Technical System Administrator, you manage infrastructure, authentication roles,
            and security auditing. In accordance with university privacy guidelines, student
            grievance dossiers and individual academic complaint records are confidential and
            segregated to authorized department personnel, welfare units, and institutional
            leadership.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isItAdmin ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Accounts
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {stats?.totalUsersCount || 0}
                </span>
                <span className="text-xs text-slate-500">active accounts</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Configured Units
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {departments.length}
                </span>
                <span className="text-xs text-slate-500">departments & halls</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recent Audit Events
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {auditLogs.length}
                </span>
                <span className="text-xs text-slate-500">logged transactions</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Platform Status
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-sm font-bold text-emerald-700">Healthy</span>
                <span className="text-xs text-slate-500">RBAC Enforced</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Open Issues
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {stats?.openComplaintsCount || 0}
                </span>
                <span className="text-xs text-slate-500">unresolved</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Escalated Cases
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {escalatedComplaintsCount}
                </span>
                <span className="text-xs text-slate-500">requiring intervention</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Service Reqs
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {stats?.activeRequestsCount || 0}
                </span>
                <span className="text-xs text-slate-500">in processing</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Departments
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {departments.length}
                </span>
                <span className="text-xs text-slate-500">integrated</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      {isItAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                System Security & Audit Events
              </h2>
              <Link to="/admin/audit-logs" className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center gap-1">
                Full Log <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Actor: {log.actorName} ({log.actorRole})</span>
                    <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IT Admin Tools & Infrastructure */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-500" />
              Administrative Governance Modules
            </h2>
            <div className="space-y-3 text-xs">
              <Link
                to="/admin/users"
                className="p-3.5 rounded-lg border border-slate-200 hover:border-campus-700 hover:bg-slate-50/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">User Identity & Directory</div>
                  <div className="text-slate-500 text-[11px]">Manage student, faculty, and administrative accounts</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/departments"
                className="p-3.5 rounded-lg border border-slate-200 hover:border-campus-700 hover:bg-slate-50/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Departmental Structure & Units</div>
                  <div className="text-slate-500 text-[11px]">Configure university faculties, halls of residence, and welfare offices</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Backup & System Integrity</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    AUTOMATED • DAILY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Local storage synchronization active. Production deployment requires external KMS and database replication.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent System Complaints */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Latest Registered Issues</h2>
              <Link to="/admin/complaints" className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {recentComplaints.map((c) => (
                <div key={c.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{c.ticketNumber}</span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <div className="font-medium text-slate-900 truncate max-w-xs">{c.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.departmentName} • {c.studentName}
                    </div>
                  </div>
                  <Link
                    to={`/staff/cases/${c.id}`}
                    className="btn-secondary text-[11px] py-1 px-2.5 shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Trail Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Recent Security Audit Events
              </h2>
              <Link to="/admin/audit-logs" className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center gap-1">
                Complete audit log <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Actor: {log.actorName} ({log.actorRole})</span>
                    <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboardPage;
