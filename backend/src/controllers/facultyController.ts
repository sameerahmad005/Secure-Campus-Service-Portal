import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const updateFacultyProfileSchema = z.object({
  mobileNumber: z.string().max(20).optional(),
});

export const getFacultyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { data: faculty, error } = await supabase
      .from('faculty')
      .select(`
        id, user_id, faculty_number, full_name, email,
        mobile_number, date_of_birth, gender, appointment_type,
        account_status, created_at, updated_at,
        departments ( id, code, name )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !faculty) {
      res.status(404).json({
        success: false,
        error: { code: 'FACULTY_NOT_FOUND', message: 'No faculty profile linked to this user' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: faculty.id,
        userId: faculty.user_id,
        facultyNumber: faculty.faculty_number,
        fullName: faculty.full_name,
        email: faculty.email,
        mobileNumber: faculty.mobile_number,
        department: faculty.departments,
        // Only return sensitive fields if requested by the user themselves or authorized HR
        dateOfBirth: faculty.date_of_birth,
        gender: faculty.gender,
        appointmentType: faculty.appointment_type,
        accountStatus: faculty.account_status,
        createdAt: faculty.created_at,
        updatedAt: faculty.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const updateFacultyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const parsed = updateFacultyProfileSchema.safeParse(req.body);
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

    const { data: updated, error } = await supabase
      .from('faculty')
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
      message: 'Faculty profile updated successfully',
      data: {
        id: updated.id,
        mobileNumber: updated.mobile_number,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
