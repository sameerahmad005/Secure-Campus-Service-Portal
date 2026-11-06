import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getNotices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select(`
        id, title, content, target_audience, is_pinned, published_at,
        departments ( id, code, name )
      `)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_read, reference_id, reference_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, error: { code: 'QUERY_ERROR', message: error.message } });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
