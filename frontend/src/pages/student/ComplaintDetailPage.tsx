import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  Paperclip,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Send,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Student response to NEED_MORE_INFO
  const [studentResponse, setStudentResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStudentResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaint || !studentResponse.trim()) return;
    setIsSubmittingResponse(true);
    setResponseSuccess(null);
    try {
      // Per PDF lifecycle: NEED_MORE_INFO -> UNDER_REVIEW when student supplies clarification
      const updated = await complaintService.updateStatus(currentUser, {
        complaintId: complaint.id,
        newStatus: 'UNDER_REVIEW',
        comment: 'Student submitted requested clarification/proof.',
        publicRemark: `Student response: ${studentResponse.trim()}`,
      });
      setComplaint({ ...updated });
      setStudentResponse('');
      setResponseSuccess('Your clarification was submitted and ticket status transitioned back to Under Review.');
    } catch (err: unknown) {
      toast('Could not send your response', { tone: 'error', description: err instanceof Error ? err.message : undefined });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !complaint) return;
    setIsSubmittingFeedback(true);
    try {
      await complaintService.submitFeedback(currentUser, complaint.id, {
        rating,
        comment: feedbackComment,
      });
      setFeedbackSuccess(true);
      const updated = await complaintService.getComplaintById(complaint.id);
      setComplaint(updated);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
        <p className="text-xs text-slate-500">Loading complaint record...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The specified ticket ID does not exist or has been removed.</p>
        <Link to="/student/complaints" className="btn-secondary text-xs mt-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Complaints
        </Link>
      </div>
    );
  }

  // Security Rule: Internal remarks must NEVER be visible to student view
  const visibleRemarks = complaint.remarks.filter((r) => !r.isInternal);

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/student" className="hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/student/complaints" className="hover:text-slate-900">
            Complaints
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-slate-800">
            {complaint.ticketNumber}
          </span>
        </div>

        <Link to="/student/complaints" className="btn-secondary text-xs self-start sm:self-auto">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to list
        </Link>
      </div>

      {responseSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{responseSuccess}</span>
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
            <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {complaint.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800">Department:</strong> {complaint.departmentName}
            </span>
          </div>
          {complaint.location && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-800">Location:</strong> {complaint.location}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800">Assigned Handler:</strong>{' '}
              {complaint.assignedStaffName || complaint.assignedUnit || 'Assigned Department Desk'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Notice: Need More Information */}
      {complaint.status === 'NEED_MORE_INFO' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-orange-900 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            Department Action Required: Additional Proof or Clarification Needed
          </div>
          <p className="text-xs text-orange-800 leading-relaxed">
            The assigned officer has requested further information or supporting documentation to proceed with verification.
            Please submit your response below to return this ticket to Under Review.
          </p>

          <form onSubmit={handleStudentResponseSubmit} className="space-y-3 pt-2">
            <textarea
              rows={3}
              required
              placeholder="Enter requested clarification, registration details, or evidence facts..."
              value={studentResponse}
              onChange={(e) => setStudentResponse(e.target.value)}
              className="w-full text-xs rounded-lg border border-orange-300 bg-white p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingResponse}
                className="btn-primary text-xs bg-orange-700 hover:bg-orange-800"
              >
                {isSubmittingResponse ? 'Submitting...' : 'Submit Clarification to Handler'}
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two Column Layout: Description & Details on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specific Attendance Complaint Verification Card (Stakeholder.pdf) */}
          {complaint.attendanceData && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <BookOpen className="w-4 h-4 text-campus-700" />
                Attendance Discrepancy Record (Stakeholder Verification Schema)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Subject / Course Code:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.subject}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Concerned Faculty:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.facultyName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Date of Attendance:</span>
                  <span className="font-semibold text-slate-900">{complaint.attendanceData.dateOfAttendance}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Reported Discrepancy Type:</span>
                  <span className="font-semibold text-campus-800">{complaint.attendanceData.complaintType}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 sm:col-span-2">
                  <span className="text-slate-500 block text-[11px]">Recorded Status in Portal:</span>
                  <span className="font-semibold text-rose-700">{complaint.attendanceData.recordedAttendanceStatus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Statement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Description & Facts
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </div>

            {/* Resolution or Rejection Reason if present */}
            {complaint.resolutionReason && (
              <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Official Resolution Decision:
                </span>
                <p>{complaint.resolutionReason}</p>
              </div>
            )}

            {complaint.rejectionReason && (
              <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Reason for Rejection:
                </span>
                <p>{complaint.rejectionReason}</p>
              </div>
            )}

            {/* Attachments */}
            {complaint.attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  Supporting Evidence ({complaint.attachments.length})
                </h3>
                <div className="space-y-1.5">
                  {complaint.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs hover:border-campus-400 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800 truncate">{att.fileName}</span>
                        <span className="text-[10px] text-slate-400">
                          ({(att.fileSize / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-campus-700 hover:text-campus-900 cursor-pointer">
                        View file ↗
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Departmental Communications / Public Remarks */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Public Communication & Remarks ({visibleRemarks.length})
            </h2>

            {visibleRemarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No official remarks logged by the department yet. Lifecycle changes appear on the status timeline.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleRemarks.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-lg border text-xs bg-slate-50 border-slate-200 text-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {rem.authorName}
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({rem.authorRole.replace('_', ' ')})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rem.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution & Feedback Section */}
          {complaint.status === 'RESOLVED' && (
            <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Case Resolved by Department
              </div>

              {complaint.feedback ? (
                <div className="bg-white p-4 rounded-lg border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Your Submitted Feedback:</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= complaint.feedback!.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-slate-600 italic">"{complaint.feedback.comment}"</p>
                  )}
                  <span className="text-[10px] text-slate-400 block">
                    Recorded on {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    This complaint has been marked resolved. Please rate the service quality and turnaround:
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                          aria-label={`Rate ${s} stars`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Optional feedback remark for quality assurance..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-campus-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="btn-primary text-xs"
                  >
                    {isSubmittingFeedback ? 'Submitting Feedback...' : 'Submit Resolution Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Status History & Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Status Lifecycle History
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
                      By: {item.changedByName} ({item.changedByRole.replace('_', ' ')})
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
    </div>
  );
};
