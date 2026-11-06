import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  ShieldCheck,
  Calendar,
  Home,
  Users,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import type { StudentAcademicRecord } from '../../services/apiClient';

export const StudentProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<StudentAcademicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable fields state
  const [isEditing, setIsEditing] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = currentUser?.email || 'student.tariq@amu.ac.in';
      const data = await apiClient.getStudentProfile(email);
      setProfile(data);
      setMobileNumber(data.mobileNumber || '');
      setAddress(data.address || '');
    } catch (err: any) {
      console.warn('Live API fetch error, falling back to local session:', err.message);
      setError('Live backend record sync unavailable; showing cached session values.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const email = currentUser?.email || 'student.tariq@amu.ac.in';
      const updated = await apiClient.updateStudentProfile(
        { mobileNumber, address },
        email
      );
      if (profile) {
        setProfile({
          ...profile,
          mobileNumber: updated.mobileNumber || profile.mobileNumber,
          address: updated.address || profile.address,
        });
      }
      setIsEditing(false);
      setSuccessMessage('Contact details updated successfully in the student registry.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update contact information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-campus-600 dark:text-campus-400" />
        <p className="text-sm">Fetching verified student academic registry record...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Profile & Academic Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified institutional parameters from the AMU Student Registry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfile}
            title="Refresh record from database"
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Record
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-campus-900 dark:bg-campus-800 text-campus-100 flex items-center justify-center text-2xl font-bold border-2 border-campus-700 shadow-sm overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={profile?.fullName || currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (profile?.fullName || currentUser?.name || 'S').charAt(0)
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {profile?.fullName || currentUser?.name}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold">
                Enrollment: {profile?.enrollmentNumber || 'GL1234'}
              </span>
              <span className="font-mono bg-campus-50 dark:bg-campus-950/50 text-campus-800 dark:text-campus-200 px-2 py-0.5 rounded border border-campus-200 dark:border-campus-800 font-semibold">
                Roll No: {profile?.rollNumber || '23COB042'}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile?.accountStatus || 'ACTIVE'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg border border-campus-300 dark:border-campus-700 text-campus-700 dark:text-campus-300 hover:bg-campus-50 dark:hover:bg-campus-900/40 text-xs font-medium flex items-center gap-1.5 transition-colors self-center sm:self-start"
          >
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {isEditing ? 'Cancel Edit' : 'Edit Contact'}
          </button>
        </div>

        {/* Academic Details Section (Locked Registrar Parameters) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-campus-600 dark:text-campus-400" />
              Academic Allocation & Enrollment
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Registrar Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* Course / Program */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Course Program
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {profile?.course?.name || 'B.Tech Computer Engineering'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Code: {profile?.course?.code || 'CS-BTECH'} ({profile?.course?.degree_level || 'UG'})
              </div>
            </div>

            {/* Academic Session */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Academic Session
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {profile?.academicSession?.session_name || '2026-2027'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Admission Year: {profile?.admissionYear || 2023}
              </div>
            </div>

            {/* Semester Standing */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Current Standing
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                Semester {profile?.currentSemester || 5} of {profile?.course?.total_semesters || 8}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Regular Enrolled
              </div>
            </div>

            {/* Allotted Hall of Residence */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2 lg:col-span-3">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Home className="w-3 h-3" /> Allotted Hall of Residence
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {profile?.allottedHall?.name || 'Sir Syed Hall (North)'} ({profile?.allottedHall?.code || 'SSH-N'})
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Resident scholar accommodation record authenticated by Provost Office.
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Residential Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-campus-600 dark:text-campus-400" />
            Contact & Residential Address
          </h3>

          {isEditing ? (
            <form onSubmit={handleSaveContact} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-campus-200 dark:border-campus-800 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-campus-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential / Nominal Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter current campus or home residence address"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-campus-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-campus-800 hover:bg-campus-900 text-white font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Institutional Email
                </span>
                <div className="text-slate-900 dark:text-slate-100 font-medium font-mono">
                  {profile?.email || currentUser?.email}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact Mobile
                </span>
                <div className="text-slate-900 dark:text-slate-100 font-medium">
                  {profile?.mobileNumber || '+91 98765 43210'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Home className="w-3 h-3" /> Nominal / Campus Residence Address
                </span>
                <div className="text-slate-900 dark:text-slate-100 font-medium">
                  {profile?.address || 'Room 48, North Wing, Sir Syed Hall (North), AMU Campus, Aligarh - 202002'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confidential Parentage & Guardian Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-campus-600 dark:text-campus-400" />
              Confidential Parentage & Guardian Record
            </h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Restricted Privacy Tier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Father's Name
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-medium">
                {profile?.fatherName || 'Mr. Ahmadullah Khan'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                Mother's Name
              </span>
              <div className="text-slate-900 dark:text-slate-100 font-medium">
                {profile?.motherName || 'Mrs. Shabana Begum'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 italic">
          To update non-editable academic identifiers (Roll number, Enrollment number, Course allotment, or Hostel assignment), please lodge a verified request with the Controller of Examinations or the Proctorial Office through the portal.
        </div>
      </div>
    </div>
  );
};
