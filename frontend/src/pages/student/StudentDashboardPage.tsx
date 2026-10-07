import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, serviceRequestService, noticeService } from '../../services';
import type { Complaint, ServiceRequest, Notice } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  FileText,
  PlusCircle,
  FileCheck2,
  ArrowRight,
  Pin,
  Clock,
  Building,
  Bell,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      const [cmps, reqs, nots] = await Promise.all([
        complaintService.getComplaints({ studentId: currentUser.id }),
        serviceRequestService.getRequests({ studentId: currentUser.id }),
        noticeService.getNotices('STUDENTS'),
      ]);
      setComplaints(cmps);
      setRequests(reqs);
      setNotices(nots);
    };
    load();
  }, [currentUser]);

  const openComplaintsCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'REJECTED'
  ).length;

  const activeRequestsCount = requests.filter(
    (r) => r.status !== 'FULFILLED' && r.status !== 'CLOSED' && r.status !== 'REJECTED'
  ).length;

  const pinnedNotice = notices.find((n) => n.isPinned);

  return (
    <div className="space-y-5">
      {/* 1. Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student ID: <span className="font-semibold text-slate-800">{currentUser?.studentId || '2023-CS-042'}</span> • {currentUser?.departmentName || 'Department of Computer Science'}
          </p>
        </div>

        {/* Primary Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/student/complaints/new"
            className="btn-primary text-xs py-1.5 px-3"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Lodge Complaint
          </Link>
          <Link
            to="/student/requests/new"
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
            Apply for Service
          </Link>
        </div>
      </div>

      {/* 2. Compact Announcement Strip */}
      {pinnedNotice && (
        <div className="bg-amber-50/90 border border-amber-200 rounded px-3.5 py-2 text-xs text-amber-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-amber-700 shrink-0 rotate-45" />
            <span className="font-semibold text-amber-900 shrink-0">Official Advisory:</span>
            <span className="truncate text-amber-900/90 font-medium">{pinnedNotice.title}</span>
            <span className="hidden md:inline text-amber-800/80 text-[11px] truncate">— {pinnedNotice.content}</span>
          </div>
          <Link
            to="/student/notices"
            className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline shrink-0 whitespace-nowrap"
          >
            View Bulletin →
          </Link>
        </div>
      )}

      {/* 3. Compact Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/student/complaints"
          className="bg-white border border-slate-200 rounded-md p-3 hover:border-slate-300 transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Complaints
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>{openComplaintsCount}</span>
              <span className="text-xs text-slate-400 font-normal">cases under review</span>
            </div>
          </div>
          <FileText className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          to="/student/requests"
          className="bg-white border border-slate-200 rounded-md p-3 hover:border-slate-300 transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Service Requests
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>{activeRequestsCount}</span>
              <span className="text-xs text-slate-400 font-normal">in processing</span>
            </div>
          </div>
          <FileCheck2 className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          to="/student/notices"
          className="bg-white border border-slate-200 rounded-md p-3 hover:border-slate-300 transition-colors flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Campus Bulletins
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>{notices.length}</span>
              <span className="text-xs text-slate-400 font-normal">published notices</span>
            </div>
          </div>
          <Bell className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      {/* 4. Dominant Main Content: Recent Complaints & Issue Tracking */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Complaints & Grievance Cases
            </h2>
            <p className="text-[11px] text-slate-500">
              Departmental assignment, progress milestones, and resolution updates
            </p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-campus-800 hover:text-campus-950 flex items-center gap-1"
          >
            All complaints ({complaints.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No active grievance tickets</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Submit a complaint to report facilities, academic, or network issues.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-2.5">Ticket ID</th>
                  <th className="px-5 py-2.5">Complaint Summary</th>
                  <th className="px-5 py-2.5">Department</th>
                  <th className="px-5 py-2.5">Priority</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Lodged Date</th>
                  <th className="px-5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.slice(0, 5).map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {cmp.ticketNumber}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 truncate max-w-md">
                        {cmp.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">
                        {cmp.description}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">
                      {cmp.departmentName}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <PriorityBadge priority={cmp.priority} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <StatusBadge status={cmp.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(cmp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/student/complaints/${cmp.id}`}
                        className="text-xs font-semibold text-campus-800 hover:text-campus-950 inline-flex items-center gap-1"
                      >
                        Timeline <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Secondary Grid: Service Applications & Campus Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Active Service Requests Tracker */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Service Applications
              </h3>
            </div>
            <Link
              to="/student/requests"
              className="text-[11px] font-semibold text-campus-800 hover:text-campus-950 flex items-center gap-1"
            >
              View all ({requests.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No active certificate or service applications.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {requests.slice(0, 4).map((req) => (
                <div key={req.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-medium text-slate-700">
                        {req.requestNumber}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="font-semibold text-slate-900 truncate">
                      {req.serviceName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dept: {req.departmentName}
                    </div>
                  </div>
                  <Link
                    to={`/student/requests/${req.id}`}
                    className="btn-secondary text-[11px] py-1 px-2.5 shrink-0"
                  >
                    Track
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Latest Notices List */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Latest Campus Notices
            </h3>
            <Link
              to="/student/notices"
              className="text-[11px] font-semibold text-campus-800 hover:text-campus-950 flex items-center gap-1"
            >
              Noticeboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {notices.slice(0, 4).map((n) => (
              <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {n.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 leading-snug">
                  {n.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-1">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
