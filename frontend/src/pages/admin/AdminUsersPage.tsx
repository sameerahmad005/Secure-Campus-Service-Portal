import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import type { User } from '../../types';
import { Users, Shield, Check, X, ShieldAlert } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    adminService.getUsers().then(setUsers);
  }, []);

  const handleToggleActive = async (userId: string) => {
    if (!currentUser) return;
    const updated = await adminService.toggleUserActiveStatus(currentUser, userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Campus User Directory & Access Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Role bindings, enrollment references, and active account status controls (FR-USER-001/002)
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">User & Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Identity Ref</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {u.studentId || u.employeeId || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.departmentName || 'Central'}
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                        <X className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded border transition-colors ${
                        u.isActive
                          ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Suspend Access' : 'Reactivate'}
                    </button>
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
