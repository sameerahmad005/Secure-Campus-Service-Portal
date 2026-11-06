import type React from 'react';
import {
  IdCard,
  UserCheck,
  Ticket,
  GraduationCap,
  CreditCard,
  Award,
  Home,
  Wifi,
  Mail,
  Stethoscope,
  CalendarCheck,
} from 'lucide-react';
import type { User } from '../types';
import type { DocumentSpec } from '../utils/documentDownload';
import { getStudentBioData } from './studentProfile';
import { readLocal } from '../utils/localStore';
import { buildAdmitCard } from './studentDocuments';
import { getMedia } from './studentMedia';
import { attendanceSummary } from './attendance';

export type ServiceGroup = 'ACADEMIC' | 'FINANCE' | 'FACILITIES';

export const SERVICE_GROUPS: { id: ServiceGroup; label: string }[] = [
  { id: 'ACADEMIC', label: 'Academic and exams' },
  { id: 'FINANCE', label: 'Fees and welfare' },
  { id: 'FACILITIES', label: 'Campus living' },
];

export interface RequiredDocument {
  name: string;
  note: string;
}

export interface IssuedDocument {
  id: string;
  name: string;
  description: string;
  build: (user: User | null) => DocumentSpec;
}

export interface CampusService {
  /** Matches the serviceId used by serviceRequestService */
  id: string;
  slug: string;
  code: string;
  title: string;
  summary: string;
  group: ServiceGroup;
  /** 'instant': self-service, takes effect at once. 'request': goes to staff for approval. */
  mode: 'instant' | 'request';
  /** Information-only service: no apply, documents or activity tabs. */
  readOnly?: boolean;
  office: string;
  hours: string;
  turnaround: string;
  status: { label: string; tone: 'success' | 'info' | 'warning' };
  icon: React.ElementType;
  /** Tailwind classes for the icon tile */
  tint: string;
  actionLabel: string;
  keywords: string[];
  canDo: string[];
  steps: string[];
  requiredDocuments: RequiredDocument[];
  issuedDocuments: IssuedDocument[];
  faqs: { q: string; a: string }[];
}

const nameOf = (u: User | null) => u?.name || 'Tariq Ahmad';
const enrolOf = (u: User | null) => u?.studentId || '2023-CS-042';

export const CAMPUS_SERVICES: CampusService[] = [
  {
    id: 'srv_id_card',
    slug: 'id-card',
    code: 'IDN-101',
    title: 'Smart ID card',
    summary: 'Download your digital ID card or apply for a duplicate physical card.',
    group: 'ACADEMIC',
    mode: 'request',
    office: 'Proctorial Office',
    hours: 'Mon to Sat, 10:00 to 16:00',
    turnaround: 'Digital card now, physical card in 3 working days',
    status: { label: 'Card active', tone: 'success' },
    icon: IdCard,
    tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    actionLabel: 'View ID card',
    keywords: ['identity', 'rfid', 'duplicate', 'lost card', 'admission'],
    canDo: [
      'View and download your digital ID card',
      'Apply for a duplicate card if yours is lost or damaged',
      'Update the card after a bio-data correction',
    ],
    steps: [
      'Open the Apply tab and choose why you need a new card.',
      'If the card was lost, add the police or Proctor GD reference.',
      'Collect the new card from the Proctor counter after 3 working days.',
    ],
    requiredDocuments: [
      { name: 'Police or Proctor GD report', note: 'Only if the card was lost or stolen' },
      { name: 'Damaged card', note: 'Hand it in at the counter when you collect the new one' },
      { name: 'Fee receipt for duplicate card', note: 'Charged to your student account' },
    ],
    issuedDocuments: [
      {
        id: 'digital-id',
        name: 'Smart ID card (front and back)',
        description: 'Two-page PDF at real card size. Print double-sided.',
        build: (u) => {
          const bio = getStudentBioData(u);
          return {
            title: 'AMU Student ID Card',
            reference: `ID-${bio.enrolmentNo}`,
            issuedBy: 'Proctorial Office',
            holderName: bio.fullName,
            rows: [],
            idCard: { bio, photoUrl: getMedia('photo')?.dataUrl ?? u?.avatarUrl },
          };
        },
      },
    ],
    faqs: [
      { q: 'Is the digital card accepted at exams?', a: 'Carry the physical card to exams. The digital card works for library and hostel entry.' },
      { q: 'What does a duplicate card cost?', a: 'The fee is set by the Proctorial Office and added to your student account.' },
    ],
  },
  {
    id: 'srv_profile_correction',
    slug: 'profile-correction',
    code: 'REG-102',
    title: 'Bio-data correction',
    summary: 'Correct your name, parentage, date of birth, blood group or address.',
    group: 'ACADEMIC',
    mode: 'request',
    office: 'Registrar, Academic Section',
    hours: 'Mon to Fri, 10:00 to 16:30',
    turnaround: '2 to 3 working days',
    status: { label: 'Window open', tone: 'info' },
    icon: UserCheck,
    tint: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
    actionLabel: 'Request a correction',
    keywords: ['name', 'date of birth', 'address', 'registrar', 'bio-data'],
    canDo: [
      'Fix a spelling mistake in your name or parents’ names',
      'Correct your date of birth or blood group',
      'Update your permanent address',
    ],
    steps: [
      'Choose the field to correct and type the correct value.',
      'Add the reference number of your proof document.',
      'Bring the original document to the Academic Section within 7 days.',
    ],
    requiredDocuments: [
      { name: 'Aadhaar card', note: 'For name, date of birth and address' },
      { name: 'Class X certificate', note: 'For name, parentage and date of birth' },
      { name: 'Gazette notification', note: 'Only for a legal change of name' },
    ],
    issuedDocuments: [
      {
        id: 'correction-form',
        name: 'Correction application form',
        description: 'Pre-filled form to sign and submit with your proof.',
        build: (u) => ({
          title: 'Bio-data Correction Application',
          reference: `REG-${enrolOf(u)}`,
          issuedBy: 'Office of the Registrar',
          holderName: nameOf(u),
          rows: [
            { label: 'Enrolment number', value: enrolOf(u) },
            { label: 'Field to correct', value: '' },
            { label: 'Current value', value: '' },
            { label: 'Correct value', value: '' },
            { label: 'Proof attached', value: '' },
            { label: 'Student signature', value: '' },
          ],
          note: 'Attach a self-attested copy of your proof and bring the original for verification.',
        }),
      },
    ],
    faqs: [
      { q: 'Will my degree show the corrected name?', a: 'Yes. Corrections approved before the final semester appear on the degree.' },
      { q: 'Can I correct more than one field?', a: 'Submit one request per field so each can be verified separately.' },
    ],
  },
  {
    id: 'srv_attendance',
    slug: 'attendance',
    code: 'ACD-203',
    title: 'Attendance',
    summary: 'See your attendance for this semester, subject by subject.',
    group: 'ACADEMIC',
    mode: 'instant',
    readOnly: true,
    office: 'Your department',
    hours: 'Updated after every class',
    turnaround: 'Live',
    status: { label: `${attendanceSummary().overall.toFixed(1)}% this semester`, tone: attendanceSummary().eligible ? 'success' : 'warning' },
    icon: CalendarCheck,
    tint: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400',
    actionLabel: 'View attendance',
    keywords: ['attendance', 'present', 'absent', 'shortage', 'percentage', '75'],
    canDo: [
      'See your overall attendance for this semester',
      'Check each subject against the 75% rule',
      'Find out how many classes you need to catch up',
    ],
    steps: [
      'Open the Overview tab to see your attendance.',
      'Subjects under 75% are marked so you can catch up in time.',
      'If a class is marked wrongly, file an attendance grievance with the date.',
    ],
    requiredDocuments: [],
    issuedDocuments: [],
    faqs: [
      { q: 'What happens below 75%?', a: 'You may not be allowed to sit the end-semester exam. Talk to your department early if you are close.' },
      { q: 'I was marked absent but attended.', a: 'File an attendance grievance with the date and subject. Your teacher checks it against the class register.' },
    ],
  },
  {
    id: 'srv_hall_ticket',
    slug: 'hall-ticket',
    code: 'COE-201',
    title: 'Exam admit card',
    summary: 'Check your eligibility and download the admit card for end-semester exams.',
    group: 'ACADEMIC',
    mode: 'instant',
    office: 'Controller of Examinations',
    hours: 'Mon to Sat, 10:00 to 17:00',
    turnaround: 'Available immediately when eligible',
    status: { label: 'Odd semester live', tone: 'success' },
    icon: Ticket,
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    actionLabel: 'Get admit card',
    keywords: ['hall ticket', 'exam', 'admit', 'schedule', 'coe'],
    canDo: [
      'See your exam schedule, centre and desk number',
      'Check that attendance and fees clear you for exams',
      'Download the admit card with its verification QR',
    ],
    steps: [
      'Confirm that attendance and exam fee show as cleared.',
      'Download the admit card and print it on A4.',
      'Carry it with your ID card to every paper.',
    ],
    requiredDocuments: [
      { name: 'Attendance of 75% or more', note: 'Checked automatically from department records' },
      { name: 'Exam registration fee paid', note: 'Checked automatically from Finance' },
    ],
    issuedDocuments: [
      {
        id: 'admit-card',
        name: 'Exam Admit Card',
        description: 'Required at the exam hall entrance. Carries your photo and signature.',
        build: (u) => buildAdmitCard(u),
      },
    ],
    faqs: [
      { q: 'My attendance is below 75%. What now?', a: 'File an attendance grievance if the record is wrong, or contact your department for condonation.' },
      { q: 'I lost my admit card.', a: 'Download it again from this page. Every copy carries the same QR code.' },
    ],
  },
  {
    id: 'srv_results_degree',
    slug: 'results-degree',
    code: 'COE-202',
    title: 'Results and transcripts',
    summary: 'View grade cards, order a consolidated transcript or apply for your degree.',
    group: 'ACADEMIC',
    mode: 'request',
    office: 'Examination and Degree Section',
    hours: 'Mon to Fri, 10:00 to 16:30',
    turnaround: 'Grade cards now, transcripts in 5 working days',
    status: { label: 'CGPA 8.84', tone: 'success' },
    icon: GraduationCap,
    tint: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
    actionLabel: 'View results',
    keywords: ['grades', 'cgpa', 'sgpa', 'transcript', 'degree', 'marksheet'],
    canDo: [
      'See SGPA and CGPA for every semester',
      'Download semester grade cards',
      'Order a consolidated transcript for higher studies or visas',
    ],
    steps: [
      'Open the Apply tab to see your semester results.',
      'Download a grade card or request a transcript.',
      'Transcripts are emailed to your institute address within 5 working days.',
    ],
    requiredDocuments: [
      { name: 'Transcript fee receipt', note: 'Paid through Fee payments' },
      { name: 'Recipient address', note: 'Only if the transcript goes directly to a university' },
    ],
    issuedDocuments: [
      {
        id: 'grade-summary',
        name: 'Grade summary, semesters I–IV',
        description: 'Unofficial summary for your own records.',
        build: (u) => ({
          title: 'Grade Summary',
          reference: `GRD-${enrolOf(u)}`,
          issuedBy: 'Controller of Examinations',
          holderName: nameOf(u),
          rows: [
            { label: 'CGPA', value: '8.84 / 10' },
            { label: 'Credits earned', value: '92 of 160' },
          ],
          table: {
            headers: ['Semester', 'Session', 'Credits', 'SGPA'],
            rows: [
              ['I', 'Odd 2024–25', '22', '8.60'],
              ['II', 'Even 2025', '24', '8.90'],
              ['III', 'Odd 2025–26', '22', '8.75'],
              ['IV', 'Even 2026', '24', '9.10'],
            ],
          },
        }),
      },
    ],
    faqs: [
      { q: 'When can I apply for the degree?', a: 'After results for your final semester are declared.' },
      { q: 'Is the grade summary an official transcript?', a: 'No. Order a consolidated transcript for any official use.' },
    ],
  },
  {
    id: 'srv_fee_payments',
    slug: 'fee-payments',
    code: 'FIN-301',
    title: 'Fee payments',
    summary: 'Pay tuition, exam and hall fees and download your receipts.',
    group: 'FINANCE',
    mode: 'instant',
    office: 'Finance and Accounts',
    hours: 'Mon to Fri, 10:00 to 16:00',
    turnaround: 'Receipts issued on payment',
    status: { label: 'No dues', tone: 'success' },
    icon: CreditCard,
    tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    actionLabel: 'Pay or get receipts',
    keywords: ['fees', 'payment', 'receipt', 'tuition', 'dues', 'no dues'],
    canDo: [
      'Check your balance for the current session',
      'Download receipts for past payments',
      'Get a fee clearance slip',
    ],
    steps: [
      'Check your balance on the Apply tab.',
      'Pay any dues through SBI e-Pay.',
      'Download the receipt once the payment shows as reconciled.',
    ],
    requiredDocuments: [
      { name: 'Enrolment number', note: 'Used as the payment reference' },
    ],
    issuedDocuments: [
      {
        id: 'fee-clearance',
        name: 'Fee clearance slip, 2026–27',
        description: 'Shows that you have no outstanding dues.',
        build: (u) => ({
          title: 'Fee Clearance Slip',
          reference: `FIN-CLR-${enrolOf(u)}`,
          issuedBy: 'Finance and Accounts',
          holderName: nameOf(u),
          rows: [
            { label: 'Session', value: '2026–27' },
            { label: 'Balance due', value: '₹0.00' },
            { label: 'Status', value: 'Cleared' },
          ],
        }),
      },
      {
        id: 'fee-statement',
        name: 'Payment statement',
        description: 'All payments for the current session.',
        build: (u) => ({
          title: 'Payment Statement 2026–27',
          reference: `FIN-STM-${enrolOf(u)}`,
          issuedBy: 'Finance and Accounts',
          holderName: nameOf(u),
          rows: [{ label: 'Total paid', value: '₹6,300.00' }],
          table: {
            headers: ['Receipt', 'Fee', 'Date', 'Amount'],
            rows: FEE_RECEIPTS.map((r) => [r.id, r.head, r.date, r.amount]),
          },
        }),
      },
    ],
    faqs: [
      { q: 'My payment is not showing.', a: 'Payments take up to 2 hours to reconcile. If it is still missing after a day, file a grievance with the transaction ID.' },
      { q: 'Can I pay in instalments?', a: 'Instalments need written approval from the Finance Officer.' },
    ],
  },
  {
    id: 'srv_scholarship',
    slug: 'scholarships',
    code: 'DSW-302',
    title: 'Scholarships and aid',
    summary: 'Track your NSP application, apply for university awards and get a railway concession.',
    group: 'FINANCE',
    mode: 'request',
    office: 'Dean of Students’ Welfare',
    hours: 'Mon to Fri, 10:00 to 16:00',
    turnaround: '3 to 5 working days',
    status: { label: 'NSP verified', tone: 'success' },
    icon: Award,
    tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
    actionLabel: 'Track or apply',
    keywords: ['nsp', 'scholarship', 'fellowship', 'railway', 'concession', 'dsw', 'aid'],
    canDo: [
      'Track your National Scholarship Portal application',
      'Apply for university merit awards',
      'Request a railway concession certificate',
    ],
    steps: [
      'Pick a scheme on the Apply tab.',
      'Upload income and marks documents where asked.',
      'DSW verifies within 5 working days and updates the status here.',
    ],
    requiredDocuments: [
      { name: 'Income certificate', note: 'Issued in the current financial year' },
      { name: 'Previous year marksheet', note: 'For merit-based schemes' },
      { name: 'Bank passbook', note: 'Account must be linked to Aadhaar for DBT' },
    ],
    issuedDocuments: [
      {
        id: 'nsp-status',
        name: 'NSP verification slip',
        description: 'Proof that DSW has verified your NSP application.',
        build: (u) => ({
          title: 'NSP Verification Slip',
          reference: 'NSP-2026-UP-884210',
          issuedBy: 'Dean of Students’ Welfare',
          holderName: nameOf(u),
          rows: [
            { label: 'Scheme', value: 'Post-Matric Merit' },
            { label: 'Disbursement', value: 'Aadhaar-linked DBT' },
            { label: 'Status', value: 'Level 2 approved' },
          ],
        }),
      },
    ],
    faqs: [
      { q: 'When is the scholarship paid?', a: 'Disbursement dates are set by the scheme. Check NSP for the latest status.' },
      { q: 'How often can I get a railway concession?', a: 'Once per vacation, for travel to your home station.' },
    ],
  },
  {
    id: 'srv_room_allotment',
    slug: 'hall-allotment',
    code: 'RES-401',
    title: 'Hall and room',
    summary: 'See your room, request a transfer, renew your mess card or get hall clearance.',
    group: 'FACILITIES',
    mode: 'request',
    office: 'Provost Office, Sir Syed Hall (North)',
    hours: 'Mon to Sat, 09:00 to 13:00',
    turnaround: '2 working days',
    status: { label: 'Room 48, Wing B', tone: 'info' },
    icon: Home,
    tint: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
    actionLabel: 'Manage room',
    keywords: ['hostel', 'hall', 'room', 'mess', 'provost', 'transfer'],
    canDo: [
      'See your room, roommate and warden',
      'Request a room swap or transfer',
      'Renew your mess card or get provost clearance',
    ],
    steps: [
      'Choose what you need on the Apply tab and give a reason.',
      'The Provost Office reviews it within 2 working days.',
      'You get a notification when it is approved.',
    ],
    requiredDocuments: [
      { name: 'Medical certificate', note: 'Only for a transfer on medical grounds' },
      { name: 'Consent of the other student', note: 'Only for a mutual swap' },
    ],
    issuedDocuments: [
      {
        id: 'allotment-letter',
        name: 'Room allotment letter',
        description: 'Confirms your room for 2026–27.',
        build: (u) => ({
          title: 'Room Allotment Letter',
          reference: `RES-SSN-48B-${enrolOf(u)}`,
          issuedBy: 'Provost Office, Sir Syed Hall (North)',
          holderName: nameOf(u),
          rows: [
            { label: 'Hall', value: 'Sir Syed Hall (North)' },
            { label: 'Room', value: 'Wing B, Room 48, Bed B' },
            { label: 'Session', value: '2026–27' },
            { label: 'Dining hall', value: 'Mess Hall 1' },
            { label: 'Warden', value: 'Dr. Salman Akhtar' },
          ],
        }),
      },
    ],
    faqs: [
      { q: 'Can I change halls mid-session?', a: 'Only on medical grounds or with Provost approval.' },
      { q: 'I need a no-dues before leaving.', a: 'Request provost clearance on the Apply tab at least a week before you leave.' },
    ],
  },
  {
    id: 'srv_campus_wifi',
    slug: 'wifi',
    code: 'CIT-402',
    title: 'Campus Wi-Fi',
    summary: 'Change your Wi-Fi password and manage the devices that can join the campus network.',
    group: 'FACILITIES',
    mode: 'instant',
    office: 'Computer Centre',
    hours: 'Mon to Sat, 09:00 to 17:00',
    turnaround: 'Instant, no approval needed',
    status: { label: '2 of 3 devices', tone: 'success' },
    icon: Wifi,
    tint: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
    actionLabel: 'Manage devices',
    keywords: ['wifi', 'internet', 'mac', 'network', 'lan', 'device'],
    canDo: [
      'Change your Wi-Fi password',
      'Add up to 3 devices, or remove one to free a slot',
      'Get hostel LAN access on registered devices',
    ],
    steps: [
      'Change your password or add a device on the Apply tab.',
      'Changes apply straight away. Nobody needs to approve them.',
      'Reconnect to AMU-Secure-WiFi with your username and new password.',
    ],
    requiredDocuments: [
      { name: 'Device MAC address', note: 'Turn off private or random MAC for the campus network' },
    ],
    issuedDocuments: [
      {
        id: 'wifi-devices',
        name: 'Registered devices',
        description: 'List of devices allowed on the campus network.',
        build: (u) => ({
          title: 'Campus Wi-Fi Registration',
          reference: `CIT-NET-${enrolOf(u)}`,
          issuedBy: 'Computer Centre',
          holderName: nameOf(u),
          rows: [
            { label: 'Network', value: 'AMU-Secure-WiFi' },
            { label: 'Device limit', value: '3' },
          ],
          table: {
            headers: ['Device', 'MAC address'],
            rows: readLocal<{ name: string; mac: string }[]>('amu-wifi-devices', [
              { name: 'MacBook Air M2', mac: 'A4:83:E7:22:90:1A' },
              { name: 'iPhone 15', mac: 'F0:18:98:C3:54:12' },
            ]).map((d) => [d.name, d.mac]),
          },
        }),
      },
    ],
    faqs: [
      { q: 'My phone will not connect.', a: 'Turn off private Wi-Fi address for AMU-Secure-WiFi, then check the MAC matches what you registered.' },
      { q: 'Can I remove an old device?', a: 'Yes. Remove it on the Apply tab and the slot is free at once.' },
    ],
  },
  {
    id: 'srv_institute_email',
    slug: 'email-sso',
    code: 'CIT-403',
    title: 'Email and sign-in',
    summary: 'Manage your @amu.ac.in account, password and two-step verification.',
    group: 'FACILITIES',
    mode: 'instant',
    office: 'Computer Centre',
    hours: 'Online, any time',
    turnaround: 'Immediate',
    status: { label: 'Account active', tone: 'success' },
    icon: Mail,
    tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    actionLabel: 'Manage account',
    keywords: ['email', 'gmail', 'google', 'sso', 'password', '2fa'],
    canDo: [
      'Change your institute password',
      'Make new two-step verification backup codes',
      'Check storage use',
    ],
    steps: [
      'Enter your current password and a new one.',
      'The change applies to email and every service you sign in to with it.',
      'Sign in again on your other devices.',
    ],
    requiredDocuments: [
      { name: 'Registered mobile number', note: 'Needed to receive the reset link' },
    ],
    issuedDocuments: [
      {
        id: 'account-summary',
        name: 'Account summary',
        description: 'Your institute email and connected services.',
        build: (u) => ({
          title: 'Institute Account Summary',
          reference: `CIT-SSO-${enrolOf(u)}`,
          issuedBy: 'Computer Centre',
          holderName: nameOf(u),
          rows: [
            { label: 'Email', value: u?.email || 'student.tariq@amu.ac.in' },
            { label: 'Storage', value: '18.4 GB of 100 GB' },
            { label: 'Two-step verification', value: 'On' },
            { label: 'Single sign-on', value: 'Library, IEEE, ScienceDirect' },
          ],
        }),
      },
    ],
    faqs: [
      { q: 'I changed my phone number.', a: 'Visit the Computer Centre with your ID card to update it.' },
      { q: 'Does my email stay after I graduate?', a: 'Accounts stay active for one year after your course ends.' },
    ],
  },
  {
    id: 'srv_medical_appt',
    slug: 'health-centre',
    code: 'MED-501',
    title: 'Health centre',
    summary: 'Book an OPD token at the University Health Centre.',
    group: 'FACILITIES',
    mode: 'instant',
    office: 'University Health Centre',
    hours: 'OPD 08:00 to 14:00, emergency 24 hours',
    turnaround: 'Same-day token',
    status: { label: 'OPD open', tone: 'success' },
    icon: Stethoscope,
    tint: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    actionLabel: 'Book a token',
    keywords: ['doctor', 'medical', 'opd', 'health', 'clinic', 'appointment', 'sick'],
    canDo: [
      'Book a token for general medicine, dental, eye, skin, ENT or orthopaedics',
      'Pick a slot today or tomorrow',
      'Print the OPD slip',
    ],
    steps: [
      'Pick the clinic and slot, and describe your symptoms.',
      'You get a token number straight away. No approval needed.',
      'Show it at Room 12, OPD wing, at your slot.',
    ],
    requiredDocuments: [
      { name: 'Student ID card', note: 'Shown at the OPD counter' },
      { name: 'Previous prescriptions', note: 'If this is a follow-up visit' },
    ],
    issuedDocuments: [],
    faqs: [
      { q: 'Is consultation free?', a: 'Consultation and basic medicines are free for enrolled students.' },
      { q: 'It is an emergency.', a: 'Go directly to JNMC Casualty, open 24 hours. Do not wait for a token.' },
    ],
  },
];

export const FEE_RECEIPTS = [
  { id: 'RCP-2026-8910', head: 'Odd semester tuition and enrolment', date: '10 Aug 2026', amount: '₹3,400.00' },
  { id: 'RCP-2026-9042', head: 'Exam registration', date: '12 Sep 2026', amount: '₹800.00' },
  { id: 'RCP-2026-9531', head: 'Sir Syed Hall dining and maintenance', date: '01 Oct 2026', amount: '₹2,100.00' },
];

export const getServiceBySlug = (slug: string | undefined) =>
  CAMPUS_SERVICES.find((s) => s.slug === slug);

export const matchesServiceQuery = (s: CampusService, q: string) => {
  const query = q.toLowerCase().trim();
  if (!query) return true;
  return [s.title, s.summary, s.code, s.office, ...s.keywords].some((t) => t.toLowerCase().includes(query));
};
