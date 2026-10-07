import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import type { Role } from '../../types';

export const DevNoticeBanner: React.FC = () => {
  const { role, switchRole, resetMockData, availableAccounts } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as Role);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong className="font-semibold">DEVELOPMENT PROTOTYPE:</strong> Data and client-side session are simulated for UI/UX testing. Frontend role switching demonstrates UX views only; server-side authorization will be enforced upon backend integration.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded px-2 py-1 shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-medium text-slate-700">Active Persona:</span>
          <select
            value={role || 'STUDENT'}
            onChange={handleRoleChange}
            className="bg-transparent font-medium text-amber-950 focus:outline-none cursor-pointer"
            aria-label="Switch development mock role"
          >
            {availableAccounts.map((acc) => (
              <option key={acc.id} value={acc.role}>
                {acc.role} ({acc.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetMockData}
          title="Reset local mock database to initial state"
          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Mock Data</span>
        </button>
      </div>
    </div>
  );
};
