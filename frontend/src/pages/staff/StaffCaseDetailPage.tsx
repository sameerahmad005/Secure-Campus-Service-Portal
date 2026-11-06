import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, adminService } from '../../services';
import type { Complaint, ComplaintStatus, Department, User } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  COMPLAINT_TRANSITION_MAP,
  canAccessComplaint,
  canForwardOrEscalate,
} from '../../utils/permissions';
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
  Share2,
  AlertTriangle,
  BookOpen,
  History,
  AlertCircle,
} from 'lucide-react';

export const StaffCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, availableAccounts } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status Update State
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [statusComment, setStatusComment] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalRemark, setInternalRemark] = useState('');
  const [publicRemark, setPublicRemark] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Forward / Escalate State
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardTargetDeptId, setForwardTargetDeptId] = useState('');
  const [forwardTargetStaffId, setForwardTargetStaffId] = useState('');
  const [forwardReason, setForwardReason] = useState('');
  const [isEscalationAction, setIsEscalationAction] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [complaintData, depts] = await Promise.all([
          complaintService.getComplaintById(id),
          adminService.getDepartments(),
        ]);
        setComplaint(complaintData);
        setDepartments(depts);
        if (complaintData) {
          const allowedTransitions = COMPLAINT_TRANSITION_MAP[complaintData.status] || [];
          setNewStatus(allowedTransitions[0] || '');
          setAssignedStaffId(complaintData.assignedStaffId || '');
          if (depts.length > 0) {
            setForwardTargetDeptId(depts[0].id);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
        <p className="text-xs text-slate-500">Loading case file...</p>
      </div>
    );
  }

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

  // Security Check: Role-Based Scoped Access Matrix
  const isAuthorized = currentUser ? canAccessComplaint(currentUser, complaint) : false;

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-10 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Access Boundary Restriction: Case Outside Scoped Authority
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Per campus security policy, technical administrators and unauthorized staff do not possess
            access to confidential student academic, welfare, or disciplinary grievances without formal case delegation.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 text-left space-y-1">
          <div><strong>Active Role:</strong> {currentUser?.role}</div>
          <div><strong>Complaint Category:</strong> {complaint.category}</div>
          <div><strong>Authorized Domain:</strong> Department & Scope Affiliation</div>
        </div>
        <Link to="/staff" className="btn-secondary text-xs inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Authorized Dashboard
        </Link>
      </div>
    );
  }

  const allowedTransitions = COMPLAINT_TRANSITION_MAP[complaint.status] || [];

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaint || !newStatus) return;

    if (newStatus === 'RESOLVED' && !resolutionReason.trim()) {
      setActionError('Please provide the official resolution decision / correction rationale.');
      return;
    }
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      setActionError('Please provide the reason for rejection to be communicated to the student.');
      return;
    }

    setIsUpdating(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const updated = await complaintService.updateStatus(currentUser, {
        complaintId: complaint.id,
        newStatus: newStatus as ComplaintStatus,
        comment: statusComment,
        resolutionReason: newStatus === 'RESOLVED' ? resolutionReason : undefined,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
        internalRemark,
        publicRemark,
      });
      setComplaint({ ...updated });
      setStatusComment('');
      setInternalRemark('');
      setPublicRemark('');
      setResolutionReason('');
      setRejectionReason('');
      const nextAllowed = COMPLAINT_TRANSITION_MAP[updated.status] || [];
      setNewStatus(nextAllowed[0] || '');
      setActionSuccess(`Case successfully transitioned to ${updated.status.replace('_', ' ')}.`);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignment = async () => {
    if (!currentUser || !complaint || !assignedStaffId) return;
    setIsUpdating(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const staffMember = availableAccounts.find((a) => a.id === assignedStaffId);
      if (staffMember) {
        const updated = await complaintService.assignStaff(currentUser, {
          ticketId: complaint.id,
          staffId: staffMember.id,
          staffName: staffMember.name,
          assignedUnit: staffMember.departmentName || staffMember.role,
        });
        setComplaint({ ...updated });
        setActionSuccess(`Case successfully assigned to ${staffMember.name}.`);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign officer.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleForwardOrEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaint || !forwardReason.trim() || !forwardTargetDeptId) return;

    setIsUpdating(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const targetDept = departments.find((d) => d.id === forwardTargetDeptId);
      const targetStaff = availableAccounts.find((a) => a.id === forwardTargetStaffId);

      const updated = await complaintService.forwardComplaint(currentUser, {
        complaintId: complaint.id,
        targetDepartmentId: forwardTargetDeptId,
        targetDepartmentName: targetDept?.name || 'Department Office',
        targetStaffId: targetStaff?.id,
        targetStaffName: targetStaff?.name,
        reason: forwardReason.trim(),
      });

      // If user flagged as escalation, transition status to ESCALATED
      if (isEscalationAction && updated.status !== 'ESCALATED') {
        const escalated = await complaintService.updateStatus(currentUser, {
          complaintId: updated.id,
          newStatus: 'ESCALATED',
          comment: `Case formally escalated: ${forwardReason.trim()}`,
        });
        setComplaint({ ...escalated });
      } else {
        setComplaint({ ...updated });
      }

      setIsForwardModalOpen(false);
      setForwardReason('');
      setActionSuccess(
        isEscalationAction
          ? `Case formally escalated to ${targetDept?.name}.`
          : `Case forwarded to ${targetDept?.name}.`
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to forward case.');
    } finally {
      setIsUpdating(false);
    }
  };

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

        <div className="flex items-center gap-2">
          {canForwardOrEscalate(currentUser?.role || 'STAFF') && (
            <button
              onClick={() => {
                setIsEscalationAction(false);
                setIsForwardModalOpen(true);
              }}
              className="btn-secondary text-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              Forward Case
            </button>
          )}

          {canForwardOrEscalate(currentUser?.role || 'STAFF') && (
            <button
              onClick={() => {
                setIsEscalationAction(true);
                setIsForwardModalOpen(true);
              }}
              className="btn-secondary text-xs border-purple-300 text-purple-800 hover:bg-purple-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
              Escalate to Head
            </button>
          )}

          <Link to="/staff/cases" className="btn-secondary text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
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
            {complaint.subcategoryName && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {complaint.subcategoryName}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Lodged: {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {complaint.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Student:</span>
            <span className="font-semibold text-slate-900">
              {complaint.studentName} ({complaint.studentId})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Department:</span>
            <span className="font-semibold text-slate-900">{complaint.departmentName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Location:</span>
            <span className="font-semibold text-slate-900">{complaint.location || 'Campus Facilities'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Assigned Handler:</span>
            <span className="font-semibold text-slate-900">
              {complaint.assignedStaffName || complaint.assignedUnit || 'Unassigned Desk'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Action Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specific Attendance Complaint Record (Stakeholder.pdf) */}
          {complaint.attendanceData && (
            <div className="bg-white rounded-xl border border-campus-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-campus-700" />
                  Attendance Grievance Dossier (Stakeholder.pdf Verified)
                </h2>
                <span className="text-[10px] bg-campus-50 text-campus-800 font-semibold px-2 py-0.5 rounded border border-campus-200">
                  Attendance In-charge Checklist
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Enrolled Course & Semester:</span>
                  <span className="font-semibold text-slate-900">
                    {complaint.attendanceData.course} • {complaint.attendanceData.semester}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Subject / Subject Code:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.subject}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Concerned Faculty:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.facultyName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Discrepancy Class Date:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.dateOfAttendance}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Complaint Type:</span>
                  <span className="font-semibold text-campus-800">{complaint.attendanceData.complaintType}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Recorded Attendance Status:</span>
                  <span className="font-semibold text-rose-700">{complaint.attendanceData.recordedAttendanceStatus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Issue Statement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Statement & Supporting Proof
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </div>

            {complaint.attachments.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-600 block mb-1">
                  Attached Verification Evidence:
                </span>
                <div className="space-y-1">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between text-xs text-slate-800 p-2 bg-white rounded border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span>{att.fileName}</span>
                      </div>
                      <span className="text-campus-700 font-semibold hover:underline cursor-pointer">
                        Inspect file ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action: Status Transition & Remarks Form (Lifecycle Map Enforcement) */}
          <form
            onSubmit={handleStatusUpdate}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5"
          >
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-campus-700" />
                Workflow Lifecycle Transition & Remarks
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Current: {complaint.status}
              </span>
            </div>

            {allowedTransitions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 italic text-center">
                This case has reached its terminal lifecycle stage ({complaint.status}). No further transitions are available.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select Next Permitted Stage <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                    >
                      {allowedTransitions.map((st) => (
                        <option key={st} value={st}>
                          {st.replace('_', ' ')} {st === 'NEED_MORE_INFO' ? '(Request Proof)' : st === 'ESCALATED' ? '(Forward to Head)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Action Note / Status Comment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Attendance records verified with teacher register"
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                    />
                  </div>
                </div>

                {/* Conditional Resolution Reason */}
                {newStatus === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Verified Correction / Reasoned Decision Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Verified correction kar di gayi hai, ya complaint ka reasoned decision de diya gaya hai..."
                      value={resolutionReason}
                      onChange={(e) => setResolutionReason(e.target.value)}
                      className="w-full text-xs rounded border border-emerald-300 p-2 text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}

                {/* Conditional Rejection Reason */}
                {newStatus === 'REJECTED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                    <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Rejection Reason (Disclosed to Student) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Verification ke baad complaint valid nahi mili; reason student ko bataya jayega..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full text-xs rounded border border-rose-300 p-2 text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-rose-700"
                    />
                  </div>
                )}

                {/* Remarks: Public and Internal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Public Remark</span>
                      <span className="text-[10px] text-slate-400 font-normal">Visible to student</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Public message visible in student portal..."
                      value={publicRemark}
                      onChange={(e) => setPublicRemark(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Internal Staff Note
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">Hidden from student</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Confidential staff findings, verification references..."
                      value={internalRemark}
                      onChange={(e) => setInternalRemark(e.target.value)}
                      className="w-full text-xs rounded-lg border border-amber-300 bg-amber-50/40 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-primary text-xs sm:text-sm"
                  >
                    {isUpdating ? 'Saving...' : 'Execute Transition & Record Remarks'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Remarks History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Remarks & Staff Notes ({complaint.remarks.length})
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
                            <Lock className="w-2.5 h-2.5" /> Internal Staff Note
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-normal">
                            (Public Communication)
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

        {/* Right Column: Case Assignment, Forwarding & Audit Trails */}
        <div className="space-y-6">
          {/* Assignment Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              Direct Officer Assignment
            </h2>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Select Handler / Subject Faculty:
              </label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
              >
                <option value="">Unassigned</option>
                {availableAccounts
                  .filter((a) => a.role !== 'STUDENT')
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
              Assign Case to Officer
            </button>
          </div>

          {/* Assignment History Log (Section 10) */}
          {complaint.assignmentHistory && complaint.assignmentHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Forwarding & Assignment Trail
              </h2>
              <div className="space-y-2 text-xs">
                {complaint.assignmentHistory.map((ah) => (
                  <div key={ah.id} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>By: {ah.assignedByName} ({ah.assignedByRole})</span>
                      <span>{new Date(ah.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      {ah.fromAssignment} → {ah.toAssignment}
                    </div>
                    <p className="text-slate-600 italic">"{ah.reason}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Lifecycle Status History
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
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{item.toStatus.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      By: {item.changedByName} ({item.changedByRole})
                    </div>
                    {item.comment && (
                      <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-snug">
                        {item.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forward / Escalate Modal Dialog */}
      {isForwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {isEscalationAction ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-purple-700" />
                    Formal Case Escalation
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-campus-700" />
                    Forward Case to Department / Cell
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsForwardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForwardOrEscalateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Department / Administrative Body <span className="text-rose-500">*</span>
                </label>
                <select
                  value={forwardTargetDeptId}
                  onChange={(e) => setForwardTargetDeptId(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign to Designated Officer (Optional)
                </label>
                <select
                  value={forwardTargetStaffId}
                  onChange={(e) => setForwardTargetStaffId(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900 bg-white"
                >
                  <option value="">General Department Pool</option>
                  {availableAccounts
                    .filter((a) => a.role !== 'STUDENT')
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.departmentName || acc.role})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Forwarding / Escalation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mandatory justification: explain why jurisdiction belongs to target department or reasons for escalation..."
                  value={forwardReason}
                  onChange={(e) => setForwardReason(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsForwardModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary text-xs"
                >
                  {isEscalationAction ? 'Confirm Escalation' : 'Confirm Forwarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
