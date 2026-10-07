import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  Paperclip,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Send,
  Lock,
} from 'lucide-react';

export const StaffCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, availableAccounts } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [statusComment, setStatusComment] = useState('');
  const [internalRemark, setInternalRemark] = useState('');
  const [publicRemark, setPublicRemark] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      if (data) {
        setNewStatus(data.status);
        setAssignedStaffId(data.assignedStaffId || '');
      }
    };
    load();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaint) return;
    setIsUpdating(true);
    setFeedbackSuccess(null);
    try {
      const updated = await complaintService.updateStatus(currentUser, {
        complaintId: complaint.id,
        newStatus,
        comment: statusComment,
        internalRemark,
        publicRemark,
      });
      setComplaint({ ...updated });
      setStatusComment('');
      setInternalRemark('');
      setPublicRemark('');
      setFeedbackSuccess('Case status and workflow log successfully updated.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignment = async () => {
    if (!currentUser || !complaint || !assignedStaffId) return;
    setIsUpdating(true);
    try {
      const staffMember = availableAccounts.find((a) => a.id === assignedStaffId);
      if (staffMember) {
        const updated = await complaintService.assignStaff(currentUser, {
          ticketId: complaint.id,
          staffId: staffMember.id,
          staffName: staffMember.name,
        });
        setComplaint({ ...updated });
        setFeedbackSuccess(`Case successfully assigned to ${staffMember.name}.`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!complaint) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Case Record Not Found</h2>
        <Link to="/staff/cases" className="btn-secondary text-xs mt-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Triage Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/staff" className="hover:text-slate-900">
            Overview
          </Link>
          <span>/</span>
          <Link to="/staff/cases" className="hover:text-slate-900">
            Cases
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-slate-800">
            {complaint.ticketNumber}
          </span>
        </div>

        <Link to="/staff/cases" className="btn-secondary text-xs self-start sm:self-auto">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Queue
        </Link>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded border border-slate-200">
              {complaint.ticketNumber}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs text-slate-500 font-medium">
              Category: {complaint.category.replace('_', ' ')}
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Lodged: {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {complaint.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Student Name:</span>
            <span className="font-semibold text-slate-900">
              {complaint.studentName} ({complaint.studentEmail})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Location:</span>
            <span className="font-semibold text-slate-900">
              {complaint.location || 'Campus Facilities'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Current Assignment:</span>
            <span className="font-semibold text-slate-900">
              {complaint.assignedStaffName || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Action Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Statement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Statement & Evidence
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </div>

            {complaint.attachments.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-600 block mb-1">
                  Attached Files:
                </span>
                <div className="space-y-1">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 text-xs text-campus-700 p-2 bg-white rounded border border-slate-200"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{att.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action: Status Transition & Remarks Form */}
          <form
            onSubmit={handleStatusUpdate}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5"
          >
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-campus-700" />
              Update Case Stage & Log Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Set New Status Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  <option value="SUBMITTED">SUBMITTED (Lodge Stage)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Triage Stage)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Work Assigned)</option>
                  <option value="RESOLVED">RESOLVED (Work Completed)</option>
                  <option value="REJECTED">REJECTED (Out of scope/Invalid)</option>
                  <option value="CLOSED">CLOSED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Timeline Status Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technician dispatched or spare parts received"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
              </div>
            </div>

            {/* Public Remark vs Internal Remark */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Public Remark (Visible to Student)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Student will be notified</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Official update message displayed directly to the student..."
                  value={publicRemark}
                  onChange={(e) => setPublicRemark(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Internal Staff Note (Confidential)
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">Department staff & admins only</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes, technician diagnostic details, vendor order references..."
                  value={internalRemark}
                  onChange={(e) => setInternalRemark(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-amber-300 bg-amber-50/30 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary text-xs sm:text-sm"
              >
                {isUpdating ? 'Saving Changes...' : 'Save Stage & Log Remarks'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Remarks History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Communication & Notes History ({complaint.remarks.length})
            </h2>

            {complaint.remarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No remarks recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {complaint.remarks.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-lg border text-xs ${
                      r.isInternal
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {r.authorName}
                        {r.isInternal ? (
                          <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Internal
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-normal">
                            (Public to student)
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Assignment & Timeline */}
        <div className="space-y-6">
          {/* Assignment Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              Assign Officer / Engineer
            </h2>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Select Department Staff:
              </label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
              >
                <option value="">Unassigned</option>
                {availableAccounts
                  .filter((a) => a.role === 'STAFF' || a.role === 'DEPT_ADMIN')
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.departmentName || acc.role})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAssignment}
              disabled={isUpdating}
              className="btn-secondary w-full text-xs"
            >
              Reassign Officer
            </button>
          </div>

          {/* Timeline Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Audit & Transition Trail
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.statusHistory.map((item, idx) => (
                <div key={item.id} className="relative text-xs">
                  <div
                    className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                      idx === 0
                        ? 'border-campus-700 bg-campus-700 ring-4 ring-campus-100'
                        : 'border-slate-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {item.toStatus.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      By {item.changedByName}
                    </div>
                    {item.comment && (
                      <div className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                        {item.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
