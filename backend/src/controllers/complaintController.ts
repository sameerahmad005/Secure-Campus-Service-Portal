import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const createComplaintSchema = z.object({
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional(),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  departmentId: z.string().uuid().optional(),
  customFields: z.record(z.any()).default({}),
});

const updateStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED', 'CLOSED']),
  publicRemark: z.string().optional(),
  internalNote: z.string().optional(),
});

export const getComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    // Segregation of duties: IT Admins manage system & audit logs, barred from viewing confidential student grievance dossiers
    if (user.roles.includes('IT_ADMIN') && !user.roles.some(r => r !== 'IT_ADMIN')) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'IT Administrators are barred from accessing student grievance dossiers per University Segregation of Duties policy.' }
      });
      return;
    }

    let query = supabase
      .from('complaints')
      .select(`
        id, ticket_number, title, description, status, priority, custom_fields,
        created_at, updated_at, resolved_at,
        service_categories ( id, name ),
        service_subcategories ( id, name ),
        departments ( id, code, name ),
        students ( id, enrollment_number, roll_number, full_name, email )
      `)
      .order('created_at', { ascending: false });

    // Role-based scoping
    if (user.roles.includes('STUDENT')) {
      // Find student record for this user
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

    const { data: complaints, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    const formatted = (complaints || []).map((c: any) => ({
      id: c.id,
      ticketNumber: c.ticket_number,
      trackingNumber: c.ticket_number,
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      category: c.service_categories?.name || 'OTHER',
      subcategory: c.service_subcategories,
      department: c.departments,
      departmentId: c.departments?.id || '',
      departmentName: c.departments?.name || 'General Maintenance & Services',
      student: user.roles.includes('STUDENT') ? undefined : c.students,
      studentId: c.students?.id || user.id,
      studentName: c.students?.full_name || user.fullName,
      studentEmail: c.students?.email || user.email,
      attachments: [],
      statusHistory: [],
      remarks: [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      resolvedAt: c.resolved_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getComplaintById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    if (user.roles.includes('IT_ADMIN') && !user.roles.some(r => r !== 'IT_ADMIN')) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'IT Administrators are barred from accessing student grievance dossiers.' }
      });
      return;
    }

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select(`
        id, ticket_number, title, description, status, priority, custom_fields,
        student_id, department_id, assigned_to,
        created_at, updated_at, resolved_at,
        service_categories ( id, name ),
        service_subcategories ( id, name ),
        departments ( id, code, name ),
        students ( id, user_id, enrollment_number, roll_number, full_name, email ),
        status_history (
          id, previous_status, new_status, public_remark, internal_note, created_at,
          actor:users!status_history_actor_id_fkey ( id, full_name )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !complaint) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
      return;
    }

    // Ownership check for students
    const isStudent = user.roles.includes('STUDENT');
    const studentUser: any = Array.isArray(complaint.students) ? complaint.students[0] : complaint.students;
    if (isStudent && studentUser?.user_id !== user.id) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to this complaint' } });
      return;
    }

    // Strip internal notes for students
    const filteredHistory = (complaint.status_history || []).map((h: any) => ({
      id: h.id,
      fromStatus: h.previous_status,
      toStatus: h.new_status,
      publicRemark: h.public_remark,
      internalNote: isStudent ? undefined : h.internal_note,
      createdAt: h.created_at,
      actorName: h.actor?.full_name || 'System',
    }));

    res.json({
      success: true,
      data: {
        id: complaint.id,
        ticketNumber: complaint.ticket_number,
        trackingNumber: complaint.ticket_number,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        priority: complaint.priority,
        category: complaint.service_categories,
        subcategory: complaint.service_subcategories,
        department: complaint.departments,
        student: isStudent ? undefined : complaint.students,
        history: filteredHistory,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
        resolvedAt: complaint.resolved_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const createComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    // Find student ID linked to this user
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentErr || !student) {
      res.status(400).json({ success: false, error: { code: 'STUDENT_REQUIRED', message: 'Only registered students can lodge complaints' } });
      return;
    }

    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid complaint submission', details: parsed.error.format() },
      });
      return;
    }

    // Find default department from subcategory if not provided
    let departmentId = parsed.data.departmentId;
    if (!departmentId) {
      // Default to Computer Science or first department
      const { data: defaultDept } = await supabase.from('departments').select('id').limit(1).single();
      departmentId = defaultDept?.id;
    }

    // Find default subcategory under category if not provided
    let subcategoryId = parsed.data.subcategoryId;
    if (!subcategoryId) {
      const { data: defaultSub } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('category_id', parsed.data.categoryId)
        .limit(1)
        .single();
      subcategoryId = defaultSub?.id;
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CMP-${currentYear}-${randomSuffix}`;

    const { data: newComplaint, error } = await supabase
      .from('complaints')
      .insert({
        ticket_number: ticketNumber,
        student_id: student.id,
        category_id: parsed.data.categoryId,
        subcategory_id: subcategoryId,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        department_id: departmentId,
        custom_fields: parsed.data.customFields || {},
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (error || !newComplaint) {
      res.status(400).json({ success: false, error: { code: 'CREATION_FAILED', message: error?.message || 'Failed to file complaint' } });
      return;
    }

    // Record initial status history
    await supabase.from('status_history').insert({
      complaint_id: newComplaint.id,
      actor_id: user.id,
      previous_status: 'NONE',
      new_status: 'SUBMITTED',
      public_remark: 'Grievance ticket registered and assigned tracking ID.',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        id: newComplaint.id,
        ticketNumber: newComplaint.ticket_number,
        trackingNumber: newComplaint.ticket_number,
        status: newComplaint.status,
        createdAt: newComplaint.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const canUpdate = user.roles.some(r => ['STAFF', 'FACULTY', 'DEPT_STAFF', 'HALL_STAFF', 'DSW', 'SRGC', 'MANAGEMENT', 'CHAIRMAN'].includes(r));
    if (!canUpdate) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only authorized staff and officials can update case status' } });
      return;
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status data', details: parsed.error.format() } });
      return;
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('complaints')
      .select('id, status, ticket_number')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
      return;
    }

    const updatePayload: Record<string, any> = {
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.status === 'RESOLVED' || parsed.data.status === 'CLOSED') {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { error: updateErr } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id);

    if (updateErr) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: updateErr.message } });
      return;
    }

    await supabase.from('status_history').insert({
      complaint_id: id,
      actor_id: user.id,
      previous_status: existing.status,
      new_status: parsed.data.status,
      public_remark: parsed.data.publicRemark || `Status transitioned to ${parsed.data.status}`,
      internal_note: parsed.data.internalNote || null,
    });

    res.json({
      success: true,
      message: `Complaint ${existing.ticket_number} status updated to ${parsed.data.status}`,
      data: {
        id,
        previousStatus: existing.status,
        newStatus: parsed.data.status,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
