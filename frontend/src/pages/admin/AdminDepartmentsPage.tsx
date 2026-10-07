import React, { useState, useEffect } from 'react';
import { adminService, serviceRequestService } from '../../services';
import type { Department, ServiceDefinition } from '../../types';
import { Building, Layers, Mail, MapPin } from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<ServiceDefinition[]>([]);

  useEffect(() => {
    Promise.all([
      adminService.getDepartments(),
      serviceRequestService.getAvailableServices(),
    ]).then(([depts, srvs]) => {
      setDepartments(depts);
      setServices(srvs);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Departments & Campus Services Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configured organizational units, service catalogs, and fulfillment routes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((d) => {
          const deptServices = services.filter((s) => s.departmentId === d.id);
          return (
            <div
              key={d.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-campus-800 bg-campus-50 border border-campus-200 px-2 py-0.5 rounded">
                    CODE: {d.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{d.name}</h2>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>

              <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.location}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Linked Services ({deptServices.length}):
                </span>
                {deptServices.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No direct service catalog entries</span>
                ) : (
                  <div className="space-y-1">
                    {deptServices.map((s) => (
                      <div
                        key={s.id}
                        className="text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between"
                      >
                        <span>{s.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {s.estimatedTurnaroundDays} days SLA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
