import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';
import type { Complaint } from '../../types';
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
  Star,
  MessageSquare,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(false);
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

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
      // Reload
      const updated = await complaintService.getComplaintById(complaint.id);
      setComplaint(updated);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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

  // Filter remarks: only public remarks are shown to student
  const visibleRemarks = complaint.remarks.filter(
    (r) => !r.isInternal || currentUser?.role !== 'STUDENT'
  );

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
              <strong className="text-slate-800">Assigned Officer:</strong>{' '}
              {complaint.assignedStaffName || 'Pending Assignment'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Details on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Statement */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Description & Facts
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </div>

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

          {/* Departmental Communications / Remarks */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Department Communication & Updates ({visibleRemarks.length})
            </h2>

            {visibleRemarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No official remarks logged by the department yet. Status progress updates appear on the timeline.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleRemarks.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-lg border text-xs ${
                      rem.isInternal
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {rem.authorName}
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({rem.authorRole.replace('_', ' ')})
                        </span>
                        {rem.isInternal && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                            Internal Note
                          </span>
                        )}
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

          {/* Resolution & Feedback Section (FR-FB-001) */}
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
                    This complaint has been marked resolved. Please rate the service quality and resolution turnaround:
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

                  <textarea
                    rows={2}
                    placeholder="Optional feedback comments for departmental service improvement..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-campus-700"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="btn-primary text-xs"
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Satisfaction Rating'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Status Transition Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Lifecycle Progress Timeline
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.statusHistory.map((item, idx) => (
                <div key={item.id} className="relative text-xs">
                  {/* Timeline Node dot */}
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
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      By {item.changedByName} ({item.changedByRole})
                    </div>
                    {item.comment && (
                      <div className="mt-1 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] leading-relaxed">
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
