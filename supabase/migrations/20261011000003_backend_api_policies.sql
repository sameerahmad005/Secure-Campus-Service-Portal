-- =============================================================================
-- Migration: 20261011000003_backend_api_policies.sql
-- Description: Configure RLS policies for Backend API operations & reference data
-- =============================================================================

-- 1. Grant SELECT on reference catalogs to anon and authenticated
CREATE POLICY "Allow anon read departments" ON public.departments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read courses" ON public.courses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read academic_sessions" ON public.academic_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read halls" ON public.halls FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read service_categories" ON public.service_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read service_subcategories" ON public.service_subcategories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read notices" ON public.notices FOR SELECT TO anon USING (true);

-- 2. Grant backend operations on identity & profiles
CREATE POLICY "Allow anon read users" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read roles" ON public.roles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read user_roles" ON public.user_roles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon access students" ON public.students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access faculty" ON public.faculty FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. Grant backend operations on workflows (Complaints, Requests, Status History)
CREATE POLICY "Allow anon access complaints" ON public.complaints FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access service_requests" ON public.service_requests FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access status_history" ON public.status_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access notifications" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);
