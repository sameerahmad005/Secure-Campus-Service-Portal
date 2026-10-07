import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, adminService } from '../../services';
import type { Department, ComplaintCategory, ComplaintPriority } from '../../types';
import {
  ArrowLeft,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Paperclip,
  X,
} from 'lucide-react';

export const CreateComplaintPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('IT_NETWORK');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) {
        setDepartmentId(depts[0].id);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFileError(null);

    // Simulated file validation per SECURITY.md
    for (const f of selected) {
      if (f.size > 5 * 1024 * 1024) {
        setFileError(`File "${f.name}" exceeds the maximum allowed size of 5 MB.`);
        return;
      }
      const allowed = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'];
      if (!allowed.includes(f.type) && !f.name.endsWith('.pdf')) {
        setFileError(`File format "${f.type || f.name}" is not permitted. Only PDF, PNG, JPG, and TXT are accepted.`);
        return;
      }
    }

    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !description.trim() || !departmentId) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await complaintService.createComplaint(currentUser, {
        title,
        departmentId,
        category,
        priority,
        location,
        description,
        attachmentFiles: files,
      });
      navigate(`/student/complaints/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/student" className="hover:text-slate-900">
          Dashboard
        </Link>
        <span>/</span>
        <Link to="/student/complaints" className="hover:text-slate-900">
          Complaints
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Lodge New Ticket</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lodge a Grievance or Service Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit an official ticket for routing to the responsible campus department
          </p>
        </div>
        <Link to="/student/complaints" className="btn-secondary text-xs">
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

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Complaint Subject / Brief Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g., Water leakage in Room 204 or Wi-Fi disconnection in library"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Responsible Department <span className="text-rose-500">*</span>
            </label>
            <select
              id="department"
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700 bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Complaint Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700 bg-white"
            >
              <option value="IT_NETWORK">IT & Campus Network</option>
              <option value="INFRASTRUCTURE">Civil / Works Maintenance</option>
              <option value="HOSTEL">Hostel & Dining Hall</option>
              <option value="LIBRARY">Library Facilities</option>
              <option value="ACADEMIC">Academic / Classroom</option>
              <option value="SANITATION">Sanitation & Hygiene</option>
              <option value="ADMINISTRATIVE">Administrative Affairs</option>
              <option value="OTHER">Other Issues</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Urgency / Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700 bg-white"
            >
              <option value="LOW">Low (Routine maintenance)</option>
              <option value="MEDIUM">Medium (Normal daily disruption)</option>
              <option value="HIGH">High (Impacts ongoing academic activity)</option>
              <option value="CRITICAL">Critical (Immediate safety or hazard)</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Campus Location / Hall / Room
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., Sir Syed Hall (North), Room 48 or Dept of Physics Lab"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            required
            placeholder="Provide explicit facts, exact symptoms, recurrence times, and any prior communication regarding this issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 focus:border-campus-700"
          />
        </div>

        {/* File Upload / Evidence Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Supporting Evidence / Attachments (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-campus-400 rounded-xl p-4 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-700 font-medium">
              Click to select or drag and drop supporting photos or documents
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Accepted formats: PDF, PNG, JPG, TXT (Maximum 5 MB per file)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-2 text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-campus-50 file:text-campus-900 hover:file:bg-campus-100 cursor-pointer"
            />
          </div>

          {fileError && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Selected Attachments ({files.length}):
              </span>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(f.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Tickets are logged in the immutable audit log and assigned to departmental officers.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs sm:text-sm"
          >
            {isSubmitting ? 'Registering Ticket...' : 'Submit Complaint'}
            <FileCheck2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
