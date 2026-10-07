import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceRequestService } from '../../services';
import type { ServiceDefinition } from '../../types';
import {
  ArrowLeft,
  FileCheck2,
  Clock,
  AlertCircle,
  Building,
  HelpCircle,
} from 'lucide-react';

export const CreateRequestPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId') || '';

  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serviceRequestService.getAvailableServices().then((list) => {
      setServices(list);
      if (!selectedServiceId && list.length > 0) {
        setSelectedServiceId(list[0].id);
      }
    });
  }, [selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedService) return;

    // Validate required fields
    for (const f of selectedService.formFields) {
      if (f.required && !formData[f.name]?.trim()) {
        setError(`Please fill in "${f.label}".`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await serviceRequestService.createRequest(currentUser, {
        serviceId: selectedService.id,
        formData,
      });
      navigate(`/student/requests/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/student" className="hover:text-slate-900">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/student/requests" className="hover:text-slate-900">
          Service Requests
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Apply</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Apply for Campus Service / Clearance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fill required information for official departmental processing
          </p>
        </div>
        <Link to="/student/requests" className="btn-secondary text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div>
          <label htmlFor="serviceSelect" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Choose Campus Service <span className="text-rose-500">*</span>
          </label>
          <select
            id="serviceSelect"
            value={selectedServiceId}
            onChange={(e) => {
              setSelectedServiceId(e.target.value);
              setFormData({});
            }}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700 bg-white"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.departmentName})
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">{selectedService.departmentName}</span>
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Est. Turnaround: {selectedService.estimatedTurnaroundDays} business days
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{selectedService.description}</p>
          </div>
        )}

        {/* Dynamic Form Fields based on Service Definition */}
        {selectedService && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Application Details
            </h2>

            {selectedService.formFields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700 bg-white"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    rows={3}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
                  />
                ) : (
                  <input
                    id={field.id}
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Applications are tracked through assigned reference numbers.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs sm:text-sm"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Service Request'}
            <FileCheck2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
