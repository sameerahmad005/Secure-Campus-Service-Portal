/** Attendance for the current semester. Sample data until the department attendance API is connected. */

export const ATTENDANCE_THRESHOLD = 75;

export interface SubjectAttendance {
  code: string;
  title: string;
  faculty: string;
  type: 'Theory' | 'Lab';
  attended: number;
  held: number;
}

export const ATTENDANCE_TERM = {
  semester: 'Semester V',
  session: 'Odd semester 2026–27',
  asOf: '2026-11-06',
};

export const SUBJECT_ATTENDANCE: SubjectAttendance[] = [
  { code: 'CS-301', title: 'Operating Systems', faculty: 'Dr. Farhan Siddiqui', type: 'Theory', attended: 38, held: 42 },
  { code: 'CS-302', title: 'Database Systems', faculty: 'Prof. Nazia Rahman', type: 'Theory', attended: 36, held: 40 },
  { code: 'CS-303', title: 'Computer Networks', faculty: 'Dr. Imran Haider', type: 'Theory', attended: 30, held: 38 },
  { code: 'CS-304', title: 'Algorithms', faculty: 'Dr. Sana Qureshi', type: 'Theory', attended: 34, held: 40 },
  { code: 'CS-305L', title: 'Database Systems Lab', faculty: 'Prof. Nazia Rahman', type: 'Lab', attended: 18, held: 20 },
  { code: 'CS-306', title: 'Software Engineering', faculty: 'Dr. Aamir Khan', type: 'Theory', attended: 25, held: 36 },
];

export const percent = (attended: number, held: number) => (held === 0 ? 100 : (attended / held) * 100);

/** Consecutive classes a student must attend to reach the threshold. */
export const classesNeeded = (attended: number, held: number, threshold = ATTENDANCE_THRESHOLD) => {
  const t = threshold / 100;
  if (held === 0 || attended / held >= t) return 0;
  return Math.ceil((t * held - attended) / (1 - t));
};

/** Classes a student can miss and still stay at or above the threshold. */
export const classesCanMiss = (attended: number, held: number, threshold = ATTENDANCE_THRESHOLD) => {
  const t = threshold / 100;
  return Math.max(0, Math.floor(attended / t - held));
};

export const attendanceSummary = () => {
  const attended = SUBJECT_ATTENDANCE.reduce((s, x) => s + x.attended, 0);
  const held = SUBJECT_ATTENDANCE.reduce((s, x) => s + x.held, 0);
  const overall = percent(attended, held);
  const shortSubjects = SUBJECT_ATTENDANCE.filter((s) => percent(s.attended, s.held) < ATTENDANCE_THRESHOLD);
  return { attended, held, overall, shortSubjects, eligible: overall >= ATTENDANCE_THRESHOLD };
};
