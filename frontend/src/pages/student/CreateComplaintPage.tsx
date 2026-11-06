import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, adminService } from '../../services';
import type { Department, ComplaintPriority, ComplaintCategory } from '../../types';
import {
  SERVICE_CATEGORIES,
  ATTENDANCE_FORM_SCHEMA,
  ATTENDANCE_COMPLAINT_TYPES,
  RECORDED_ATTENDANCE_STATUSES,
} from '../../mocks/serviceCatalogData';
import type { CategoryConfig, SubcategoryConfig } from '../../types/serviceCatalog';
import {
  ArrowLeft,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Paperclip,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CreateComplaintPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('ACADEMIC');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('sub_attendance');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [location, setLocation] = useState('');

  // Standard Complaint Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Attendance-Specific Fields (Stakeholder.pdf Page 4)
  const [attendanceCourse, setAttendanceCourse] = useState('B.Tech Computer Engineering');
  const [attendanceSemester, setAttendanceSemester] = useState('Semester 5');
  const [attendanceDepartment, setAttendanceDepartment] = useState('Department of Computer Science');
  const [attendanceSubject, setAttendanceSubject] = useState('CS-301 Operating Systems');
  const [attendanceFaculty, setAttendanceFaculty] = useState('Dr. Farhan Siddiqui');
  const [attendanceComplaintType, setAttendanceComplaintType] = useState<string>(
    ATTENDANCE_COMPLAINT_TYPES[0]
  );
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordedAttendanceStatus, setRecordedAttendanceStatus] = useState<string>(
    RECORDED_ATTENDANCE_STATUSES[0]
  );

  // Attachments
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Submission State & Confirmation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    ticketNumber: string;
    title: string;
    departmentName: string;
    category: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    adminService.getDepartments().then(setDepartments);
  }, []);

  const activeCategory: CategoryConfig | undefined = SERVICE_CATEGORIES.find(
    (c) => c.code === selectedCategoryCode
  );

  const activeSubcategory: SubcategoryConfig | undefined = activeCategory?.subcategories.find(
    (s) => s.id === selectedSubcategoryId
  ) || activeCategory?.subcategories[0];

  const isAttendanceDispute = activeSubcategory?.code === 'ATTENDANCE_DISPUTE';

  // Handle Category Change
  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategoryCode(categoryCode);
    const cat = SERVICE_CATEGORIES.find((c) => c.code === categoryCode);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategoryId(cat.subcategories[0].id);
      setPriority(cat.subcategories[0].routingRule.defaultPriority);
    }
    setFieldErrors({});
    setGeneralError(null);
  };

  // Handle Subcategory Change
  const handleSubcategoryChange = (subcatId: string) => {
    setSelectedSubcategoryId(subcatId);
    const sub = activeCategory?.subcategories.find((s) => s.id === subcatId);
    if (sub) {
      setPriority(sub.routingRule.defaultPriority);
    }
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFileError(null);

    for (const f of selected) {
      if (f.size > 5 * 1024 * 1024) {
        setFileError(`File "${f.name}" exceeds the maximum allowed limit of 5 MB.`);
        return;
      }
      const allowed = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain'];
      if (!allowed.includes(f.type) && !f.name.endsWith('.pdf')) {
        setFileError(`File "${f.name}" has an unsupported format. Please upload PDF, PNG, or JPG.`);
        return;
      }
    }

    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (isAttendanceDispute) {
      if (!attendanceCourse.trim()) errors.attendanceCourse = 'Course is required.';
      if (!attendanceSemester.trim()) errors.attendanceSemester = 'Semester is required.';
      if (!attendanceSubject.trim()) errors.attendanceSubject = 'Subject code / name is required.';
      if (!attendanceFaculty.trim()) errors.attendanceFaculty = 'Faculty name is required.';
      if (!attendanceDate) errors.attendanceDate = 'Attendance date is required.';
      if (!description.trim()) errors.description = 'Problem details / description is required.';
    } else {
      if (!title.trim()) errors.title = 'Title / summary is required.';
      if (!description.trim()) errors.description = 'Detailed description is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!validateForm()) {
      setGeneralError('Please correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const targetDept =
        departments.find((d) => d.id === activeSubcategory?.routingRule.targetDepartmentId) ||
        departments[0];

      const ticketTitle = isAttendanceDispute
        ? `${attendanceSubject}: ${attendanceComplaintType} on ${attendanceDate}`
        : title;

      const dynamicFormData = isAttendanceDispute
        ? {
            studentId: currentUser.studentId || '2023-CS-042',
            studentName: currentUser.name,
            course: attendanceCourse,
            semester: attendanceSemester,
            department: attendanceDepartment,
            subject: attendanceSubject,
            facultyName: attendanceFaculty,
            complaintType: attendanceComplaintType,
            dateOfAttendance: attendanceDate,
            recordedAttendanceStatus: recordedAttendanceStatus,
            description,
          }
        : undefined;

      const attendanceData = isAttendanceDispute
        ? {
            studentId: currentUser.studentId || '2023-CS-042',
            studentName: currentUser.name,
            course: attendanceCourse,
            semester: attendanceSemester,
            department: attendanceDepartment,
            subject: attendanceSubject,
            facultyName: attendanceFaculty,
            complaintType: attendanceComplaintType as any,
            dateOfAttendance: attendanceDate,
            recordedAttendanceStatus: recordedAttendanceStatus as any,
            description,
            supportingProofFileName: files.length > 0 ? files[0].name : undefined,
          }
        : undefined;

      const created = await complaintService.createComplaint(currentUser, {
        title: ticketTitle,
        description,
        departmentId: targetDept?.id || 'dept_cs',
        category: selectedCategoryCode as ComplaintCategory,
        subcategoryId: activeSubcategory?.id,
        subcategoryName: activeSubcategory?.name,
        priority,
        location: isAttendanceDispute ? `${attendanceDepartment}, Room / Lab` : location,
        attachmentFiles: files,
        dynamicFormData,
        attendanceData,
      });

      setSubmittedTicket({
        id: created.id,
        ticketNumber: created.ticketNumber,
        title: created.title,
        departmentName: created.departmentName,
        category: created.category,
        createdAt: created.createdAt,
      });
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Screen Modal
  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Complaint Registered
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-3">
              Ticket Successfully Created
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your grievance has been assigned a unique tracking identifier and forwarded to the responsible department desk.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2.5 max-w-lg mx-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Ticket Identifier:</span>
              <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                {submittedTicket.ticketNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-medium text-slate-800">{submittedTicket.category.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Assigned Department:</span>
              <span className="font-semibold text-slate-900">{submittedTicket.departmentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Lodged On:</span>
              <span className="text-slate-700">{new Date(submittedTicket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Initial Status:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                SUBMITTED (Awaiting Review)
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/student/complaints/${submittedTicket.id}`)}
              className="btn-primary w-full sm:w-auto text-xs"
            >
              Track Ticket Status →
            </button>
            <button
              onClick={() => {
                setSubmittedTicket(null);
                setTitle('');
                setDescription('');
                setFiles([]);
              }}
              className="btn-secondary w-full sm:w-auto text-xs"
            >
              Lodge Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Configurable dynamic intake for attendance disputes, departmental grievances, and facility issues
          </p>
        </div>
        <Link to="/student/complaints" className="btn-secondary text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </Link>
      </div>

      {generalError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-lg p-3.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Step 1: Category & Subcategory Selection */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-campus-700" />
              1. Classification & Service Scope
            </span>
            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">
              Configurable Catalog
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category Group <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                value={selectedCategoryCode}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name} ({cat.status === 'VERIFIED_ANALYSIS' ? 'Verified' : 'Proposed'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Specific Subcategory <span className="text-rose-500">*</span>
              </label>
              <select
                id="subcategory"
                value={activeSubcategory?.id || ''}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
              >
                {activeCategory?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} [{sub.status === 'VERIFIED_ANALYSIS' ? 'Stakeholder PDF' : 'Proposed'}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeSubcategory && (
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
              <span>
                <strong>Routing Rule:</strong> {activeSubcategory.description}
              </span>
              <span className="text-[10px] text-campus-700 font-medium">
                Target: {activeSubcategory.routingRule.targetDepartmentName} (SLA: {activeSubcategory.routingRule.slaDaysProposed}d)
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Form Branch A: ATTENDANCE DISPUTE FORM (Stakeholder.pdf Page 4) */}
        {isAttendanceDispute ? (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-campus-700" />
                  Attendance Complaint Details
                </h2>
                <p className="text-xs text-slate-500">
                  Required options & fields specified by Stakeholder Analysis (Stakeholder.pdf)
                </p>
              </div>
              <span className="text-[10px] font-semibold text-campus-700 bg-campus-50 border border-campus-200 px-2 py-0.5 rounded">
                Verified Stakeholder Schema
              </span>
            </div>

            {/* Student Details (Pre-filled / Verified) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Student ID / Enrollment Number
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentUser?.studentId || '2023-CS-042'}
                  className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 bg-slate-100 text-slate-700 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={currentUser?.name || 'Tariq Ahmad'}
                  className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Course & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Course / Academic Degree <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attendanceCourse}
                  onChange={(e) => setAttendanceCourse(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  <option value="B.Tech Computer Engineering">B.Tech Computer Engineering</option>
                  <option value="B.Tech Electrical Engineering">B.Tech Electrical Engineering</option>
                  <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                  <option value="B.Sc (Hons) Computer Science">B.Sc (Hons) Computer Science</option>
                  <option value="M.Sc Computer Science">M.Sc Computer Science</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                  <option value="Other">Other Degree Program</option>
                </select>
                {fieldErrors.attendanceCourse && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.attendanceCourse}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attendanceSemester}
                  onChange={(e) => setAttendanceSemester(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={`Semester ${s}`}>
                      Semester {s}
                    </option>
                  ))}
                </select>
                {fieldErrors.attendanceSemester && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.attendanceSemester}</p>
                )}
              </div>
            </div>

            {/* Department, Subject, Faculty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attendanceDepartment}
                  onChange={(e) => setAttendanceDepartment(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  <option value="Department of Computer Science">Department of Computer Science</option>
                  <option value="Department of Business Administration">Department of Business Administration</option>
                  <option value="Department of Electrical Engineering">Department of Electrical Engineering</option>
                  <option value="Department of Physics">Department of Physics</option>
                  <option value="Department of Mathematics">Department of Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subject / Subject Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., CS-301 Operating Systems"
                  value={attendanceSubject}
                  onChange={(e) => setAttendanceSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
                {fieldErrors.attendanceSubject && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.attendanceSubject}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Farhan Siddiqui"
                  value={attendanceFaculty}
                  onChange={(e) => setAttendanceFaculty(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
                {fieldErrors.attendanceFaculty && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.attendanceFaculty}</p>
                )}
              </div>
            </div>

            {/* Complaint Type, Date of Attendance, Recorded Attendance Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attendanceComplaintType}
                  onChange={(e) => setAttendanceComplaintType(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  {ATTENDANCE_COMPLAINT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Attendance <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
                {fieldErrors.attendanceDate && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.attendanceDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Recorded Attendance Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={recordedAttendanceStatus}
                  onChange={(e) => setRecordedAttendanceStatus(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
                >
                  {RECORDED_ATTENDANCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description / Problem ki details <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                required
                placeholder="Explain the attendance discrepancy in detail (e.g., attended lecture, physically signed attendance sheet, substitute lecture taken, etc.)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.description}</p>
              )}
            </div>
          </div>
        ) : (
          /* Dynamic Form Branch B: STANDARD COMPLAINT FORM */
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Complaint Subject / Brief Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Water leakage in corridor or Wi-Fi disconnection in library"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.title}</p>
              )}
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
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700 bg-white"
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
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
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
                placeholder="Provide explicit facts, exact symptoms, recurrence times, and any prior communication regarding this issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-campus-700"
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Supporting Proof / File Upload Section */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Supporting Proof / Evidence ({isAttendanceDispute ? 'Class record, LMS screenshot, etc.' : 'Optional'})
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-campus-400 rounded-xl p-4 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-700 font-medium">
              Click to select or drag and drop supporting class records, screenshots, or receipts
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
                Attached Proof Files ({files.length}):
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

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Tickets generate a unique complaint ID and enter the auditable lifecycle.
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
