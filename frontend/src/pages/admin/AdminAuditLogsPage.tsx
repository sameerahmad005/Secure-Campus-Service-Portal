import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import type { AuditLog } from '../../types';
import { History, Shield, Search, ArrowDownUp } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAuditLogs().then(setLogs);
  }, []);

  const filtered = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Immutable Administrative Event Trail (FR-AUDIT-001/002)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Security & Operational Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Traceable chronological record of administrative logins, case status changes, and notices
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search audit trail by actor, action type, target ticket, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-campus-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold font-mono text-[11px]">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Actor Identity</th>
                <th className="px-6 py-3">Target Entity</th>
                <th className="px-6 py-3">Details / Parameters</th>
                <th className="px-6 py-3 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {log.actorRole} ({log.actorId})
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700 text-[11px]">
                    {log.targetEntity}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs leading-relaxed text-[11px]">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress}
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
