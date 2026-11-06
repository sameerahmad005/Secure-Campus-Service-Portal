import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getStudentProfile, updateStudentProfile } from '../controllers/studentController.js';

const router = Router();

router.use(authenticate);

// Student profile management
router.get('/profile', requireRole('STUDENT'), getStudentProfile);
router.patch('/profile', requireRole('STUDENT'), updateStudentProfile);

export default router;
