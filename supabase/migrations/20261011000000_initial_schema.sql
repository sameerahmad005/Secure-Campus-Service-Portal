-- =============================================================================
-- Migration: 20261011000000_initial_schema.sql
-- Description: Core Schema for Secure Campus Service Portal (Aligarh Muslim University)
-- Engine: PostgreSQL 17 (Supabase Managed DB)
-- =============================================================================

-- Enable standard UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ORGANIZATIONAL & ACADEMIC CORE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    total_semesters INT NOT NULL CHECK (total_semesters >= 1 AND total_semesters <= 12),
    degree_level VARCHAR(32) NOT NULL DEFAULT 'UG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name VARCHAR(32) NOT NULL UNIQUE,
    start_year INT NOT NULL,
    end_year INT NOT NULL CHECK (end_year = start_year + 1),
    is_current BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    gender_scope VARCHAR(16) NOT NULL DEFAULT 'CO_ED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. USERS, ROLES & ACCESS CONTROL
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- -----------------------------------------------------------------------------
-- 3. STAKEHOLDER PROFILES: STUDENTS & FACULTY
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    enrollment_number VARCHAR(32) NOT NULL UNIQUE,
    roll_number VARCHAR(32) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(20),
    address TEXT, -- Nominal / Residential Address
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    admission_year INT NOT NULL CHECK (admission_year >= 1990 AND admission_year <= 2100),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
    current_semester INT NOT NULL DEFAULT 1 CHECK (current_semester >= 1),
    allotted_hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
        CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    faculty_number VARCHAR(32) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(16),
    appointment_type VARCHAR(32) NOT NULL DEFAULT 'PERMANENT'
        CHECK (appointment_type IN ('PERMANENT', 'GUEST', 'AD_HOC', 'CONTRACTUAL')),
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
        CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. SERVICE CATALOG
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.service_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    name VARCHAR(128) NOT NULL,
    target_department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    sla_days INT NOT NULL DEFAULT 3 CHECK (sla_days > 0),
    default_priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM'
        CHECK (default_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    form_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------------------------
-- 5. COMPLAINTS & SERVICE APPLICATIONS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(32) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    subcategory_id UUID NOT NULL REFERENCES public.service_subcategories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'REJECTED', 'CLOSED')),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(32) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    subcategory_id UUID NOT NULL REFERENCES public.service_subcategories(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'FULFILLED', 'REJECTED', 'CLOSED')),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fulfilled_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 6. ATTACHMENTS, STATUS HISTORY & FEEDBACK
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_attachments_target CHECK (
        (complaint_id IS NOT NULL AND service_request_id IS NULL) OR
        (complaint_id IS NULL AND service_request_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    previous_status VARCHAR(32) NOT NULL,
    new_status VARCHAR(32) NOT NULL,
    public_remark TEXT NOT NULL,
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_history_target CHECK (
        (complaint_id IS NOT NULL AND service_request_id IS NULL) OR
        (complaint_id IS NULL AND service_request_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
    service_request_id UUID UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_feedback_target CHECK (
        (complaint_id IS NOT NULL AND service_request_id IS NULL) OR
        (complaint_id IS NULL AND service_request_id IS NOT NULL)
    )
);

-- -----------------------------------------------------------------------------
-- 7. NOTIFICATIONS, NOTICES & AUDIT LOGS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'INFO'
        CHECK (type IN ('INFO', 'STATUS_CHANGE', 'ACTION_REQUIRED')),
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(32) NOT NULL
        CHECK (category IN ('ACADEMIC', 'MAINTENANCE', 'HOSTEL', 'GENERAL')),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON public.students(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_students_course_id ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON public.faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON public.faculty(department_id);

CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_department_status ON public.complaints(department_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON public.complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_faculty ON public.complaints(assigned_faculty_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_student_id ON public.service_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_requests_department_status ON public.service_requests(department_id, status);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON public.status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON public.status_history(service_request_id);
CREATE INDEX IF NOT EXISTS idx_attachments_complaint_id ON public.attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_attachments_request_id ON public.attachments(service_request_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for reference catalogs (accessible to authenticated users)
CREATE POLICY "Public read active departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read academic sessions" ON public.academic_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read halls" ON public.halls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read active service categories" ON public.service_categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Public read active service subcategories" ON public.service_subcategories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Public read published notices" ON public.notices FOR SELECT TO authenticated USING (is_published = true);

-- Student-specific data isolation policies
CREATE POLICY "Students can read own profile" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students can read own complaints" ON public.complaints FOR SELECT TO authenticated USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Students can lodge complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Students can read own requests" ON public.service_requests FOR SELECT TO authenticated USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Students can submit requests" ON public.service_requests FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
