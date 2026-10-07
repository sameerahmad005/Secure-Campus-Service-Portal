import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceRequestService } from '../../services';
import type { ServiceRequest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(false);
      try {
        const data = await serviceRequestService.getRequestById(id);
        setRequest(data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (!request) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The specified service request ID could not be loaded.</p>
        <Link to="/student/requests" className="btn-secondary text-xs mt-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/student" className="hover:text-slate-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/student/requests" className="hover:text-slate-900">
            Service Requests
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-slate-800">
            {request.requestNumber}
          </span>
        </div>

        <Link to="/student/requests" className="btn-secondary text-xs self-start sm:self-auto">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to requests
        </Link>
      </div>

      {/* Main Request Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded border border-slate-200">
              {request.requestNumber}
            </span>
            <StatusBadge status={request.status} />
            <span className="text-xs text-slate-500 font-medium">
              Category: {request.category.replace('_', ' ')}
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Lodged: {new Date(request.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {request.serviceName}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800">Department:</strong> {request.departmentName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800">Handling Officer:</strong>{' '}
              {request.assignedStaffName || 'Assigned to Section Lead'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Submitted Application Parameters
            </h2>

            <div className="divide-y divide-slate-100 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden text-xs">
              {Object.entries(request.formData).map(([key, value]) => (
                <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-slate-900 font-medium sm:text-right">
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {request.status === 'FULFILLED' && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Service Application Completed & Fulfilled
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your application has been processed and approved by {request.departmentName}. Any digital credentials or certificate copies have been sent to your registered institutional email.
                </p>
                {request.completedAt && (
                  <span className="text-[10px] text-emerald-700 mt-2 block font-medium">
                    Fulfilled on {new Date(request.completedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Tracking Timeline
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {request.statusHistory.map((item, idx) => (
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
