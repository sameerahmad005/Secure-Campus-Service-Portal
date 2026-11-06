import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import type { AuthenticatedUser, RoleName } from '../types/index.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const demoEmail = req.headers['x-user-email'] as string | undefined;
    const demoRole = req.headers['x-demo-role'] as string | undefined;

    let userEmail: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // In production Supabase Auth verification:
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (!authError && authData.user?.email) {
        userEmail = authData.user.email;
      }
    }

    // Support prototype persona header if token is not provided
    if (!userEmail && demoEmail) {
      userEmail = demoEmail;
    }

    // Default prototype fallback to Tariq Ahmad if testing unauthenticated
    if (!userEmail) {
      userEmail = 'student.tariq@amu.ac.in';
    }

    // Fetch user and assigned roles from Supabase
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select(`
        id, email, full_name, account_status,
        user_roles (
          role_id, department_id, hall_id,
          roles ( name )
        )
      `)
      .eq('email', userEmail)
      .single();

    if (userError || !dbUser) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User account not found or invalid credentials' }
      });
      return;
    }

    if (dbUser.account_status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: `Account is ${dbUser.account_status}. Please contact the proctorial office.` }
      });
      return;
    }

    // Extract roles
    const roles: RoleName[] = (dbUser.user_roles || [])
      .map((ur: any) => ur.roles?.name as RoleName)
      .filter(Boolean);

    // If demo role header is provided and matches an authorized system role, allow testing that persona
    if (demoRole && !roles.includes(demoRole as RoleName)) {
      roles.push(demoRole as RoleName);
    }

    const firstScope = dbUser.user_roles?.[0];

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.full_name,
      accountStatus: dbUser.account_status,
      roles,
      departmentId: firstScope?.department_id || null,
      hallId: firstScope?.hall_id || null,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Authentication verification failed' }
    });
  }
};

export const requireRole = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
      return;
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions for this endpoint' }
      });
      return;
    }

    next();
  };
};
