import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceRequestService } from '../../services';
import type { ServiceRequest, ServiceRequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search } from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    serviceRequestService
      .getRequests({
        status: statusFilter !== 'ALL' ? (statusFilter as ServiceRequestStatus) : undefined,
      })
      .then(setRequests);
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System-Wide Service Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitoring certificate applications, library clearances, and campus IT services
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Filter by Stage:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-campus-700"
        >
          <option value="ALL">All Stages</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Service & Student</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Officer</th>
                <th className="px-6 py-3">Lodged</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    {r.requestNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{r.serviceName}</div>
                    <div className="text-[11px] text-slate-500">{r.studentName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{r.departmentName}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {r.assignedStaffName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/student/requests/${r.id}`}
                      className="btn-secondary text-[11px] py-1 px-2.5 inline-flex"
                    >
                      View →
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
