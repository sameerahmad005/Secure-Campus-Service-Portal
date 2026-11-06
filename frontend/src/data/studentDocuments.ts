import type { User } from '../types';
import type { DocumentSpec } from '../utils/documentDownload';
import { getStudentBioData, formatDate } from './studentProfile';
import { getMedia } from './studentMedia';
import { SUBJECT_ATTENDANCE, ATTENDANCE_TERM } from './attendance';

const CREDITS: Record<string, number> = { 'CS-301': 4, 'CS-302': 4, 'CS-303': 4, 'CS-304': 4, 'CS-305L': 2, 'CS-306': 3 };

const EXAM_DATES: Record<string, string> = {
  'CS-301': '15 Nov 2026',
  'CS-302': '18 Nov 2026',
  'CS-303': '21 Nov 2026',
  'CS-304': '24 Nov 2026',
  'CS-306': '27 Nov 2026',
};

const media = (signatory: string) => ({
  photo: getMedia('photo')?.dataUrl ?? null,
  signature: getMedia('signature')?.dataUrl ?? null,
  signatory,
});

export function buildRegistrationCard(user: User | null): DocumentSpec {
  const bio = getStudentBioData(user);
  const totalCredits = SUBJECT_ATTENDANCE.reduce((s, c) => s + (CREDITS[c.code] ?? 0), 0);
  return {
    title: 'Registration Card',
    reference: `REG-${bio.enrolmentNo}-ODD26`,
    issuedBy: 'Office of the Registrar, Academic Section',
    holderName: bio.fullName,
    rows: [
      { label: 'Enrolment no.', value: bio.enrolmentNo },
      { label: 'Faculty no.', value: bio.facultyNo },
      { label: "Father's name", value: bio.fatherName },
      { label: 'Date of birth', value: formatDate(bio.dateOfBirth) },
      { label: 'Course', value: bio.course },
      { label: 'Semester', value: `${ATTENDANCE_TERM.semester}, ${ATTENDANCE_TERM.session}` },
      { label: 'Hall', value: bio.hall },
    ],
    table: {
      headers: ['Code', 'Course title', 'Type', 'Credits'],
      rows: [
        ...SUBJECT_ATTENDANCE.map((c) => [c.code, c.title, c.type, String(CREDITS[c.code] ?? '-')]),
        ['', 'Total', '', String(totalCredits)],
      ],
    },
    note: 'This card confirms your registration for the courses listed. Keep it until results for this semester are declared.',
    media: media('Assistant Registrar (Academic)'),
  };
}

export function buildAdmitCard(user: User | null): DocumentSpec {
  const bio = getStudentBioData(user);
  return {
    title: 'Exam Admit Card',
    reference: `COE-${bio.enrolmentNo}-ODD26`,
    issuedBy: 'Controller of Examinations',
    holderName: bio.fullName,
    rows: [
      { label: 'Enrolment no.', value: bio.enrolmentNo },
      { label: 'Faculty no.', value: bio.facultyNo },
      { label: 'Course', value: bio.course },
      { label: 'Examination', value: `End-semester, ${ATTENDANCE_TERM.session}` },
      { label: 'Centre', value: 'Z.H. College of Engineering & Technology, Hall 2' },
      { label: 'Desk', value: '42' },
    ],
    table: {
      headers: ['Paper', 'Title', 'Date', 'Time'],
      rows: SUBJECT_ATTENDANCE.filter((c) => EXAM_DATES[c.code]).map((c) => [c.code, c.title, EXAM_DATES[c.code], '09:00-12:00']),
    },
    note: 'Bring this card and your ID card to every paper. Reach the centre 30 minutes early. Phones and smart watches are not allowed in the hall.',
    media: media('Controller of Examinations'),
  };
}

export const DOWNLOADABLE_DOCUMENTS = [
  {
    id: 'registration-card',
    name: 'Registration Card',
    description: `Courses you are registered for in ${ATTENDANCE_TERM.semester}, ${ATTENDANCE_TERM.session}.`,
    issuedBy: 'Registrar, Academic Section',
    build: buildRegistrationCard,
  },
  {
    id: 'admit-card',
    name: 'Exam Admit Card',
    description: 'End-semester exam schedule, centre and desk number.',
    issuedBy: 'Controller of Examinations',
    build: buildAdmitCard,
  },
];
