import type { User } from '../types';

/** Registrar-held bio-data for the signed-in student. Sample values until the profile API returns them. */
export interface StudentBioData {
  fullName: string;
  email: string;
  enrolmentNo: string;
  facultyNo: string;
  course: string;
  gender: string;
  mobile: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  fatherName: string;
  motherName: string;
  bloodGroup: string;
  hall: string;
  address: string;
  session: string;
  validThrough: string;
}

export const COURSES = [
  'B.Tech Computer Engineering',
  'B.Tech Electrical Engineering',
  'B.Tech Mechanical Engineering',
  'B.Tech Civil Engineering',
  'M.Tech Computer Science',
  'B.Sc (Hons) Computer Science',
  'M.Sc Computer Science',
  'MBA',
  'B.Com (Hons)',
  'B.A (Hons)',
];

export const GENDERS = ['Male', 'Female', 'Other'];

export function getStudentBioData(user: User | null): StudentBioData {
  return {
    fullName: user?.name || 'Tariq Ahmad',
    email: user?.email || 'student.tariq@amu.ac.in',
    enrolmentNo: user?.studentId || '2023-CS-042',
    facultyNo: '23COB102',
    course: 'B.Tech Computer Engineering',
    gender: 'Male',
    mobile: user?.phone || '+91 98765 43210',
    dateOfBirth: '2003-08-14',
    fatherName: 'Mr. Ahmadullah Khan',
    motherName: 'Mrs. Shabana Begum',
    bloodGroup: 'O+',
    hall: user?.hallName || 'Sir Syed Hall (North)',
    address: 'Civil Lines, Aligarh, Uttar Pradesh 202001',
    session: '2026–27',
    validThrough: '30 June 2027',
  };
}

export const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
