import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceRequestService } from '../../services';
import type { ServiceRequest, ServiceDefinition } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileCheck2,
  PlusCircle,
  ArrowRight,
  Clock,
  Building,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';

export const StudentRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'MY_REQUESTS' | 'CATALOG'>('MY_REQUESTS');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setIsLoading(false);
      try {
        const [reqList, srvList] = await Promise.all([
          serviceRequestService.getRequests({ studentId: currentUser.id }),
          serviceRequestService.getAvailableServices(),
        ]);
        setRequests(reqList);
        setAvailableServices(srvList);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Campus Service Requests & Clearances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Apply for certificates, network credentials, hostel services, and library clearances
          </p>
        </div>

        <Link to="/student/requests/new" className="btn-primary text-xs sm:text-sm self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          Apply for New Service
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'MY_REQUESTS'
              ? 'border-campus-900 text-campus-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Applications & Trackers ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'CATALOG'
              ? 'border-campus-900 text-campus-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Available Campus Services Catalog ({availableServices.length})
        </button>
      </div>

      {activeTab === 'MY_REQUESTS' ? (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No active service requests</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have not filed any certificate or service requests yet.
              </p>
              <button
                onClick={() => setActiveTab('CATALOG')}
                className="mt-3 text-xs font-semibold text-campus-700 hover:text-campus-900"
              >
                Browse service catalog →
              </button>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {req.requestNumber}
                    </span>
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-slate-400">
                      Dept: {req.departmentName}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    <Link to={`/student/requests/${req.id}`}>
                      {req.serviceName}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.assignedStaffName && (
                      <span className="text-slate-700 font-medium">
                        Processing Officer: {req.assignedStaffName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    to={`/student/requests/${req.id}`}
                    className="btn-secondary text-xs"
                  >
                    View Status & Fulfillment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Available Services Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-campus-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-campus-800 bg-campus-50 px-2 py-0.5 rounded border border-campus-200">
                    {srv.departmentName}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    Est. {srv.estimatedTurnaroundDays} days
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {srv.formFields.length} required fields
                </span>
                <Link
                  to={`/student/requests/new?serviceId=${srv.id}`}
                  className="btn-primary text-xs"
                >
                  Apply Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
