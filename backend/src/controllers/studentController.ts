import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  mobileNumber: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

export const getStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        id, user_id, enrollment_number, roll_number, full_name, email,
        mobile_number, address, father_name, mother_name, admission_year,
        current_semester, account_status, created_at, updated_at,
        courses ( id, code, name, total_semesters, degree_level ),
        academic_sessions ( id, session_name ),
        halls ( id, code, name )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !student) {
      res.status(404).json({
        success: false,
        error: { code: 'STUDENT_NOT_FOUND', message: 'No student profile linked to this user' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: student.id,
        userId: student.user_id,
        enrollmentNumber: student.enrollment_number,
        rollNumber: student.roll_number,
        fullName: student.full_name,
        email: student.email,
        mobileNumber: student.mobile_number,
        address: student.address,
        fatherName: student.father_name,
        motherName: student.mother_name,
        admissionYear: student.admission_year,
        course: student.courses,
        academicSession: student.academic_sessions,
        currentSemester: student.current_semester,
        allottedHall: student.halls || null,
        accountStatus: student.account_status,
        createdAt: student.created_at,
        updatedAt: student.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid profile update fields', details: parsed.error.format() },
      });
      return;
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.mobileNumber !== undefined) updatePayload.mobile_number = parsed.data.mobileNumber;
    if (parsed.data.address !== undefined) updatePayload.address = parsed.data.address;

    const { data: updated, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !updated) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error?.message || 'Update failed' } });
      return;
    }

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: {
        id: updated.id,
        mobileNumber: updated.mobile_number,
        address: updated.address,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
