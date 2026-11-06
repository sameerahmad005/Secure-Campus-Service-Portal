import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const createRequestSchema = z.object({
  subcategoryId: z.string().uuid(),
  formData: z.record(z.any()).default({}),
  departmentId: z.string().uuid().optional(),
});

export const getServiceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    let query = supabase
      .from('service_requests')
      .select(`
        id, request_number, status, form_data, created_at, updated_at, fulfilled_at,
        service_subcategories ( id, name, category_id ),
        departments ( id, code, name ),
        students ( id, enrollment_number, roll_number, full_name, email )
      `)
      .order('created_at', { ascending: false });

    if (user.roles.includes('STUDENT')) {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        res.json({ success: true, data: [] });
        return;
      }
      query = query.eq('student_id', student.id);
    } else if (user.roles.includes('DEPT_STAFF') && user.departmentId) {
      query = query.eq('department_id', user.departmentId);
    }

    const { data: requests, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    const formatted = (requests || []).map((r: any) => ({
      id: r.id,
      requestNumber: r.request_number,
      trackingNumber: r.request_number,
      serviceId: r.service_subcategories?.id || '',
      serviceTitle: r.service_subcategories?.name || 'Campus Service Request',
      status: r.status,
      formData: r.form_data,
      subcategory: r.service_subcategories,
      department: r.departments,
      departmentId: r.departments?.id || '',
      departmentName: r.departments?.name || 'General Administration',
      student: user.roles.includes('STUDENT') ? undefined : r.students,
      studentId: r.students?.id || user.id,
      studentName: r.students?.full_name || user.fullName,
      studentEmail: r.students?.email || user.email,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      fulfilledAt: r.fulfilled_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const createServiceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentErr || !student) {
      res.status(400).json({ success: false, error: { code: 'STUDENT_REQUIRED', message: 'Only registered students can apply for services' } });
      return;
    }

    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: parsed.error.format() },
      });
      return;
    }

    let departmentId = parsed.data.departmentId;
    if (!departmentId) {
      const { data: defaultDept } = await supabase.from('departments').select('id').limit(1).single();
      departmentId = defaultDept?.id;
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestNumber = `REQ-${currentYear}-${randomSuffix}`;

    const { data: newRequest, error } = await supabase
      .from('service_requests')
      .insert({
        request_number: requestNumber,
        student_id: student.id,
        subcategory_id: parsed.data.subcategoryId,
        form_data: parsed.data.formData,
        department_id: departmentId,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (error || !newRequest) {
      res.status(400).json({ success: false, error: { code: 'CREATION_FAILED', message: error?.message || 'Failed to submit service request' } });
      return;
    }

    // Record initial status history
    await supabase.from('status_history').insert({
      service_request_id: newRequest.id,
      actor_id: user.id,
      previous_status: 'NONE',
      new_status: 'SUBMITTED',
      public_remark: 'Service application submitted.',
    });

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: {
        id: newRequest.id,
        requestNumber: newRequest.request_number,
        trackingNumber: newRequest.request_number,
        status: newRequest.status,
        createdAt: newRequest.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
