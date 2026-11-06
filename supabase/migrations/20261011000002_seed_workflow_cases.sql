-- =============================================================================
-- Migration: 20261011000002_seed_workflow_cases.sql
-- Description: Seed initial complaints, service requests, and status histories
-- =============================================================================

-- Seed Complaints
INSERT INTO public.complaints (
    ticket_number, student_id, category_id, subcategory_id, title, description,
    priority, status, department_id, assigned_faculty_id, custom_fields, created_at
)
SELECT 
    'CMP-2026-0050', s.id, cat.id, sub.id,
    'CS-301 Operating Systems: Incorrect Absent Marking on 04-Oct-2026',
    'I was present in the CS-301 lecture held in Room 204 on October 4th, 2026 and physically signed the teacher attendance roster. However, the student portal incorrectly recorded me as Absent. Kindly verify against the signed physical register.',
    'HIGH', 'UNDER_REVIEW', d.id, f.id,
    '{"course_name": "B.Tech Computer Engineering", "semester": 5, "subject_code": "CS-301 Operating Systems", "faculty_name": "Dr. Farhan Siddiqui", "attendance_date": "2026-10-04", "recorded_status": "Marked Absent", "complaint_type": "Incorrect Absent Marking"}'::jsonb,
    NOW() - INTERVAL '5 days'
FROM public.students s, public.service_categories cat, public.service_subcategories sub, public.departments d, public.faculty f
WHERE s.enrollment_number = 'GL1234'
  AND cat.name = 'Academic Services'
  AND sub.name = 'Attendance Discrepancy Dispute'
  AND d.code = 'CS'
  AND f.faculty_number = 'FAC-CS-104'
ON CONFLICT (ticket_number) DO NOTHING;

INSERT INTO public.complaints (
    ticket_number, student_id, category_id, subcategory_id, title, description,
    priority, status, department_id, custom_fields, created_at
)
SELECT 
    'CMP-2026-0042', s.id, cat.id, sub.id,
    'Intermittent Wi-Fi outage in CS Department 2nd Floor Labs',
    'The wireless access point in Lab 3 repeatedly disconnects during afternoon practical sessions. Signal drops completely under multi-device load.',
    'HIGH', 'UNDER_REVIEW', d.id,
    '{"location": "CS Department 2nd Floor Lab 3", "device_type": "Laptop", "frequency": "Daily afternoon"}'::jsonb,
    NOW() - INTERVAL '5 days'
FROM public.students s, public.service_categories cat, public.service_subcategories sub, public.departments d
WHERE s.enrollment_number = 'GL1234'
  AND cat.name = 'IT & Network Services'
  AND sub.name = 'Campus Wi-Fi / LAN Access Registration'
  AND d.code = 'CC'
ON CONFLICT (ticket_number) DO NOTHING;

INSERT INTO public.complaints (
    ticket_number, student_id, category_id, subcategory_id, title, description,
    priority, status, department_id, custom_fields, created_at, resolved_at
)
SELECT 
    'CMP-2026-0038', s.id, cat.id, sub.id,
    'Water cooler filtration unit leakage in North Hall Corridor',
    'The drinking water cooler near Room 48 has developed a continuous pipe leak causing water pooling in the corridor walkway.',
    'MEDIUM', 'RESOLVED', d.id,
    '{"hall_name": "Sir Syed Hall (North)", "location": "1st Floor Corridor near Room 48"}'::jsonb,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '2 days'
FROM public.students s, public.service_categories cat, public.service_subcategories sub, public.departments d
WHERE s.enrollment_number = 'GL1234'
  AND cat.name = 'Hostel & Accommodation'
  AND sub.name = 'Hostel Room & Corridor Maintenance'
  AND d.code = 'WORKS'
ON CONFLICT (ticket_number) DO NOTHING;

-- Seed Service Requests
INSERT INTO public.service_requests (
    request_number, student_id, subcategory_id, status, department_id, form_data, created_at
)
SELECT 
    'REQ-2026-0019', s.id, sub.id, 'IN_PROGRESS', d.id,
    '{"purpose": "Scholarship Application", "remarks": "Required for State Minority Higher Education Scholarship dossier submission"}'::jsonb,
    NOW() - INTERVAL '4 days'
FROM public.students s, public.service_subcategories sub, public.departments d
WHERE s.enrollment_number = 'GL1234'
  AND sub.name = 'Bonafide Student Certificate Request'
  AND d.code = 'PROCTOR'
ON CONFLICT (request_number) DO NOTHING;

INSERT INTO public.service_requests (
    request_number, student_id, subcategory_id, status, department_id, form_data, created_at, fulfilled_at
)
SELECT 
    'REQ-2026-0012', s.id, sub.id, 'FULFILLED', d.id,
    '{"device_type": "Laptop", "mac_address": "8C:85:90:3A:42:1B", "hostel_location": "Sir Syed Hall (North), Room 48"}'::jsonb,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '7 days'
FROM public.students s, public.service_subcategories sub, public.departments d
WHERE s.enrollment_number = 'GL1234'
  AND sub.name = 'Campus Wi-Fi / LAN Access Registration'
  AND d.code = 'CC'
ON CONFLICT (request_number) DO NOTHING;

-- Seed Status History for CMP-2026-0050
INSERT INTO public.status_history (complaint_id, actor_id, previous_status, new_status, public_remark, internal_note, created_at)
SELECT 
    c.id, u.id, 'SUBMITTED', 'UNDER_REVIEW',
    'Attendance in-charge ya teacher records verify kar raha hai (Case routed to Dr. Farhan Siddiqui).',
    'Subject teacher roster copy verified by lab technician; physically verifying register.',
    NOW() - INTERVAL '4 days'
FROM public.complaints c, public.users u
WHERE c.ticket_number = 'CMP-2026-0050' AND u.email = 'staff.cs@amu.ac.in';
