import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6 w-full max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Student Profile & Identity Record
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Verified academic profile parameters associated with your institutional credentials
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200">
          <div className="w-20 h-20 rounded-full bg-campus-900 text-campus-100 flex items-center justify-center text-2xl font-bold border-2 border-campus-700 shadow-sm overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser?.name.charAt(0)
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
            <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                ID: {currentUser?.studentId || '2023-CS-042'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active Student Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Mail className="w-3 h-3" /> Institutional Email
            </span>
            <div className="text-slate-900 font-medium">{currentUser?.email}</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Phone className="w-3 h-3" /> Contact Number
            </span>
            <div className="text-slate-900 font-medium">{currentUser?.phone || '+91 98765 43210'}</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building className="w-3 h-3" /> Department / Faculty
            </span>
            <div className="text-slate-900 font-medium">
              {currentUser?.departmentName || 'Department of Computer Science'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Academic Program
            </span>
            <div className="text-slate-900 font-medium">B.Tech (Computer Engineering)</div>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-400 italic">
          Profile demographic fields are synced from the campus student registrar directory. To update personal records, please submit an Identity/Record Update request to the Proctorial Office.
        </div>
      </div>
    </div>
  );
};
