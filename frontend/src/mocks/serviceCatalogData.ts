/**
 * Secure Campus Service Portal - Service Catalog & Dynamic Form Schemas
 * 
 * SOURCING RULES & DISCLAIMER:
 * 1. Attendance complaint fields and options are VERIFIED_ANALYSIS from `Stakeholder.pdf` (Pages 4-5).
 * 2. All other categories, subcategories, form fields, and routing rules are PROPOSED design models
 *    for Aligarh Muslim University (AMU) and are NOT verified institutional policies.
 */

import type {
  CampusServiceConfig,
  CategoryConfig,
  SubcategoryConfig,
  FormSchema,
} from '../types/serviceCatalog';
export {
  ATTENDANCE_COMPLAINT_TYPES,
  RECORDED_ATTENDANCE_STATUSES,
} from '../types/serviceCatalog';

/**
 * Attendance Discrepancy Form Schema
 * Sourced directly from Stakeholder.pdf (Page 4)
 */
export const ATTENDANCE_FORM_SCHEMA: FormSchema = {
  id: 'schema_attendance_complaint',
  title: 'Attendance Discrepancy Grievance Form',
  description: 'Submit an official correction request for recorded attendance discrepancies.',
  status: 'VERIFIED_ANALYSIS',
  fields: [
    {
      id: 'studentId',
      name: 'studentId',
      label: 'Student ID / Enrollment Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., 2023-CS-042',
      helpText: 'Pre-filled from your authenticated student profile',
      readOnly: true,
    },
    {
      id: 'studentName',
      name: 'studentName',
      label: 'Student Name',
      type: 'text',
      required: true,
      placeholder: 'Full student name',
      readOnly: true,
    },
    {
      id: 'course',
      name: 'course',
      label: 'Course / Degree Program',
      type: 'select',
      required: true,
      options: [
        'B.Tech Computer Engineering',
        'B.Tech Electrical Engineering',
        'B.Tech Mechanical Engineering',
        'B.Tech Civil Engineering',
        'M.Tech Computer Science',
        'B.Sc (Hons) Computer Science',
        'M.Sc Computer Science',
        'Master of Business Administration (MBA)',
        'B.Com (Hons)',
        'B.A (Hons)',
        'Other Academic Program',
      ],
      placeholder: 'Select enrolled program',
    },
    {
      id: 'semester',
      name: 'semester',
      label: 'Current Semester',
      type: 'select',
      required: true,
      options: [
        'Semester 1',
        'Semester 2',
        'Semester 3',
        'Semester 4',
        'Semester 5',
        'Semester 6',
        'Semester 7',
        'Semester 8',
      ],
    },
    {
      id: 'department',
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        'Department of Computer Science',
        'Department of Electrical Engineering',
        'Department of Mechanical Engineering',
        'Department of Civil Engineering',
        'Department of Business Administration',
        'Department of Physics',
        'Department of Mathematics',
        'Department of English',
      ],
      helpText: 'Concerned department offering the subject',
    },
    {
      id: 'subject',
      name: 'subject',
      label: 'Subject / Subject Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., CS-301 Operating Systems or Math-201',
      helpText: 'Subject code and title of the lecture or practical',
    },
    {
      id: 'facultyName',
      name: 'facultyName',
      label: 'Faculty Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Dr. Farhan Siddiqui',
      helpText: 'Concerned subject teacher taking the class',
    },
    {
      id: 'complaintType',
      name: 'complaintType',
      label: 'Complaint Type',
      type: 'select',
      required: true,
      options: [
        'Incorrect Absent Marking',
        'Attendance Not Updated',
        'Attendance Shortage Dispute',
        'Attendance Record Mismatch',
        'Other',
      ],
      helpText: 'Specific reason for the attendance dispute',
    },
    {
      id: 'dateOfAttendance',
      name: 'dateOfAttendance',
      label: 'Date of Attendance',
      type: 'date',
      required: true,
      helpText: 'The specific class date on which attendance was incorrectly recorded',
    },
    {
      id: 'recordedAttendanceStatus',
      name: 'recordedAttendanceStatus',
      label: 'Recorded Attendance Status in Portal',
      type: 'select',
      required: true,
      options: [
        'Marked Absent',
        'Present but Not Updated',
        'Incorrect Percentage',
      ],
      helpText: 'The status currently shown in the portal or attendance register',
    },
    {
      id: 'description',
      name: 'description',
      label: 'Detailed Description of the Issue',
      type: 'textarea',
      required: true,
      placeholder: 'Provide complete details (e.g., signed physical register, attended substitute class, medical certificate submitted, etc.)',
    },
    {
      id: 'supportingProof',
      name: 'supportingProof',
      label: 'Supporting Proof / Attachment',
      type: 'file',
      required: false,
      helpText: 'Class attendance sheet photo, LMS screenshot, or teacher permission note (PDF, PNG, JPG max 5MB)',
    },
  ],
};

/**
 * Standard General Complaint Form Schema (for standard non-attendance categories)
 */
export const GENERAL_COMPLAINT_SCHEMA: FormSchema = {
  id: 'schema_general_complaint',
  title: 'Standard Service Issue Report',
  description: 'Report maintenance, facility, or operational issues.',
  status: 'PROPOSED',
  fields: [
    {
      id: 'title',
      name: 'title',
      label: 'Issue Summary / Subject',
      type: 'text',
      required: true,
      placeholder: 'e.g., Water leakage in corridor or projector bulb replacement',
    },
    {
      id: 'location',
      name: 'location',
      label: 'Exact Campus Location / Room Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., Room 104, Lab 2, or Sir Syed Hall North Wing Room 42',
    },
    {
      id: 'description',
      name: 'description',
      label: 'Detailed Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the issue, symptoms, frequency, and any immediate impact...',
    },
  ],
};

/**
 * Proposed Category Groups & Subcategories
 */
export const SERVICE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cat_academic',
    code: 'ACADEMIC',
    name: 'Academic Services',
    description: 'Attendance disputes, course enrolment issues, and classroom teaching concerns.',
    status: 'PROPOSED',
    subcategories: [
      {
        id: 'sub_attendance',
        code: 'ATTENDANCE_DISPUTE',
        name: 'Attendance Discrepancy Dispute',
        description: 'Incorrect absent marking, un-updated records, or attendance shortage appeals.',
        status: 'VERIFIED_ANALYSIS', // Verified from Stakeholder.pdf
        formSchema: ATTENDANCE_FORM_SCHEMA,
        allowedOptions: [
          'Incorrect Absent Marking',
          'Attendance Not Updated',
          'Attendance Shortage Dispute',
          'Attendance Record Mismatch',
          'Other',
        ],
        routingRule: {
          targetDepartmentId: 'dept_cs',
          targetDepartmentName: 'Department of Computer Science',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'HIGH',
          slaDaysProposed: 3,
        },
      },
      {
        id: 'sub_course_reg',
        code: 'COURSE_REGISTRATION',
        name: 'Course Registration & Elective Allocation',
        description: 'Problems choosing electives, duplicate course code errors, or batch conflicts.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_cs',
          targetDepartmentName: 'Department Academic Office',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'MEDIUM',
          slaDaysProposed: 5,
        },
      },
      {
        id: 'sub_internal_marks',
        code: 'INTERNAL_MARKS',
        name: 'Internal Assessment Marks Record',
        description: 'Discrepancy in continuous assessment, sessional test marks, or lab evaluations.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_cs',
          targetDepartmentName: 'Department Examination Committee',
          targetUnitType: 'FACULTY',
          defaultPriority: 'HIGH',
          slaDaysProposed: 4,
        },
      },
    ],
  },
  {
    id: 'cat_infra',
    code: 'INFRASTRUCTURE',
    name: 'Infrastructure and Maintenance',
    description: 'Campus civil works, electrical repairs, sanitation, and physical maintenance.',
    status: 'PROPOSED',
    subcategories: [
      {
        id: 'sub_electrical',
        code: 'ELECTRICAL_MAINTENANCE',
        name: 'Electrical & Power Supply',
        description: 'Power cut, faulty switchboard, ceiling fan breakdown, or wiring issue.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_works',
          targetDepartmentName: 'Department of Works & Maintenance',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'HIGH',
          slaDaysProposed: 2,
        },
      },
      {
        id: 'sub_plumbing',
        code: 'PLUMBING_WATER',
        name: 'Plumbing & Drinking Water Facilities',
        description: 'Water leakage, tap replacement, water cooler breakdown, or restroom supply.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_works',
          targetDepartmentName: 'Department of Works & Maintenance',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'HIGH',
          slaDaysProposed: 2,
        },
      },
      {
        id: 'sub_furniture',
        code: 'FURNITURE_CIVIL',
        name: 'Classroom Furniture & Fixtures',
        description: 'Broken desks, bench repair, whiteboard damage, or door/window latch issues.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_works',
          targetDepartmentName: 'Department of Works & Maintenance',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'LOW',
          slaDaysProposed: 7,
        },
      },
    ],
  },
  {
    id: 'cat_it',
    code: 'IT_NETWORK',
    name: 'IT and Digital Services',
    description: 'Campus network, Wi-Fi connectivity, smart classrooms, and portal credentials.',
    status: 'PROPOSED',
    subcategories: [
      {
        id: 'sub_wifi',
        code: 'CAMPUS_WIFI',
        name: 'Campus Wi-Fi & LAN Connectivity',
        description: 'SSID login issues, captive portal authentication, or access point outages.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_cc',
          targetDepartmentName: 'Computer Centre (IT Services)',
          targetUnitType: 'IT_ADMIN',
          defaultPriority: 'HIGH',
          slaDaysProposed: 2,
        },
      },
      {
        id: 'sub_portal_login',
        code: 'ACCOUNT_ACCESS',
        name: 'Portal Account & Password Recovery',
        description: 'Issues with official credentials, 2FA reset, or profile data mismatch.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_cc',
          targetDepartmentName: 'Computer Centre (IT Services)',
          targetUnitType: 'IT_ADMIN',
          defaultPriority: 'MEDIUM',
          slaDaysProposed: 2,
        },
      },
      {
        id: 'sub_smart_classroom',
        code: 'SMART_CLASSROOM',
        name: 'Smart Classroom Audio-Visual Equipment',
        description: 'Projector display failure, microphone static, or interactive panel errors.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_cc',
          targetDepartmentName: 'Computer Centre (IT Services)',
          targetUnitType: 'DEPARTMENT',
          defaultPriority: 'HIGH',
          slaDaysProposed: 1,
        },
      },
    ],
  },
  {
    id: 'cat_hostel',
    code: 'HOSTEL',
    name: 'Hostel / Hall Services',
    description: 'Residential accommodation, hostel facilities, dining halls, and provost matters.',
    status: 'PROPOSED',
    subcategories: [
      {
        id: 'sub_hall_room',
        code: 'ROOM_MAINTENANCE',
        name: 'Hostel Room Maintenance',
        description: 'Room electrical points, door locks, mosquito mesh, or almirah repairs.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_provost',
          targetDepartmentName: 'Sir Syed Hall Provost Office',
          targetUnitType: 'HALL',
          defaultPriority: 'MEDIUM',
          slaDaysProposed: 3,
        },
      },
      {
        id: 'sub_hall_mess',
        code: 'MESS_SERVICES',
        name: 'Dining Hall / Mess Facilities',
        description: 'Dining hall cleanliness, dietary concerns, meal timings, or mess rebate queries.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_provost',
          targetDepartmentName: 'Hall Dining Hall Committee',
          targetUnitType: 'HALL',
          defaultPriority: 'HIGH',
          slaDaysProposed: 2,
        },
      },
    ],
  },
  {
    id: 'cat_welfare',
    code: 'WELFARE_GRIEVANCE',
    name: 'Student Welfare and Grievances',
    description: 'Welfare assistance, hardship requests, harassment reports, and grievance appeals.',
    status: 'PROPOSED',
    subcategories: [
      {
        id: 'sub_srgc_grievance',
        code: 'SRGC_APPEAL',
        name: 'Formal Student Grievance (SRGC)',
        description: 'Appeals regarding procedural injustice, unfair treatment, or unresolved departmental disputes.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_srgc',
          targetDepartmentName: 'Student Grievance Redressal Cell (SRGC)',
          targetUnitType: 'GRIEVANCE_CELL',
          defaultPriority: 'CRITICAL',
          slaDaysProposed: 7,
        },
      },
      {
        id: 'sub_dsw_welfare',
        code: 'DSW_WELFARE_AID',
        name: 'Student Welfare & Financial Aid Query',
        description: 'Dean of Students Welfare inquiries, student railway concessions, or aid documentation.',
        status: 'PROPOSED',
        formSchema: GENERAL_COMPLAINT_SCHEMA,
        routingRule: {
          targetDepartmentId: 'dept_dsw',
          targetDepartmentName: 'Dean of Students Welfare (DSW)',
          targetUnitType: 'WELFARE',
          defaultPriority: 'MEDIUM',
          slaDaysProposed: 5,
        },
      },
    ],
  },
];

/**
 * Top-level Campus Services configuration model
 */
export const CAMPUS_SERVICES: CampusServiceConfig[] = [
  {
    id: 'srv_complaints',
    code: 'CMP_HUB',
    name: 'Grievance and Service Complaints Portal',
    description: 'Centralized intake for academic disputes, facility breakdowns, and departmental issues.',
    isEnabled: true,
    supportedRequesterTypes: ['STUDENT', 'FACULTY'],
    type: 'COMPLAINT',
    status: 'PROPOSED',
    categories: SERVICE_CATEGORIES,
  },
];
