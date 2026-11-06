import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, description, icon, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.query;

    let query = supabase
      .from('service_subcategories')
      .select(`
        id, category_id, name, target_department_id, sla_days, default_priority, form_schema, is_active,
        service_categories ( id, name )
      `)
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, code, name')
      .order('name');

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getHalls = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('halls')
      .select('id, code, name')
      .order('name');

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, code, name, total_semesters, degree_level,
        departments ( id, code, name )
      `)
      .order('name');

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
