-- =============================================================================
-- Migration: 20261011000001_seed_reference_data.sql
-- Description: Baseline reference data and prototype seeds for AMU Portal
-- =============================================================================

-- 1. ROLES
INSERT INTO public.roles (name, description) VALUES
    ('STUDENT', 'Enrolled student with complaint lodging and request tracking access'),
    ('STAFF', 'General administrative or departmental staff handling case queues'),
    ('FACULTY', 'Teacher or professor reviewing academic disputes and filing cases'),
    ('DSW', 'Dean of Students Welfare reviewing student welfare and financial cases'),
    ('HALL_STAFF', 'Hall Provost and warden staff managing hostel maintenance and allotments'),
    ('DEPT_STAFF', 'Departmental administrative staff managing subject and facility disputes'),
    ('SRGC', 'Student Redressal Grievance Committee handling escalated disputes'),
    ('MANAGEMENT', 'University management, Dean, and Vice-Chancellor oversight'),
    ('CHAIRMAN', 'Department Chairperson overseeing departmental complaints and reviews'),
    ('IT_ADMIN', 'Technical administrator managing identity, permissions, and audit logs')
ON CONFLICT (name) DO NOTHING;

-- 2. DEPARTMENTS
INSERT INTO public.departments (code, name, contact_email, location) VALUES
    ('CS', 'Department of Computer Science', 'chairperson.cs@amu.ac.in', 'Science Complex, 2nd Floor'),
    ('WORKS', 'Department of Works & Maintenance', 'works.maintenance@amu.ac.in', 'Engineering College Road'),
    ('CC', 'Computer Centre & IT Services', 'helpdesk.cc@amu.ac.in', 'Near Maulana Azad Library'),
    ('PROCTOR', 'Proctorial Office', 'proctor@amu.ac.in', 'Bab-e-Syed Gate Complex'),
    ('DSW', 'Dean of Students Welfare (DSW)', 'dsw@amu.ac.in', 'Duck Point, DSW Building'),
    ('HALL_OFFICE', 'Sir Syed Hall Provost Office', 'provost.sshn@amu.ac.in', 'Sir Syed Hall Quadrangle'),
    ('ADMIN', 'Central Administration & Registrar', 'registrar@amu.ac.in', 'Administrative Block')
ON CONFLICT (code) DO NOTHING;

-- 3. ACADEMIC SESSIONS
INSERT INTO public.academic_sessions (session_name, start_year, end_year, is_current) VALUES
    ('2025-2026', 2025, 2026, FALSE),
    ('2026-2027', 2026, 2027, TRUE)
ON CONFLICT (session_name) DO NOTHING;

-- 4. HALLS OF RESIDENCE
INSERT INTO public.halls (code, name, gender_scope) VALUES
    ('SSH-N', 'Sir Syed Hall (North)', 'MALE'),
    ('SSH-S', 'Sir Syed Hall (South)', 'MALE'),
    ('VMH', 'Viqarul Mulk Hall', 'MALE'),
    ('IGH', 'Indira Gandhi Hall', 'FEMALE'),
    ('SNH', 'Sarojini Naidu Hall', 'FEMALE')
ON CONFLICT (code) DO NOTHING;

-- 5. COURSES
INSERT INTO public.courses (department_id, code, name, total_semesters, degree_level)
SELECT id, 'CS-BTECH', 'B.Tech Computer Engineering', 8, 'UG' FROM public.departments WHERE code = 'CS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (department_id, code, name, total_semesters, degree_level)
SELECT id, 'CS-MCA', 'Master of Computer Applications', 4, 'PG' FROM public.departments WHERE code = 'CS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (department_id, code, name, total_semesters, degree_level)
SELECT id, 'EE-BTECH', 'B.Tech Electrical Engineering', 8, 'UG' FROM public.departments WHERE code = 'WORKS'
ON CONFLICT (code) DO NOTHING;

-- 6. CORE USERS FOR PROTOTYPE PERSONAS
INSERT INTO public.users (id, email, full_name, account_status) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'portal.admin@amu.ac.in', 'Registrar Officer', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000002', 'student.tariq@amu.ac.in', 'Tariq Ahmad', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000003', 'staff.cc@amu.ac.in', 'Dr. Farhan Siddiqui', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000004', 'dsw.officer@amu.ac.in', 'Prof. Mohammad Asim', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000005', 'provost.ssh@amu.ac.in', 'Mr. Arshad Ali', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000006', 'staff.cs@amu.ac.in', 'Mohd. Khalid', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000007', 'srgc.officer@amu.ac.in', 'Dr. Salman Shahid', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000008', 'vc.management@amu.ac.in', 'Dr. Tariq Mansoor', 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000009', 'chairman.cs@amu.ac.in', 'Prof. N. A. Khan', 'ACTIVE')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 7. USER ROLES MAPPING
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM public.users u, public.roles r WHERE u.email = 'portal.admin@amu.ac.in' AND r.name = 'IT_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id FROM public.users u, public.roles r WHERE u.email = 'student.tariq@amu.ac.in' AND r.name = 'STUDENT'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, department_id)
SELECT u.id, r.id, d.id FROM public.users u, public.roles r, public.departments d 
WHERE u.email = 'staff.cc@amu.ac.in' AND r.name = 'FACULTY' AND d.code = 'CS'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, department_id)
SELECT u.id, r.id, d.id FROM public.users u, public.roles r, public.departments d 
WHERE u.email = 'dsw.officer@amu.ac.in' AND r.name = 'DSW' AND d.code = 'DSW'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 8. STUDENT PROFILE FOR TARIQ AHMAD
INSERT INTO public.students (
    user_id, enrollment_number, roll_number, full_name, email, mobile_number, address,
    father_name, mother_name, admission_year, course_id, academic_session_id, current_semester, allotted_hall_id, account_status
)
SELECT 
    u.id, 'GL1234', '23COB042', 'Tariq Ahmad', 'student.tariq@amu.ac.in', '+91 98765 43210',
    'Room 48, North Wing, Sir Syed Hall (North), AMU Campus, Aligarh - 202002',
    'Mr. Ahmadullah Khan', 'Mrs. Shabana Begum', 2023, c.id, s.id, 5, h.id, 'ACTIVE'
FROM public.users u, public.courses c, public.academic_sessions s, public.halls h
WHERE u.email = 'student.tariq@amu.ac.in' 
  AND c.code = 'CS-BTECH' 
  AND s.session_name = '2026-2027' 
  AND h.code = 'SSH-N'
ON CONFLICT (enrollment_number) DO NOTHING;

-- 9. FACULTY PROFILE FOR DR. FARHAN SIDDIQUI
INSERT INTO public.faculty (
    user_id, faculty_number, department_id, full_name, email, mobile_number,
    date_of_birth, gender, appointment_type, account_status
)
SELECT 
    u.id, 'FAC-CS-104', d.id, 'Dr. Farhan Siddiqui', 'staff.cc@amu.ac.in', '+91 94123 45678',
    '1982-05-14', 'MALE', 'PERMANENT', 'ACTIVE'
FROM public.users u, public.departments d
WHERE u.email = 'staff.cc@amu.ac.in' AND d.code = 'CS'
ON CONFLICT (faculty_number) DO NOTHING;

-- 10. SERVICE CATEGORIES
INSERT INTO public.service_categories (name, description, icon, is_active) VALUES
    ('Academic Services', 'Attendance discrepancy, course registrations, and internal assessment disputes', 'GraduationCap', TRUE),
    ('Hostel & Accommodation', 'Hostel maintenance, plumbing, electrical faults, and room allotments', 'Home', TRUE),
    ('IT & Network Services', 'Campus Wi-Fi connectivity, lab access, and digital portal accounts', 'Laptop', TRUE),
    ('Campus Infrastructure', 'Water coolers, classroom furniture, sanitation, and physical facilities', 'Building', TRUE),
    ('Dean Students Welfare (DSW)', 'Scholarships, medical emergency aid, psychological counseling, and welfare', 'HeartHandshake', TRUE),
    ('Certificates & Verification', 'Bonafide certificates, conduct verifications, and no-dues clearance', 'FileCheck', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 11. SERVICE SUBCATEGORIES
INSERT INTO public.service_subcategories (category_id, name, target_department_id, sla_days, default_priority, form_schema)
SELECT c.id, 'Attendance Discrepancy Dispute', d.id, 3, 'HIGH', '[
    {"id": "course_name", "label": "Course / Academic Degree", "type": "text", "required": true},
    {"id": "semester", "label": "Semester", "type": "number", "required": true},
    {"id": "department", "label": "Department", "type": "text", "required": true},
    {"id": "subject_code", "label": "Subject / Subject Code", "type": "text", "required": true},
    {"id": "faculty_name", "label": "Faculty / Teacher Name", "type": "text", "required": true},
    {"id": "complaint_type", "label": "Complaint Type", "type": "select", "options": ["Incorrect Absent Marking", "Medical Leave Uncredited", "Duty Leave Omission", "Technical Biometric Failure"], "required": true},
    {"id": "attendance_date", "label": "Date of Attendance Dispute", "type": "date", "required": true},
    {"id": "recorded_status", "label": "Recorded Attendance Status", "type": "select", "options": ["Marked Absent", "Unrecorded Attendance", "Partial Attendance Record"], "required": true},
    {"id": "description", "label": "Description / Problem Details", "type": "textarea", "required": true}
]'::jsonb
FROM public.service_categories c, public.departments d
WHERE c.name = 'Academic Services' AND d.code = 'CS'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_subcategories (category_id, name, target_department_id, sla_days, default_priority, form_schema)
SELECT c.id, 'Hostel Room & Corridor Maintenance', d.id, 2, 'MEDIUM', '[
    {"id": "hall_name", "label": "Hall of Residence", "type": "text", "required": true},
    {"id": "room_number", "label": "Room / Wing Number", "type": "text", "required": true},
    {"id": "issue_type", "label": "Issue Type", "type": "select", "options": ["Plumbing Leak", "Electrical / Fan", "Carpentry / Lock", "Masonry / Paint"], "required": true},
    {"id": "description", "label": "Details of Fault", "type": "textarea", "required": true}
]'::jsonb
FROM public.service_categories c, public.departments d
WHERE c.name = 'Hostel & Accommodation' AND d.code = 'WORKS'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_subcategories (category_id, name, target_department_id, sla_days, default_priority, form_schema)
SELECT c.id, 'Campus Wi-Fi / LAN Access Registration', d.id, 1, 'MEDIUM', '[
    {"id": "device_type", "label": "Device Type", "type": "select", "options": ["Laptop", "Smartphone", "Tablet"], "required": true},
    {"id": "mac_address", "label": "Device MAC Address", "type": "text", "required": true},
    {"id": "hostel_location", "label": "Primary Usage Location", "type": "text", "required": true}
]'::jsonb
FROM public.service_categories c, public.departments d
WHERE c.name = 'IT & Network Services' AND d.code = 'CC'
ON CONFLICT DO NOTHING;

INSERT INTO public.service_subcategories (category_id, name, target_department_id, sla_days, default_priority, form_schema)
SELECT c.id, 'Bonafide Student Certificate Request', d.id, 2, 'LOW', '[
    {"id": "purpose", "label": "Purpose of Certificate", "type": "select", "options": ["Bank Account Opening", "Scholarship Application", "Passport / Visa Verification", "State Concession Pass"], "required": true},
    {"id": "remarks", "label": "Additional Particulars", "type": "textarea", "required": false}
]'::jsonb
FROM public.service_categories c, public.departments d
WHERE c.name = 'Certificates & Verification' AND d.code = 'PROCTOR'
ON CONFLICT DO NOTHING;

-- 12. DEFAULT NOTICES
INSERT INTO public.notices (title, content, category, author_id, is_published, published_at)
SELECT 
    'Scheduled Maintenance: Campus Network Backbone Upgrades',
    'The Computer Centre will be carrying out core distribution switch firmware upgrades on Saturday between 01:00 AM and 05:00 AM. Intermittent interruptions to hostel Wi-Fi and departmental portals may occur.',
    'MAINTENANCE',
    u.id,
    TRUE,
    NOW()
FROM public.users u
WHERE u.email = 'portal.admin@amu.ac.in'
ON CONFLICT DO NOTHING;
